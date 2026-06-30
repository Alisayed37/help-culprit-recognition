import os
import torch
from PIL import Image
from model_manager import manager

def build_case_file(investigation_id: int, image_dir: str, save_dir: str = "./investigation_data"):
    """
    Reads all suspect photos in a folder, converts them to vectors for ALL loaded models,
    and saves the database files for the investigation.

    Memory-friendly: images are loaded lazily, one batch at a time, and each PIL image is
    closed immediately after it has been encoded so we never hold the whole dataset in RAM.
    """
    if not os.path.exists(image_dir):
        raise FileNotFoundError(f"Image folder not found: {image_dir}")

    os.makedirs(save_dir, exist_ok=True)

    # 1. Get all valid images in the folder and sort them alphabetically
    valid_exts = {".jpg", ".jpeg", ".png"}
    filenames = [f for f in os.listdir(image_dir) if os.path.splitext(f)[1].lower() in valid_exts]
    filenames.sort()

    if not filenames:
        raise ValueError("No images found in the specified directory.")

    processor = manager.get_processor()
    device = manager.device
    batch_size = 32  # Process 32 images at a time to protect RAM

    print(f"Found {len(filenames)} images.")

    # 2. Loop through every model version (Epoch 0, 3, 4, 8)
    for version, model in manager.models.items():
        print(f"Converting images using {version}...")
        all_vectors = []

        with torch.no_grad():
            # Process in safe batches — load images only for the current batch
            for i in range(0, len(filenames), batch_size):
                batch_names = filenames[i:i + batch_size]

                # Lazy-load just this batch
                batch_imgs = [
                    Image.open(os.path.join(image_dir, f)).convert("RGB")
                    for f in batch_names
                ]

                # Pre-process and send to GPU/CPU
                inputs = processor(images=batch_imgs, return_tensors="pt")
                inputs = {k: v.to(device) for k, v in inputs.items()}

                # Extract 512-dim vectors and normalize them
                img_feat = model.get_image_features(**inputs)

                # --- HUGGING FACE QUIRK FIX ---
                if not isinstance(img_feat, torch.Tensor):
                    if hasattr(img_feat, 'image_embeds') and img_feat.image_embeds is not None:
                        img_feat = img_feat.image_embeds
                    elif hasattr(img_feat, 'pooler_output') and img_feat.pooler_output is not None:
                        img_feat = img_feat.pooler_output

                # Only apply projection if it hasn't been applied yet
                if hasattr(model, 'visual_projection') and img_feat.shape[-1] != 512:
                    img_feat = model.visual_projection(img_feat)
                # ------------------------------

                img_feat = img_feat / img_feat.norm(dim=-1, keepdim=True)

                all_vectors.append(img_feat.cpu())

                # Free the PIL images for this batch before moving on
                for im in batch_imgs:
                    im.close()
                del batch_imgs, inputs, img_feat

        # 3. Glue all the batches together into one giant tensor matrix
        final_tensor = torch.cat(all_vectors, dim=0)

        # 4. Save to disk. We save a dictionary containing both the math AND the filenames!
        save_path = os.path.join(save_dir, f"{investigation_id}_{version}.pt")
        torch.save({
            "filenames": filenames,
            "vectors": final_tensor
        }, save_path)

        print(f"[OK] Saved {version} database to {save_path}")

    return filenames
