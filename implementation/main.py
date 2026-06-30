from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
from PIL import Image
import io
import torch
from model_manager import manager
from investigation_indexer import build_case_file  # Import our new script
import traceback


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: load all model versions into memory
    manager.load_models()
    yield
    # Shutdown: nothing to clean up for now


app = FastAPI(title="Forensic Search API", lifespan=lifespan)


# --- Shared helper: turn raw model output into a normalized 512-dim vector ---
def _project_and_normalize_image(model, img_feat):
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

    return img_feat / img_feat.norm(dim=-1, keepdim=True)


def _load_investigation_vectors(investigation_id: int, model_version: str):
    try:
        vector_file = f"./investigation_data/{investigation_id}_{model_version}.pt"
        data = torch.load(vector_file, weights_only=False)
        return data["vectors"].to(manager.device), data["filenames"]
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Investigation vectors not found.")


def _rank_matches(scores, filenames, image_vectors, top_k=5):
    # Clamp the requested count to a sensible range and to the gallery size.
    top_k = max(1, min(int(top_k), len(image_vectors)))
    top_scores, top_indices = torch.topk(scores, top_k)
    return [
        {"filename": filenames[idx], "match_score": float(score)}
        for score, idx in zip(top_scores, top_indices)
    ]


# --- 1. THE INDEXING ENDPOINT ---
class IndexRequest(BaseModel):
    investigationId: int
    imageDirPath: str  # .NET will tell Python where the images are saved


@app.post("/api/index")
async def index_images(request: IndexRequest):
    try:
        filenames = build_case_file(request.investigationId, request.imageDirPath)
        return {
            "status": "success",
            "investigationId": request.investigationId,
            "images_processed": len(filenames)
        }
    except Exception as e:
        traceback.print_exc()  # <--- THIS WILL PRINT THE EXACT ERROR IN THE TERMINAL
        raise HTTPException(status_code=500, detail=str(e))


# --- 2. THE TEXT SEARCH ENDPOINT ---
class SearchRequest(BaseModel):
    investigationId: int
    query: str
    model: str = "epoch_3"
    metric: str = "cosine"
    topK: int = 5  # how many matches to return


@app.post("/api/search")
async def search_suspects(request: SearchRequest):
    model = manager.get_model(request.model)
    processor = manager.get_processor()

    if not model:
        raise HTTPException(status_code=400, detail=f"Model {request.model} not loaded.")

    try:
        # 1. Text to Vector
        inputs = processor(text=[request.query], return_tensors="pt", padding=True)
        inputs = {k: v.to(manager.device) for k, v in inputs.items()}

        with torch.no_grad():
            txt_feat = model.get_text_features(**inputs)

            # --- HUGGING FACE QUIRK FIX ---
            if not isinstance(txt_feat, torch.Tensor):
                if hasattr(txt_feat, 'text_embeds') and txt_feat.text_embeds is not None:
                    txt_feat = txt_feat.text_embeds
                elif hasattr(txt_feat, 'pooler_output') and txt_feat.pooler_output is not None:
                    txt_feat = txt_feat.pooler_output

            # Only apply projection if it hasn't been applied yet
            if hasattr(model, 'text_projection') and txt_feat.shape[-1] != 512:
                txt_feat = model.text_projection(txt_feat)
            # ------------------------------

            txt_feat = txt_feat / txt_feat.norm(dim=-1, keepdim=True)

        # 2. Load the Investigation Data (Now includes filenames!)
        image_vectors, filenames = _load_investigation_vectors(request.investigationId, request.model)

        # 3. Math (Cosine / Euclidean)
        if request.metric == "cosine":
            scores = torch.matmul(txt_feat, image_vectors.T).squeeze(0)
        elif request.metric == "euclidean":
            distances = torch.cdist(txt_feat, image_vectors).squeeze(0)
            scores = -distances
        else:
            raise HTTPException(status_code=400, detail="Invalid metric selected.")

        # 4 & 5. Top-K matches with exact filenames
        results = _rank_matches(scores, filenames, image_vectors, request.topK)

        return {"investigationId": request.investigationId, "matches": results}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# --- 3. THE IMAGE-TO-IMAGE SEARCH ENDPOINT ---
@app.post("/api/search-by-image")
async def search_by_image(
    investigationId: int = Form(...),
    queryImage: UploadFile = File(...),
    model: str = Form("epoch_3"),
    metric: str = Form("cosine"),
    topK: int = Form(5),
):
    clip_model = manager.get_model(model)
    processor = manager.get_processor()

    if not clip_model:
        raise HTTPException(status_code=400, detail=f"Model {model} not loaded.")

    try:
        # 1. Read uploaded image bytes and preprocess
        raw = await queryImage.read()
        image = Image.open(io.BytesIO(raw)).convert("RGB")

        inputs = processor(images=[image], return_tensors="pt")
        inputs = {k: v.to(manager.device) for k, v in inputs.items()}

        # 2. Extract + normalize 512-dim image embedding
        with torch.no_grad():
            img_feat = clip_model.get_image_features(**inputs)
            query_feat = _project_and_normalize_image(clip_model, img_feat)

        # 3. Load the Investigation Data
        image_vectors, filenames = _load_investigation_vectors(investigationId, model)

        # 4. Math (Cosine / Euclidean)
        if metric == "cosine":
            scores = torch.matmul(query_feat, image_vectors.T).squeeze(0)
        elif metric == "euclidean":
            distances = torch.cdist(query_feat, image_vectors).squeeze(0)
            scores = -distances
        else:
            raise HTTPException(status_code=400, detail="Invalid metric selected.")

        # 5. Top-K matches
        results = _rank_matches(scores, filenames, image_vectors, topK)

        return {"investigationId": investigationId, "matches": results}

    except HTTPException:
        raise
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
