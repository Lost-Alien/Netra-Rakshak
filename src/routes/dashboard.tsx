import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useRef, useCallback } from "react";
import {
  Upload,
  Play,
  Activity,
  Shield,
  Eye,
  Wifi,
  BarChart3,
  ChevronLeft,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Zap,
  MonitorSmartphone,
} from "lucide-react";
import {
  runNetraDiagnosis,
  NetraDiagnosisResult,
} from "@/lib/netra-model";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Netra Rakshak — Clinical Decision Support Dashboard" },
      {
        name: "description",
        content:
          "Master diagnostic station mirroring the MATLAB Clinical Telemedicine & XAI Dashboard. 5-stage autonomous retinal pipeline with Grad-CAM explainability.",
      },
    ],
  }),
  component: DashboardPage,
});

/* ─── Constants ─────────────────────────────────────────── */

const ICDR_LABELS = [
  "Level 0: No Apparent Retinopathy (Healthy)",
  "Level 1: Mild Non-Proliferative DR",
  "Level 2: Moderate Non-Proliferative DR",
  "Level 3: Severe Non-Proliferative DR",
  "Level 4: Proliferative Diabetic Retinopathy",
];

const ICDR_SHORT = ["L0", "L1", "L2", "L3", "L4"];

const ICDR_COLORS = [
  "#21B35A", // Level 0: Emerald Green
  "#339AD9", // Level 1: Sky Blue
  "#F2A60E", // Level 2: Amber
  "#E6661A", // Level 3: Dark Orange
  "#D93333", // Level 4: Crimson Red
];

const SAMPLE_DESCRIPTIONS: Record<string, string> = {
  "Sample Level 0": "Healthy retina",
  "Sample Level 1": "Mild NPDR",
  "Sample Level 2": "Moderate NPDR",
  "Sample Level 3": "Severe NPDR",
  "Sample Level 4": "Proliferative DR",
};

/* ─── Dashboard Page ────────────────────────────────────── */

function DashboardPage() {
  // State
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState("N/A");
  const [imageRes, setImageRes] = useState("N/A");
  const [result, setResult] = useState<NetraDiagnosisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState("● SYSTEM READY");
  const [statusColor, setStatusColor] = useState("#26D96C");
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadImage = useCallback((file: File) => {
    setImageFile(file);
    setFileName(file.name);
    setResult(null);
    setError(null);
    setStatusText("● IMAGE LOADED");
    setStatusColor("#F2A60E");

    const url = URL.createObjectURL(file);
    setImagePreview(url);

    // Get image dimensions
    const img = new Image();
    img.onload = () => {
      setImageRes(`${img.naturalWidth} × ${img.naturalHeight} px`);
      URL.revokeObjectURL(url);
    };
    img.src = url;
  }, []);

  const handleFileSelect = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) loadImage(file);
  };

  const loadSample = useCallback(async (samplePath: string, sampleName: string) => {
    try {
      setStatusText("● LOADING SAMPLE...");
      setStatusColor("#339AD9");
      const res = await fetch(samplePath);
      const blob = await res.blob();
      const file = new File([blob], sampleName, { type: blob.type || "image/jpeg" });
      loadImage(file);
    } catch {
      setError("Failed to load sample image.");
      setStatusText("● LOAD ERROR");
      setStatusColor("#D93333");
    }
  }, [loadImage]);

  const runDiagnosis = async () => {
    if (!imageFile) return;
    setLoading(true);
    setError(null);
    setStatusText("● RUNNING DIAGNOSIS...");
    setStatusColor("#339AD9");

    try {
      const res = await runNetraDiagnosis(imageFile, (msg) => setStatusText(`● ${msg}`));
      setResult(res);
      setStatusText("● DIAGNOSIS COMPLETE");
      setStatusColor("#26D96C");
    } catch (err: any) {
      setError(err.message || "Diagnosis failed.");
      setStatusText("● ERROR");
      setStatusColor("#D93333");
    } finally {
      setLoading(false);
    }
  };

  // Derived values
  const severityIndex = result?.icdrLevel ?? -1;
  const severityLabel = severityIndex >= 0 ? ICDR_LABELS[severityIndex] : "AWAITING SCAN";
  const severityColor = severityIndex >= 0 ? ICDR_COLORS[severityIndex] : "#555C6B";
  const confidenceText = result ? `Model Confidence: ${result.confidencePercent.toFixed(2)}%` : "Model Confidence: -- %";
  const isReferable = result?.isReferable ?? false;

  // Probability distribution
  const probabilities = result?.severityDistribution?.confidences ?? [];

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#111927", color: "#E0E7F0", fontFamily: "Inter, sans-serif" }}
    >
      {/* ── Header Banner ── */}
      <header
        className="flex items-center justify-between px-6 py-4 shrink-0"
        style={{ background: "#1C2638", borderBottom: "1px solid #2A3650" }}
      >
        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-white"
            style={{ color: "#8B9DBA" }}
          >
            <ChevronLeft className="h-4 w-4" />
            Home
          </Link>
          <div className="h-5 w-px" style={{ background: "#2A3650" }} />
          <h1 className="text-lg font-bold tracking-wide" style={{ color: "#F0F3F8" }}>
            NETRA RAKSHAK
            <span className="font-normal ml-2" style={{ color: "#8B9DBA" }}>|</span>
            <span className="font-normal ml-2 text-sm" style={{ color: "#8B9DBA" }}>
              Clinical Decision Support System
            </span>
          </h1>
        </div>
        <div className="flex items-center gap-6 text-xs">
          <span style={{ color: "#8B9DBA" }}>
            MathWorks SIH26038 | Edge-XAI Telemedicine Pipeline
          </span>
          <span className="font-bold" style={{ color: statusColor }}>
            {statusText}
          </span>
        </div>
      </header>

      {/* ── Main Grid: 3 columns ── */}
      <div
        className="flex-1 grid gap-3 p-3 overflow-hidden"
        style={{ gridTemplateColumns: "340px 1fr 380px", gridTemplateRows: "1fr 35px" }}
      >
        {/* ─── LEFT SIDEBAR ─── */}
        <div className="flex flex-col gap-3 overflow-y-auto" style={{ gridRow: "1" }}>
          {/* Upload Button */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          <button
            onClick={handleFileSelect}
            className="flex items-center justify-center gap-2 py-3.5 px-4 text-sm font-bold rounded transition-colors cursor-pointer"
            style={{ background: "#2E3D56", color: "white" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#3A4D69")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#2E3D56")}
          >
            <Upload className="h-4 w-4" />
            📂 Select Patient Fundus Scan
          </button>

          {/* Quick Clinical Samples Dropdown */}
          <select
            defaultValue=""
            onChange={(e) => {
              const val = e.target.value;
              if (!val) return;
              const [path, name] = val.split("|");
              loadSample(path, name);
            }}
            className="w-full py-3 px-3 text-xs font-semibold rounded cursor-pointer border transition-colors outline-none"
            style={{
              background: "#1A2536",
              color: "#D0DBEB",
              borderColor: "#2B3A52",
            }}
          >
            <option value="">-- Quick Clinical Samples --</option>
            <option value="/samples/sample_level_0.png|Sample Level 0 (Healthy)">
              Sample Level 0 (Healthy Retina)
            </option>
            <option value="/samples/sample_level_1.png|Sample Level 1 (Mild NPDR)">
              Sample Level 1 (Mild NPDR)
            </option>
            <option value="/samples/16_right.jpeg|16_right.jpeg (Moderate NPDR)">
              Sample Level 2: 16_right.jpeg (Moderate NPDR)
            </option>
            <option value="/samples/sample_level_3.png|Sample Level 3 (Severe NPDR)">
              Sample Level 3 (Severe NPDR)
            </option>
            <option value="/samples/sample_level_4.png|Sample Level 4 (Proliferative DR)">
              Sample Level 4 (Proliferative DR)
            </option>
          </select>

          {/* Run Diagnosis Button */}
          <button
            onClick={runDiagnosis}
            disabled={!imageFile || loading}
            className="flex items-center justify-center gap-2 py-4 px-4 text-sm font-bold rounded transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: "#1485F2", color: "white" }}
            onMouseEnter={(e) => {
              if (!e.currentTarget.disabled) e.currentTarget.style.background = "#1070D0";
            }}
            onMouseLeave={(e) => {
              if (!e.currentTarget.disabled) e.currentTarget.style.background = "#1485F2";
            }}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Zap className="h-4 w-4" />
            )}
            {loading ? "DIAGNOSING..." : "⚡ RUN CLINICAL DIAGNOSIS"}
          </button>

          {error && (
            <div
              className="flex items-start gap-2 p-3 rounded text-xs"
              style={{ background: "#2D1A1A", color: "#F28B8B", border: "1px solid #5C2222" }}
            >
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Metadata Card */}
          <DashCard title="PATIENT & REPOSITORY METADATA" icon={<Eye className="h-3.5 w-3.5" />}>
            <MetaRow label="Record ID" value={fileName} />
            <MetaRow label="Resolution" value={imageRes} />
            <MetaRow label="Camera Spec" value="45° Mydriatic/Non-Mydriatic" />
          </DashCard>

          {/* IQA Telemetry Card */}
          <DashCard
            title="PHASE 1: IMAGE QUALITY ASSESSMENT (IQA)"
            icon={<Shield className="h-3.5 w-3.5" />}
          >
            <MetaRow
              label="Sharpness Index"
              value={result?.sharpnessIndex ?? "--"}
            />
            <MetaRow
              label="Illumination Balance"
              value={result?.illuminationBalance ?? "--"}
            />
            <MetaRow
              label="Quality Decision"
              value={result?.qualityDecision ?? "PENDING SCAN"}
              valueColor={result?.qualityPassed ? "#26D96C" : "#F2BF0E"}
              bold
            />
          </DashCard>

          {/* Image Thumbnail Preview */}
          {imagePreview && (
            <div className="rounded overflow-hidden border" style={{ borderColor: "#2A3650" }}>
              <img
                src={imagePreview}
                alt="Loaded fundus scan"
                className="w-full h-auto"
                style={{ maxHeight: 200, objectFit: "contain", background: "#0D1117" }}
              />
            </div>
          )}
        </div>

        {/* ─── CENTER PANEL: 2×2 Diagnostic Quadrants ─── */}
        <div
          className="grid gap-2 overflow-hidden"
          style={{
            gridTemplateColumns: "1fr 1fr",
            gridTemplateRows: "1fr 1fr",
            gridRow: "1",
          }}
        >
          <QuadrantPane
            title="1. Primary Optical Acquisition"
            imageUrl={result?.primaryOpticalUrl ?? imagePreview}
            placeholder="Load a retinal scan..."
          />
          <QuadrantPane
            title="2. Rayleigh Green-Channel CLAHE"
            imageUrl={result?.rayleighClaheUrl}
            placeholder="Run diagnosis to see CLAHE..."
          />
          <QuadrantPane
            title="3. Phase 4: Grad-CAM Saliency Map"
            imageUrl={result?.gradCamSaliencyUrl}
            placeholder="Run diagnosis to see Grad-CAM..."
            tint="gradcam"
          />
          <QuadrantPane
            title="4. Phase 2: Biomarker Segmentation Map"
            imageUrl={result?.biomarkerSegmentationUrl}
            placeholder="Run diagnosis to see biomarkers..."
          />
        </div>

        {/* ─── RIGHT PANEL ─── */}
        <div className="flex flex-col gap-3 overflow-y-auto" style={{ gridRow: "1" }}>
          {/* Severity Verdict Card */}
          <DashCard
            title="PHASE 3: CLINICAL SEVERITY RATING (ICDR)"
            icon={<Activity className="h-3.5 w-3.5" />}
          >
            <div className="flex flex-col items-center gap-2 py-2">
              <div
                className="w-full text-center py-3 px-4 rounded text-sm font-bold tracking-wide"
                style={{ background: severityColor, color: "white" }}
              >
                {severityLabel}
              </div>
              <span className="text-xs" style={{ color: "#B0BDD0" }}>
                {confidenceText}
              </span>
              <div
                className="w-full text-center py-2 px-4 rounded text-xs font-bold tracking-widest"
                style={{
                  background: isReferable ? "#D93333" : result ? "#218B4A" : "#1C2638",
                  color: "white",
                }}
              >
                {result
                  ? isReferable
                    ? "TRIAGE: REFERRAL REQUIRED (LEVEL 2+)"
                    : "TRIAGE: NON-REFERABLE (LOCAL CLEARANCE)"
                  : "TRIAGE STATUS: PENDING"}
              </div>
            </div>
          </DashCard>

          {/* Biomarker Quantitative Summary */}
          <DashCard
            title="PHASE 2: DETERMINISTIC RETINAL BIOMARKERS"
            icon={<Eye className="h-3.5 w-3.5" />}
          >
            <MetaRow label="Sub-pixel Microaneurysms" value={result?.subPixelMAs ?? "--"} />
            <MetaRow label="Blot Hemorrhages" value={result?.blotHemorrhages ?? "--"} />
            <MetaRow label="Hard Exudates Burden" value={result?.hardExudatesBurden ?? "--"} />
            <MetaRow
              label="Vascular Density (Target: 10-15%)"
              value={result?.vascularDensity ?? "--"}
            />
          </DashCard>

          {/* Telemedicine Telemetry Card */}
          <DashCard
            title="PHASE 5: DISTRICT TELEMEDICINE DISPATCH"
            icon={<Wifi className="h-3.5 w-3.5" />}
          >
            <MetaRow
              label="Transmission Action"
              value={
                result
                  ? isReferable
                    ? "UPLINK DISPATCH → DISTRICT HOSP."
                    : "LOCAL ARCHIVE → DISCHARGED AT PHC"
                  : "--"
              }
              valueColor={result ? (isReferable ? "#F28B8B" : "#4DD98B") : undefined}
            />
            <MetaRow
              label="Uplink Payload Size"
              value={
                result
                  ? isReferable
                    ? "0.65 MB (Compressed XAI + JSON)"
                    : "0.00 MB (98.7% Bandwidth Conserved)"
                  : "--"
              }
            />
            <MetaRow
              label="2G/3G Upload Time"
              value={
                result
                  ? isReferable
                    ? "3.65 sec (over 1.5 Mbps Cellular)"
                    : "0.00 sec (No Rural Uplink Used)"
                  : "--"
              }
            />
            <MetaRow
              label="Doctor Queue Priority"
              value={
                result
                  ? severityIndex >= 4
                    ? "P1 - EMERGENCY OPHTHALMIC REVIEW"
                    : isReferable
                      ? "P2 - ROUTINE SPECIALIST QUEUE"
                      : "P3 - ROUTINE ANNUAL RE-SCREEN"
                  : "--"
              }
              valueColor={
                result
                  ? severityIndex >= 4
                    ? "#FF4444"
                    : isReferable
                      ? "#F2A60E"
                      : "#8B9DBA"
                  : undefined
              }
              bold
            />
          </DashCard>

          {/* 5-Stage Probability Distribution */}
          <DashCard
            title="5-STAGE PROBABILITY DISTRIBUTION"
            icon={<BarChart3 className="h-3.5 w-3.5" />}
          >
            <div className="flex flex-col gap-2 pt-1">
              {ICDR_SHORT.map((label, i) => {
                const prob = probabilities[i]?.confidence ?? 0;
                const pct = (prob * 100).toFixed(1);
                const isMax = i === severityIndex;
                return (
                  <div key={label} className="flex items-center gap-2">
                    <span
                      className="text-[10px] font-mono w-6 text-right shrink-0"
                      style={{ color: isMax ? "#F0F3F8" : "#6B7A90" }}
                    >
                      {label}
                    </span>
                    <div
                      className="flex-1 h-5 rounded-sm overflow-hidden relative"
                      style={{ background: "#1C2638" }}
                    >
                      <div
                        className="h-full rounded-sm transition-all duration-700 ease-out"
                        style={{
                          width: `${Math.max(prob * 100, 0.5)}%`,
                          background: isMax
                            ? ICDR_COLORS[i]
                            : `${ICDR_COLORS[i]}66`,
                        }}
                      />
                    </div>
                    <span
                      className="text-[10px] font-mono w-12 text-right shrink-0"
                      style={{ color: isMax ? "#F0F3F8" : "#6B7A90" }}
                    >
                      {pct}%
                    </span>
                  </div>
                );
              })}
            </div>
          </DashCard>
        </div>

        {/* ── Footer Status Bar ── */}
        <footer
          className="col-span-3 flex items-center justify-between px-4 rounded text-[11px]"
          style={{ background: "#141C2B", color: "#4A5B73", gridRow: "2" }}
        >
          <span>
            Netra Rakshak CDSS v2.6 | Validated against APTOS, DRIVE, IDRiD, & Messidor-2 cohorts
          </span>
          <span style={{ color: "#3F7D5C" }}>
            Deep Learning Ensemble Engine: netra_rakshak.onnx [Active]
          </span>
        </footer>
      </div>
    </div>
  );
}

/* ─── Reusable Dashboard Sub-Components ─────────────────── */

function DashCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded overflow-hidden"
      style={{ background: "#161E2E", border: "1px solid #232F44" }}
    >
      <div
        className="flex items-center gap-2 px-3 py-2 text-[10px] font-bold tracking-widest uppercase"
        style={{ color: "#7B93B8", borderBottom: "1px solid #232F44" }}
      >
        {icon}
        {title}
      </div>
      <div className="px-3 py-2.5 flex flex-col gap-1.5">{children}</div>
    </div>
  );
}

function MetaRow({
  label,
  value,
  valueColor,
  bold,
}: {
  label: string;
  value: string;
  valueColor?: string;
  bold?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 text-[11px]">
      <span style={{ color: "#7B93B8" }}>{label}:</span>
      <span
        className={`text-right ${bold ? "font-bold" : ""}`}
        style={{ color: valueColor ?? "#E0E7F0" }}
      >
        {value}
      </span>
    </div>
  );
}

function QuadrantPane({
  title,
  imageUrl,
  placeholder,
  tint,
}: {
  title: string;
  imageUrl?: string | null;
  placeholder: string;
  tint?: "gradcam";
}) {
  return (
    <div
      className="rounded overflow-hidden flex flex-col"
      style={{ background: "#0D1420", border: "1px solid #1E2A3E" }}
    >
      <div
        className="px-3 py-1.5 text-[10px] font-medium tracking-wide shrink-0"
        style={{ color: "#D9E0EB" }}
      >
        {title}
      </div>
      <div className="flex-1 relative flex items-center justify-center overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-contain"
            style={
              tint === "gradcam"
                ? { filter: "contrast(1.2) saturate(1.3)" }
                : undefined
            }
          />
        ) : (
          <span className="text-xs" style={{ color: "#3A4D69" }}>
            {placeholder}
          </span>
        )}
      </div>
    </div>
  );
}
