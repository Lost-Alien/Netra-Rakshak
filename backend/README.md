# Netra Rakshak Backend

FastAPI backend serving the actual `netra_rakshak.onnx` ResNet-50 model with MATLAB-faithful preprocessing.

## Quick Start (Local Dev)

### 1. Prerequisites
- Python 3.10+
- The ONNX model: `D:\Lost_Projects\Netra_Rakshak_Model\netra_rakshak.onnx`

### 2. Install Dependencies

```powershell
cd D:\Lost_Projects\Netra_Rakshak\backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Set Model Path (Windows PowerShell)

```powershell
$env:LOCAL_MODEL_PATH = "D:\Lost_Projects\Netra_Rakshak_Model\netra_rakshak.onnx"
```

Or create a `.env` file in the `backend/` folder:
```
LOCAL_MODEL_PATH=D:\Lost_Projects\Netra_Rakshak_Model\netra_rakshak.onnx
```

> **For cloud deployment:** Set `MODEL_URL` to a direct download link of your ONNX model
> (e.g., HuggingFace Hub raw download URL). The server will auto-download on first start.

### 4. Start the Backend

```powershell
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### 5. Connect Frontend

In `D:\Lost_Projects\Netra_Rakshak\.env` (or `.env.local`):
```
VITE_NETRA_API_URL=http://localhost:8000/predict
```

Then restart the Vite dev server:
```powershell
npm run dev
```

---

## API Reference

### `GET /health`
Check if the model is loaded and ready.

```json
{ "status": "ok", "model": "netra_rakshak.onnx", "model_loaded": true }
```

### `POST /predict`
Upload a retinal fundus image and receive a full diagnostic report.

**Request:** `multipart/form-data`, field: `file` (JPEG or PNG)

**Response:**
```json
{
  "status": "success",
  "icdr_level": 2,
  "icdr_grade": "Level 2: Moderate Non-Proliferative DR",
  "confidence_percent": 76.17,
  "predictions": [0.088, 0.052, 0.762, 0.047, 0.051],
  "iqa": { "sharpness": 12.84, "illumination_mean": 76.8, "passed": true },
  "biomarkers": { "num_mas": 19, "num_hemorrhages": 8, "exudate_pixels": 3188, "vessel_density_pct": 13.4 },
  "verdict": { "triage_status": "TRIAGE: REFERRAL REQUIRED (LEVEL 2+)", "is_referable": true }
}
```

---

## Critical Preprocessing Note

The MATLAB ResNet-50 was trained on images in **[0, 255] uint8** range.
Any backend that divides by 255 or applies ImageNet normalization will cause **Level 0 bias collapse** — 
the bug that was originally observed. This backend preserves the original uint8 scale exactly.

## Cloud Deployment (HuggingFace Spaces)

1. Push the `backend/` folder as a FastAPI Space
2. Upload `netra_rakshak.onnx` to HuggingFace Hub (as a Git LFS file)
3. Set `MODEL_URL` to the raw download URL
4. The Space will auto-download and cache the model on startup
