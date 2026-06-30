"""
evaluate_recall.py
------------------
Computes text-to-image retrieval Recall@K for one or more fine-tuned CLIP
checkpoints on the CelebA dataset, so the fine-tuned models can be compared
against the pre-trained baseline (epoch_0).

WHERE TO RUN
    Run this on Kaggle (or wherever CelebA + your model checkpoints live).
    It needs the CelebA attribute annotations and the aligned images.

WHAT "RECALL@K" MEANS HERE
    For every test image we build a caption from its CelebA attributes, encode
    the caption with the CLIP text encoder, and rank ALL test images by
    similarity. Recall@K is the fraction of queries for which the image that the
    caption actually describes appears within the top-K retrieved images.
    Higher is better. Comparing epoch_0 (baseline) with the fine-tuned
    checkpoints quantifies the benefit of fine-tuning.

IMPORTANT
    The caption-generation function below (make_caption) MUST match the rules
    used by your training CelebADataset for the numbers to be representative.
    Replace its body with your exact rule-based generator if it differs.

USAGE
    python evaluate_recall.py \
        --attr   /kaggle/input/celeba-dataset/list_attr_celeba.csv \
        --images /kaggle/input/celeba-dataset/img_align_celeba/img_align_celeba \
        --models epoch_0=openai/clip-vit-base-patch32 epoch_3=./models/epoch_3 epoch_8=./models/epoch_8 \
        --num 2000 --ks 1 5 10
"""

import argparse
import os
import csv
import torch
from PIL import Image
from transformers import CLIPModel, CLIPProcessor

# Standard CelebA attribute order (list_attr_celeba header), 40 attributes.
ATTRS = [
    "5_o_Clock_Shadow", "Arched_Eyebrows", "Attractive", "Bags_Under_Eyes", "Bald",
    "Bangs", "Big_Lips", "Big_Nose", "Black_Hair", "Blond_Hair", "Blurry", "Brown_Hair",
    "Bushy_Eyebrows", "Chubby", "Double_Chin", "Eyeglasses", "Goatee", "Gray_Hair",
    "Heavy_Makeup", "High_Cheekbones", "Male", "Mouth_Slightly_Open", "Mustache",
    "Narrow_Eyes", "No_Beard", "Oval_Face", "Pale_Skin", "Pointy_Nose",
    "Receding_Hairline", "Rosy_Cheeks", "Sideburns", "Smiling", "Straight_Hair",
    "Wavy_Hair", "Wearing_Earrings", "Wearing_Hat", "Wearing_Lipstick",
    "Wearing_Necklace", "Wearing_Necktie", "Young",
]


def make_caption(a):
    """Rule-based attribute -> natural-language caption.
    `a` is a dict {attr_name: 1/0}. REPLACE with your CelebADataset rules if different."""
    person = "a man" if a.get("Male", 0) == 1 else "a woman"
    if a.get("Young", 0) == 1:
        person = "a young " + person.split(" ", 1)[1]
    parts = []
    # hair
    for hair, label in [("Black_Hair", "black hair"), ("Blond_Hair", "blond hair"),
                        ("Brown_Hair", "brown hair"), ("Gray_Hair", "gray hair")]:
        if a.get(hair, 0) == 1:
            parts.append(label); break
    if a.get("Bald", 0) == 1:
        parts.append("who is bald")
    # facial hair
    if a.get("No_Beard", 0) == 0:
        parts.append("with a beard")
    if a.get("Mustache", 0) == 1:
        parts.append("with a mustache")
    if a.get("Goatee", 0) == 1:
        parts.append("with a goatee")
    # accessories / other
    if a.get("Eyeglasses", 0) == 1:
        parts.append("wearing eyeglasses")
    if a.get("Wearing_Hat", 0) == 1:
        parts.append("wearing a hat")
    if a.get("Smiling", 0) == 1:
        parts.append("smiling")
    caption = person + (", " + ", ".join(parts) if parts else "")
    return "a photo of " + caption


def load_celeba(attr_path, limit=None):
    """Reads list_attr_celeba (.csv or original .txt). Returns [(filename, attr_dict), ...]."""
    rows = []
    is_csv = attr_path.lower().endswith(".csv")
    with open(attr_path, "r") as f:
        if is_csv:
            reader = csv.reader(f)
            header = next(reader)
            cols = header[1:]
            for r in reader:
                fn = r[0]
                vals = {c: (1 if int(v) == 1 else 0) for c, v in zip(cols, r[1:])}
                rows.append((fn, vals))
                if limit and len(rows) >= limit:
                    break
        else:
            n = int(f.readline().strip())
            cols = f.readline().split()
            for line in f:
                p = line.split()
                fn, vals = p[0], {c: (1 if int(v) == 1 else 0) for c, v in zip(cols, p[1:])}
                rows.append((fn, vals))
                if limit and len(rows) >= limit:
                    break
    return rows


# Hugging Face quirk fix: get_*_features may return a structured output object
# rather than a tensor. Mirror the exact logic used by the deployed main.py.
def _extract(model, feat, kind):
    if not isinstance(feat, torch.Tensor):
        emb_attr = "image_embeds" if kind == "image" else "text_embeds"
        if hasattr(feat, emb_attr) and getattr(feat, emb_attr) is not None:
            feat = getattr(feat, emb_attr)
        elif hasattr(feat, "pooler_output") and feat.pooler_output is not None:
            feat = feat.pooler_output
    proj = "visual_projection" if kind == "image" else "text_projection"
    if hasattr(model, proj) and isinstance(feat, torch.Tensor) and feat.shape[-1] != 512:
        feat = getattr(model, proj)(feat)
    return feat / feat.norm(dim=-1, keepdim=True)


@torch.no_grad()
def embed_images(model, proc, paths, device, bs=64):
    feats = []
    for i in range(0, len(paths), bs):
        imgs = [Image.open(p).convert("RGB") for p in paths[i:i + bs]]
        inp = proc(images=imgs, return_tensors="pt").to(device)
        f = _extract(model, model.get_image_features(**inp), "image")
        feats.append(f.cpu())
        for im in imgs:
            im.close()
    return torch.cat(feats)


@torch.no_grad()
def embed_texts(model, proc, texts, device, bs=128):
    feats = []
    for i in range(0, len(texts), bs):
        inp = proc(text=texts[i:i + bs], return_tensors="pt", padding=True, truncation=True).to(device)
        f = _extract(model, model.get_text_features(**inp), "text")
        feats.append(f.cpu())
    return torch.cat(feats)


def recall_at_k(text_feats, image_feats, ks):
    sims = text_feats @ image_feats.T            # (N, N); row i = caption i vs all images
    n = sims.size(0)
    ranks = sims.argsort(dim=1, descending=True)
    gt = torch.arange(n).unsqueeze(1)            # correct image for caption i is image i
    pos = (ranks == gt).nonzero()[:, 1]          # rank position of the correct image
    return {k: float((pos < k).float().mean()) * 100 for k in ks}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--attr", required=True, help="path to list_attr_celeba.csv or .txt")
    ap.add_argument("--images", required=True, help="folder containing CelebA images")
    ap.add_argument("--models", nargs="+", required=True, help="name=path pairs")
    ap.add_argument("--num", type=int, default=2000, help="number of test images to evaluate")
    ap.add_argument("--ks", nargs="+", type=int, default=[1, 5, 10])
    args = ap.parse_args()

    device = "cuda" if torch.cuda.is_available() else "cpu"
    proc = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")

    rows = load_celeba(args.attr, limit=args.num)
    paths = [os.path.join(args.images, fn) for fn, _ in rows]
    captions = [make_caption(a) for _, a in rows]
    print(f"Evaluating {len(rows)} images on {device}. Example caption: {captions[0]!r}\n")

    print(f"{'Model':<12}" + "".join(f"R@{k:<8}" for k in args.ks))
    print("-" * (12 + 9 * len(args.ks)))
    for spec in args.models:
        name, path = spec.split("=", 1)
        model = CLIPModel.from_pretrained(path).to(device).eval()
        img_f = embed_images(model, proc, paths, device)
        txt_f = embed_texts(model, proc, captions, device)
        r = recall_at_k(txt_f, img_f, args.ks)
        print(f"{name:<12}" + "".join(f"{r[k]:<9.2f}" for k in args.ks))
        del model
        if device == "cuda":
            torch.cuda.empty_cache()


if __name__ == "__main__":
    main()
