/**
 * NETRA RAKSHAK — Diagnostic Engine Client
 * Smart India Hackathon (SIH 26038)
 *
 * In production (Vercel), calls the server-side proxy route /api/predict,
 * which forwards to the EC2 FastAPI backend at http://13.200.63.0.
 * This avoids Mixed Content (HTTPS → HTTP) errors permanently — no domain needed.
 *
 * In local dev, set VITE_NETRA_API_URL=http://localhost:8000/predict
 */

// In local dev: use env var (e.g., http://localhost:8000/predict)
// In production: use relative /api/predict (our server-side proxy)
const isDev = import.meta.env.DEV;
export const NETRA_API_URL = isDev
  ? (import.meta.env["VITE_NETRA_API_URL"] || "http://localhost:8000/predict")
  : "/api/predict";

// ─── Public Types ─────────────────────────────────────────────────────────────

export interface ProbabilityConfidence {
  label: string;
  confidence: number;
}

export interface SeverityDistribution {
  label: string;
  confidences: ProbabilityConfidence[];
}

export interface NetraDiagnosisResult {
  predictions: number[];
  inputShape?: number[];

  // Phase visual outputs
  primaryOpticalUrl: string;
  rayleighClaheUrl: string;
  gradCamSaliencyUrl: string;
  biomarkerSegmentationUrl: string;

  // Stage 1: Optical Quality Gate
  opticalResolution: string;
  sharpnessIndex: string;
  illuminationBalance: string;
  qualityDecision: string;
  qualityPassed: boolean;

  // Stage 3: ICDR Severity Classification
  icdrDiagnosticGrade: string;
  icdrLevel: number;
  modelConfidence: string;
  confidencePercent: number;

  // Triage Verdict
  triageStatus: string;
  isReferable: boolean;
  isUrgent: boolean;

  // Stage 2: Quantitative Lesion Biomarkers
  subPixelMAs: string;
  blotHemorrhages: string;
  hardExudatesBurden: string;
  vascularDensity: string;

  // Stage 4: Tele-Ophthalmology Telemetry
  transmissionAction: string;
  payloadSize: string;
  networkLatency: string;
  doctorQueuePriority: string;

  // Softmax Distribution
  severityDistribution: SeverityDistribution;

  // Execution Metadata
  executionTimeMs: number;
  source: "fastapi_onnx";
}

// ─── Backend Response Shape ───────────────────────────────────────────────────

interface BackendIQA {
  sharpness: number;
  illumination_mean: number;
  passed: boolean;
  decision: string;
}

interface BackendBiomarkers {
  num_mas: number;
  num_hemorrhages: number;
  exudate_pixels: number;
  exudate_burden_pct: number;
  vessel_density_pct: number;
  optic_disc_x: number;
  optic_disc_y: number;
  optic_disc_radius: number;
  fov_area_pixels: number;
}

interface BackendVerdict {
  triage_status: string;
  doctor_queue_priority: string;
  transmission_action: string;
  payload_size: string;
  network_latency: string;
  is_referable: boolean;
  is_urgent: boolean;
}

interface BackendResponse {
  status: "success";
  icdr_level: number;
  icdr_grade: string;
  confidence_percent: number;
  predictions: number[];
  confidences: { label: string; confidence: number }[];
  optical_resolution: string;
  iqa: BackendIQA;
  biomarkers: BackendBiomarkers;
  verdict: BackendVerdict;
  execution_time_ms: number;
  input_shape: number[];
  preprocessing: string;
}

// ─── Main Diagnosis Function ──────────────────────────────────────────────────

/**
 * Sends the retinal image to the FastAPI backend for inference.
 * The backend runs the actual netra_rakshak.onnx model with MATLAB-faithful
 * Green-Channel Rayleigh CLAHE preprocessing.
 *
 * Requires VITE_NETRA_API_URL to be set (e.g., http://localhost:8000/predict).
 */
export async function runNetraDiagnosis(
  input: File | Blob | string,
  onProgress?: (stageText: string) => void,
): Promise<NetraDiagnosisResult> {
  if (!NETRA_API_URL) {
    throw new Error(
      "Backend not configured.\n\n" +
        "To run diagnostics, start the FastAPI backend:\n" +
        "  1. cd backend && pip install -r requirements.txt\n" +
        "  2. set LOCAL_MODEL_PATH=D:\\Lost_Projects\\Netra_Rakshak_Model\\netra_rakshak.onnx\n" +
        "  3. uvicorn main:app --port 8000\n\n" +
        "Then set VITE_NETRA_API_URL=http://localhost:8000/predict in your .env file.",
    );
  }

  onProgress?.("Stage 1: Connecting to Netra Rakshak diagnostic engine...");

  // Build multipart form data
  const formData = new FormData();
  if (input instanceof File) {
    formData.append("file", input, input.name);
  } else if (input instanceof Blob) {
    formData.append("file", input, "retinal-image.jpg");
  } else {
    // URL string — fetch and forward as blob
    onProgress?.("Fetching image for analysis...");
    const resp = await fetch(input);
    if (!resp.ok) throw new Error(`Failed to fetch image from URL: ${input}`);
    const blob = await resp.blob();
    formData.append("file", blob, "retinal-image.jpg");
  }

  onProgress?.("Stage 2: Applying Green-Channel Rayleigh CLAHE preprocessing...");

  let response: Response;
  try {
    response = await fetch(NETRA_API_URL, {
      method: "POST",
      body: formData,
    });
  } catch (networkErr) {
    throw new Error(
      "Cannot reach the diagnostic backend. Please ensure it is running:\n" +
        "  uvicorn main:app --host 0.0.0.0 --port 8000\n\n" +
        `URL: ${NETRA_API_URL}`,
    );
  }

  if (!response.ok) {
    let detail = `HTTP ${response.status}`;
    try {
      const err = (await response.json()) as { detail?: string };
      if (err.detail) detail = err.detail;
    } catch {
      // ignore JSON parse errors
    }
    throw new Error(`Diagnostic backend returned an error: ${detail}`);
  }

  onProgress?.("Stage 3: Running ONNX ResNet-50 inference...");

  const data = (await response.json()) as BackendResponse;

  if (data.status !== "success") {
    throw new Error("Backend returned an unexpected response. Check backend logs.");
  }

  onProgress?.("Stage 4: Extracting retinal biomarkers and generating triage report...");

  // Generate an object URL for the uploaded image (for display in UI)
  const imageUrl =
    input instanceof File || input instanceof Blob ? URL.createObjectURL(input) : input;

  onProgress?.("Diagnostic evaluation complete. Rendering 4-quadrant report...");

  return mapBackendResponse(data, imageUrl);
}

// ─── Response Mapper ──────────────────────────────────────────────────────────

function mapBackendResponse(data: BackendResponse, imageUrl: string): NetraDiagnosisResult {
  const { iqa, biomarkers, verdict } = data;

  return {
    predictions: data.predictions,
    inputShape: data.input_shape,

    // Visual outputs — backend doesn't generate images yet; use original for all
    primaryOpticalUrl: imageUrl,
    rayleighClaheUrl: imageUrl,
    gradCamSaliencyUrl: imageUrl,
    biomarkerSegmentationUrl: imageUrl,

    // IQA
    opticalResolution: data.optical_resolution,
    sharpnessIndex: `${iqa.sharpness.toFixed(2)} (Threshold: >0.80)`,
    illuminationBalance: `${iqa.illumination_mean.toFixed(1)} / 255 (Valid: 25-230)`,
    qualityDecision: iqa.decision,
    qualityPassed: iqa.passed,

    // Classification
    icdrDiagnosticGrade: data.icdr_grade,
    icdrLevel: data.icdr_level,
    modelConfidence: `Model Confidence: ${data.confidence_percent.toFixed(2)}%`,
    confidencePercent: data.confidence_percent,

    // Triage
    triageStatus: verdict.triage_status,
    isReferable: verdict.is_referable,
    isUrgent: verdict.is_urgent,

    // Biomarkers
    subPixelMAs: `${biomarkers.num_mas} foci detected (10-30µm)`,
    blotHemorrhages: `${biomarkers.num_hemorrhages} lesions detected`,
    hardExudatesBurden: `${biomarkers.exudate_pixels.toLocaleString()} px (${biomarkers.exudate_burden_pct.toFixed(2)}%)`,
    vascularDensity: `${biomarkers.vessel_density_pct.toFixed(2)}% vessel caliber`,

    // Telemedicine
    transmissionAction: verdict.transmission_action,
    payloadSize: verdict.payload_size,
    networkLatency: verdict.network_latency,
    doctorQueuePriority: verdict.doctor_queue_priority,

    // Distribution
    severityDistribution: {
      label: data.icdr_grade,
      confidences: data.confidences,
    },

    executionTimeMs: data.execution_time_ms,
    source: "fastapi_onnx",
  };
}
