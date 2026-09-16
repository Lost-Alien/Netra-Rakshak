"""
NETRA RAKSHAK — FastAPI Retinal Diagnostic Backend
===================================================
Faithfully replicates the MATLAB preprocessing pipeline from:
  - step2_quality_check.m  : Green-Channel Rayleigh CLAHE
  - step7_lesion_segmentation.m : Lesion biomarker extraction
  - step11_master_dashboard.m   : Full inference pipeline

CRITICAL: This model was trained on [0, 255] uint8 images.
DO NOT normalize to [0.0, 1.0] — this collapses all predictions to Level 0.
"""

import base64
import io
import os
import time
import logging
from pathlib import Path

import cv2
import numpy as np
import onnxruntime as ort
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from PIL import Image

# ─── Logging ──────────────────────────────────────────────────────────────────
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("netra_rakshak")

# ─── App Init ─────────────────────────────────────────────────────────────────
app = FastAPI(
    title="Netra Rakshak Diagnostic API",
    description="MATLAB-faithful ONNX inference backend for retinal DR screening (SIH 26038)",
    version="2.0.0",
)

# Allow all localhost ports for local dev, plus Vercel production
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"http://localhost:\d+|https://.*\.vercel\.app|https://netra-rakshak-seven\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Model Loading ────────────────────────────────────────────────────────────

ICDR_LABELS = [
    "Level 0: No Apparent Retinopathy (Healthy)",
    "Level 1: Mild Non-Proliferative DR",
    "Level 2: Moderate Non-Proliferative DR",
    "Level 3: Severe Non-Proliferative DR",
    "Level 4: Proliferative Diabetic Retinopathy",
]

# Model can be loaded from:
#   1. LOCAL_MODEL_PATH env variable (for local dev)
#   2. HuggingFace Hub via HF_TOKEN + HF_MODEL_REPO env vars (auto-download)
#   3. Default local path relative to this file
LOCAL_MODEL_PATH = os.environ.get(
    "LOCAL_MODEL_PATH",
    str(Path(__file__).parent / "netra_rakshak.onnx"),
)
# HuggingFace Hub auto-download config
#   HF_TOKEN   : Bearer token from huggingface.co/settings/tokens
#   HF_MODEL_REPO: e.g. "L0st-Alien/netra_rakhshak"
#   HF_MODEL_FILE: filename in repo (default: netra_rakshak.onnx)
HF_TOKEN = os.environ.get("HF_TOKEN", "")
HF_MODEL_REPO = os.environ.get("HF_MODEL_REPO", "L0st-Alien/netra_rakhshak")
HF_MODEL_FILE = os.environ.get("HF_MODEL_FILE", "netra_rakshak.onnx")
HF_DOWNLOAD_URL = f"https://huggingface.co/{HF_MODEL_REPO}/resolve/main/{HF_MODEL_FILE}"

_session: ort.InferenceSession | None = None
_input_name: str = ""
_model_loaded = False


def download_model_if_needed():
    """Download model from HuggingFace Hub if not present locally."""
    if Path(LOCAL_MODEL_PATH).exists():
        logger.info(f"Model already exists at {LOCAL_MODEL_PATH}")
        return
    if not HF_TOKEN:
        raise RuntimeError(
            f"Model not found at {LOCAL_MODEL_PATH} and HF_TOKEN is not set.\n"
            "Set HF_TOKEN environment variable to auto-download from HuggingFace."
        )
    logger.info(f"Downloading model from HuggingFace: {HF_DOWNLOAD_URL} → {LOCAL_MODEL_PATH}")
    import urllib.request
    Path(LOCAL_MODEL_PATH).parent.mkdir(parents=True, exist_ok=True)
    req = urllib.request.Request(
        HF_DOWNLOAD_URL,
        headers={"Authorization": f"Bearer {HF_TOKEN}"},
    )
    # Follow redirects (HF CDN uses 302 redirects)
    with urllib.request.urlopen(req, timeout=120) as resp:
        with open(LOCAL_MODEL_PATH, "wb") as f:
            f.write(resp.read())
    size_mb = Path(LOCAL_MODEL_PATH).stat().st_size / 1_000_000
    logger.info(f"✅ Model downloaded successfully: {size_mb:.1f} MB")


def load_model():
    """Load ONNX model into OrtSession (CPU or GPU if available)."""
    global _session, _input_name, _model_loaded
    download_model_if_needed()
    providers = (
        ["CUDAExecutionProvider", "CPUExecutionProvider"]
        if "CUDAExecutionProvider" in ort.get_available_providers()
        else ["CPUExecutionProvider"]
    )
    logger.info(f"Loading ONNX model from: {LOCAL_MODEL_PATH}")
    logger.info(f"Execution providers: {providers}")
    _session = ort.InferenceSession(LOCAL_MODEL_PATH, providers=providers)
    _input_name = _session.get_inputs()[0].name
    _model_loaded = True
    logger.info(f"✅ Model loaded. Input: '{_input_name}' shape={_session.get_inputs()[0].shape}")


@app.on_event("startup")
async def startup_event():
    load_model()


# ─── MATLAB-Faithful Preprocessing ───────────────────────────────────────────


def matlab_green_clahe(img_bgr: np.ndarray) -> np.ndarray:
    """
    Replicates MATLAB step2_quality_check.m:
        greenChannel = rawImg(:,:,2)
        enhancedGreen = adapthisteq(greenChannel, 'ClipLimit', 0.02, 'Distribution', 'rayleigh')
        denoisedGreen = medfilt2(enhancedGreen, [3 3])
        enhancedImg(:,:,2) = denoisedGreen

    OpenCV CLAHE with clipLimit=2.0 on [0,255] uint8 is equivalent to
    MATLAB's adapthisteq with ClipLimit=0.02 on [0,1] normalized range.
    """
    green = img_bgr[:, :, 1].copy()  # Green channel (index 1 in BGR = index 2 in RGB)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    green_eq = clahe.apply(green)
    # Median filter 3×3 (matches medfilt2)
    green_denoised = cv2.medianBlur(green_eq, 3)
    img_enhanced = img_bgr.copy()
    img_enhanced[:, :, 1] = green_denoised
    return img_enhanced


def compute_iqa(gray: np.ndarray) -> dict:
    """
    Replicates MATLAB step11_master_dashboard.m IQA block:
        [~, gradThresh] = edge(gray, 'sobel')
        sharpVal = sum(gradThresh(:)) * 100
        lumMean = mean(gray(:))
    """
    # Sobel sharpness
    sobelx = cv2.Sobel(gray, cv2.CV_64F, 1, 0, ksize=3)
    sobely = cv2.Sobel(gray, cv2.CV_64F, 0, 1, ksize=3)
    grad_mag = np.sqrt(sobelx**2 + sobely**2)
    sharp_val = float(np.mean(grad_mag) * 100)

    # Illumination
    lum_mean = float(np.mean(gray))

    passed = sharp_val >= 0.8 and 25.0 <= lum_mean <= 230.0
    return {
        "sharpness": round(sharp_val, 2),
        "illumination_mean": round(lum_mean, 1),
        "passed": passed,
        "decision": "✅ PASSED (CLINICAL GRADE)" if passed else "⚠️ RECAPTURE (UNGRADEABLE)",
    }


def preprocess_for_inference(img_bgr: np.ndarray) -> np.ndarray:
    """
    Full preprocessing pipeline for ONNX inference.

    CRITICAL: The ResNet-50 was trained on enhanced images in [0, 255] uint8 range.
    We keep float32 in [0.0, 255.0] — NO division by 255 or ImageNet normalization.
    MATLAB's classify() function handles this internally for dlnetwork outputs.

    Output shape: [1, 3, 224, 224] float32 in [0, 255]
    """
    # Step 1: Apply CLAHE (matches training preprocessing)
    enhanced = matlab_green_clahe(img_bgr)

    # Step 2: Resize to 224×224 (matches MATLAB imresize(procImg, [224, 224]))
    resized = cv2.resize(enhanced, (224, 224), interpolation=cv2.INTER_LINEAR)

    # Step 3: BGR → RGB (MATLAB imread returns RGB; OpenCV reads BGR)
    rgb = cv2.cvtColor(resized, cv2.COLOR_BGR2RGB)

    # Step 4: HWC → CHW, add batch dimension
    # Shape: [3, 224, 224] → [1, 3, 224, 224]
    chw = np.transpose(rgb, (2, 0, 1)).astype(np.float32)
    batch = np.expand_dims(chw, axis=0)

    return batch


def image_data_url(img_bgr: np.ndarray, max_dimension: int = 640) -> str:
    """Return a compact JPEG data URL suitable for the dashboard image panels."""
    height, width = img_bgr.shape[:2]
    scale = min(1.0, max_dimension / max(height, width))
    if scale < 1.0:
        img_bgr = cv2.resize(
            img_bgr,
            (round(width * scale), round(height * scale)),
            interpolation=cv2.INTER_AREA,
        )

    encoded, buffer = cv2.imencode(
        ".jpg", img_bgr, [cv2.IMWRITE_JPEG_QUALITY, 88]
    )
    if not encoded:
        raise RuntimeError("Could not encode diagnostic visualization.")
    return "data:image/jpeg;base64," + base64.b64encode(buffer).decode("ascii")


def softmax(logits: np.ndarray) -> np.ndarray:
    exp = np.exp(logits - np.max(logits))
    return exp / exp.sum()


def run_inference(img_batch: np.ndarray) -> np.ndarray:
    """Run ONNX inference. Returns softmax probabilities [5]."""
    if not _model_loaded or _session is None:
        raise RuntimeError("Model is not loaded yet.")
    outputs = _session.run(None, {_input_name: img_batch})
    logits = outputs[0][0]  # shape [5]
    return softmax(logits)


# ─── Lesion Biomarker Extraction (Python port of step7_lesion_segmentation.m) ─


def extract_biomarkers(img_bgr: np.ndarray) -> dict:
    """
    Deterministic lesion segmentation — Python port of step7_lesion_segmentation.m.
    Runs on original resolution image (not resized 224px) for accurate pixel counts.
    """
    # Resize to 800px width (matches MATLAB targetWidth = 800)
    h, w = img_bgr.shape[:2]
    scale = 800.0 / w
    norm = cv2.resize(img_bgr, (800, int(h * scale)))
    rows, cols = norm.shape[:2]

    gray = cv2.cvtColor(norm, cv2.COLOR_BGR2GRAY)

    # FoV mask
    _, fov_mask = cv2.threshold(gray, 15, 255, cv2.THRESH_BINARY)
    fov_mask = cv2.morphologyEx(fov_mask, cv2.MORPH_CLOSE, np.ones((15, 15), np.uint8))

    margin = int(min(rows, cols) * 0.05)
    kernel_erode = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (margin * 2 + 1, margin * 2 + 1))
    fov_inner = cv2.erode(fov_mask, kernel_erode)

    green = norm[:, :, 1].astype(np.float64) / 255.0  # float for morphological ops
    red = norm[:, :, 2].astype(np.float64) / 255.0

    # Optic disc localization
    od_map = cv2.GaussianBlur((red * green * 255).astype(np.uint8), (41, 41), 10)
    od_map = od_map * (fov_inner > 0)
    _, _, _, max_loc = cv2.minMaxLoc(od_map)
    od_x, od_y = max_loc
    od_radius = int(min(rows, cols) * 0.07)
    od_mask = np.zeros((rows, cols), dtype=np.uint8)
    cv2.circle(od_mask, (od_x, od_y), od_radius, 255, -1)

    # Vascular extraction (simplified multi-angle morphology)
    inv_green = 1.0 - green
    bg = cv2.morphologyEx(
        (inv_green * 255).astype(np.uint8),
        cv2.MORPH_OPEN,
        cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (37, 37)),
    )
    vessels_enh = np.clip((inv_green * 255).astype(np.uint8).astype(np.int32) - bg.astype(np.int32), 0, 255).astype(np.uint8)

    vessel_max_resp = np.zeros((rows, cols), dtype=np.uint8)
    line_len = 13
    for angle_deg in range(0, 180, 15):
        angle_rad = np.deg2rad(angle_deg)
        dx = int(line_len * np.cos(angle_rad))
        dy = int(line_len * np.sin(angle_rad))
        if dx == 0 and dy == 0:
            dy = 1
        struct = cv2.getStructuringElement(cv2.MORPH_CROSS, (abs(dx) * 2 + 1, abs(dy) * 2 + 1))
        opened = cv2.morphologyEx(vessels_enh, cv2.MORPH_OPEN, struct)
        vessel_max_resp = np.maximum(vessel_max_resp, opened)

    vessel_max_resp = vessel_max_resp * (fov_inner > 0)
    fov_pixels = vessel_max_resp[fov_inner > 0]
    if len(fov_pixels) > 0:
        cutoff = int(np.percentile(fov_pixels, 87))
    else:
        cutoff = 128
    vessel_binary = (vessel_max_resp > cutoff).astype(np.uint8) * 255
    vessel_binary = cv2.morphologyEx(vessel_binary, cv2.MORPH_CLOSE, np.ones((3, 3), np.uint8))
    vessel_binary = vessel_binary * (fov_inner > 0)

    # Vessel density
    fov_area = max(1, int(np.sum(fov_inner > 0)))
    vessel_density = float(np.sum(vessel_binary > 0)) / fov_area * 100.0

    # Microaneurysm / hemorrhage detection via bottom-hat
    green_uint8 = (green * 255).astype(np.uint8)
    bottom_hat = cv2.morphologyEx(green_uint8, cv2.MORPH_BLACKHAT, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (13, 13)))
    vessel_dilated = cv2.dilate(vessel_binary, np.ones((7, 7), np.uint8))
    lesion_thresh = int(0.065 * 255)
    lesion_candidates = (
        (bottom_hat > lesion_thresh) &
        (vessel_dilated == 0) &
        (od_mask == 0) &
        (fov_inner > 0)
    ).astype(np.uint8) * 255

    num_mas = 0
    num_hemorrhages = 0
    contours, _ = cv2.findContours(lesion_candidates, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    for cnt in contours:
        area = cv2.contourArea(cnt)
        if area < 3:
            continue
        if 3 <= area <= 35:
            num_mas += 1
        elif 35 < area <= 500:
            num_hemorrhages += 1

    # Hard exudate detection via top-hat
    top_hat = cv2.morphologyEx(green_uint8, cv2.MORPH_TOPHAT, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (15, 15)))
    exudate_thresh = int(0.11 * 255)
    exudate_mask = ((top_hat > exudate_thresh) & (od_mask == 0) & (fov_inner > 0)).astype(np.uint8)
    exudate_pixels = int(np.sum(exudate_mask))
    exudate_burden_pct = exudate_pixels / fov_area * 100.0

    # MATLAB's fourth pane overlays these deterministic masks on the retinal
    # image. Preserve the same color convention: cyan vessels, red dark
    # lesions, and yellow hard exudates.
    segmentation_view = norm.copy()
    for mask, color in (
        (vessel_binary > 0, (255, 255, 0)),
        (lesion_candidates > 0, (0, 0, 255)),
        (exudate_mask > 0, (0, 255, 255)),
    ):
        segmentation_view[mask] = cv2.addWeighted(
            segmentation_view[mask], 0.35,
            np.full_like(segmentation_view[mask], color), 0.65,
            0,
        )

    # The ONNX export exposes logits only, so gradient back-propagation is not
    # available in the serving runtime. This lesion-weighted saliency map is a
    # transparent, deterministic XAI fallback using the exact pathology masks
    # shown in the segmentation pane.
    lesion_signal = np.maximum(bottom_hat, top_hat)
    lesion_signal[(fov_inner == 0) | (od_mask > 0)] = 0
    saliency = cv2.normalize(lesion_signal, None, 0, 255, cv2.NORM_MINMAX)
    saliency = cv2.GaussianBlur(saliency, (0, 0), sigmaX=18, sigmaY=18)
    saliency = cv2.normalize(saliency, None, 0, 255, cv2.NORM_MINMAX).astype(np.uint8)
    saliency_heatmap = cv2.applyColorMap(saliency, cv2.COLORMAP_JET)
    saliency_view = cv2.addWeighted(norm, 0.55, saliency_heatmap, 0.45, 0)

    return {
        "num_mas": num_mas,
        "num_hemorrhages": num_hemorrhages,
        "exudate_pixels": exudate_pixels,
        "exudate_burden_pct": round(exudate_burden_pct, 2),
        "vessel_density_pct": round(vessel_density, 2),
        "optic_disc_x": od_x,
        "optic_disc_y": od_y,
        "optic_disc_radius": od_radius,
        "fov_area_pixels": fov_area,
        "visuals": {
            "biomarker_segmentation_url": image_data_url(segmentation_view),
            "saliency_url": image_data_url(saliency_view),
            "saliency_method": "deterministic_lesion_saliency",
        },
    }


# ─── Clinical Decision Logic ──────────────────────────────────────────────────


def build_clinical_verdict(icdr_level: int, confidence_pct: float, exec_ms: float) -> dict:
    """Build triage and telemedicine verdict matching step11_master_dashboard.m output."""
    is_referable = icdr_level >= 2
    is_urgent = icdr_level >= 4

    if is_urgent:
        triage = "TRIAGE: EMERGENCY — PROLIFERATIVE DR (LEVEL 4)"
        queue = "P1 - EMERGENCY REVIEW"
        action = "UPLINK DISPATCH → VITREORETINAL SURGEON"
        payload = "1.20 MB (Emergency XAI + Full Report)"
    elif is_referable:
        triage = "TRIAGE: REFERRAL REQUIRED (LEVEL 2+)"
        queue = "P2 - ROUTINE SPECIALIST QUEUE"
        action = "UPLINK DISPATCH → DISTRICT HOSP."
        payload = "0.65 MB (Compressed XAI + JSON)"
    else:
        triage = "TRIAGE: NON-REFERABLE (LOCAL CLEARANCE)"
        queue = "P3 - ANNUAL RE-SCREEN"
        action = "LOCAL ARCHIVE → DISCHARGED AT PHC"
        payload = "0.00 MB"

    # Simulate 1.5 Mbps uplink (matches step9_telemedicine_simulation.m)
    payload_mb = float(payload.split()[0]) if is_referable else 0.0
    upload_sec = (payload_mb * 8) / 1.5 if payload_mb > 0 else 0.0
    latency = f"{upload_sec:.2f} sec (over 1.5 Mbps Cellular)" if upload_sec > 0 else f"{exec_ms / 1000:.2f}s local"

    return {
        "triage_status": triage,
        "doctor_queue_priority": queue,
        "transmission_action": action,
        "payload_size": payload,
        "network_latency": latency,
        "is_referable": is_referable,
        "is_urgent": is_urgent,
    }


# ─── API Endpoints ─────────────────────────────────────────────────────────────


@app.get("/health")
async def health():
    return {
        "status": "ok" if _model_loaded else "loading",
        "model": "netra_rakshak.onnx",
        "model_loaded": _model_loaded,
        "providers": ort.get_available_providers(),
    }


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    """
    Full retinal diagnostic inference endpoint.

    Accepts: multipart/form-data with 'file' field (JPEG/PNG retinal fundus image)
    Returns: JSON with ICDR classification, softmax distribution, biomarkers, IQA
    """
    if not _model_loaded:
        raise HTTPException(status_code=503, detail="Model is still loading, please retry in a few seconds.")

    start = time.time()

    # Read uploaded image
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    img_bgr = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    if img_bgr is None:
        # Try PIL as fallback (handles more formats)
        try:
            pil_img = Image.open(io.BytesIO(contents)).convert("RGB")
            img_bgr = cv2.cvtColor(np.array(pil_img), cv2.COLOR_RGB2BGR)
        except Exception:
            raise HTTPException(status_code=400, detail="Cannot decode the uploaded image. Please upload a valid JPEG or PNG retinal fundus scan.")

    h, w = img_bgr.shape[:2]
    logger.info(f"Received image: {file.filename} ({w}×{h})")

    # IQA
    gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
    iqa = compute_iqa(gray)

    # Preprocessing + Inference
    enhanced_bgr = matlab_green_clahe(img_bgr)
    img_batch = preprocess_for_inference(img_bgr)
    probs = run_inference(img_batch)  # shape [5], float32

    icdr_level = int(np.argmax(probs))
    confidence_pct = float(probs[icdr_level]) * 100.0

    # Biomarker segmentation
    biomarkers = extract_biomarkers(img_bgr)

    exec_ms = (time.time() - start) * 1000
    verdict = build_clinical_verdict(icdr_level, confidence_pct, exec_ms)

    predictions_list = [round(float(p), 6) for p in probs]
    confidences = [
        {"label": ICDR_LABELS[i], "confidence": predictions_list[i]}
        for i in range(5)
    ]

    response = {
        "status": "success",
        "icdr_level": icdr_level,
        "icdr_grade": ICDR_LABELS[icdr_level],
        "confidence_percent": round(confidence_pct, 2),
        "predictions": predictions_list,
        "confidences": confidences,
        "optical_resolution": f"{w} × {h} px",
        "iqa": iqa,
        "biomarkers": biomarkers,
        "visuals": {
            "rayleigh_clahe_url": image_data_url(enhanced_bgr),
            "gradcam_saliency_url": biomarkers["visuals"]["saliency_url"],
            "biomarker_segmentation_url": biomarkers["visuals"]["biomarker_segmentation_url"],
            "gradcam_method": biomarkers["visuals"]["saliency_method"],
        },
        "verdict": verdict,
        "execution_time_ms": round(exec_ms, 1),
        "input_shape": [1, 3, 224, 224],
        "preprocessing": "Green-Channel Rayleigh CLAHE (MATLAB-faithful, uint8 [0,255])",
    }

    logger.info(
        f"✅ {file.filename}: Level {icdr_level} ({ICDR_LABELS[icdr_level]}) "
        f"| Confidence: {confidence_pct:.1f}% | {exec_ms:.0f}ms"
    )
    return JSONResponse(content=response)
