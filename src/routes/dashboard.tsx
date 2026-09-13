import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useRef, useCallback } from "react";
import {
  Upload,
  Activity,
  Shield,
  Eye,
  Wifi,
  BarChart3,
  ArrowLeft,
  Loader2,
  AlertTriangle,
  Zap,
  CheckCircle2,
  FileText,
  Layers,
} from "lucide-react";
import {
  runNetraDiagnosis,
  NetraDiagnosisResult,
} from "@/lib/netra-model";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Clinical Decision Support Dashboard — Netra Rakshak" },
      {
        name: "description",
        content:
          "Master clinical diagnostic station mirroring the MATLAB Telemedicine & XAI Suite. 5-stage autonomous retinal pipeline with Rayleigh CLAHE, Grad-CAM, and deterministic biomarkers.",
      },
    ],
  }),
  component: DashboardPage,
});

/* ─── Clinical Constants ─────────────────────────────────── */

const ICDR_LABELS = [
  "Level 0: No Apparent Retinopathy (Healthy)",
  "Level 1: Mild Non-Proliferative DR",
  "Level 2: Moderate Non-Proliferative DR",
  "Level 3: Severe Non-Proliferative DR",
  "Level 4: Proliferative Diabetic Retinopathy",
];

const ICDR_SHORT = ["L0 Healthy", "L1 Mild", "L2 Moderate", "L3 Severe", "L4 Proliferative"];

const ICDR_COLORS = [
  "#3F7D5C", // Level 0: Green
  "#0F6F6A", // Level 1: Teal
  "#C1652F", // Level 2: Amber
  "#9a3412", // Level 3: Dark Amber
  "#b91c1c", // Level 4: Crimson Red
];

/* ─── Dashboard Component ───────────────────────────────── */

function DashboardPage() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState("No file chosen");
  const [imageRes, setImageRes] = useState("--");
  const [result, setResult] = useState<NetraDiagnosisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState("System Ready");
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadImage = useCallback((file: File) => {
    setImageFile(file);
    setFileName(file.name);
    setResult(null);
    setError(null);
    setStatusText("Image Loaded");

    const url = URL.createObjectURL(file);
    setImagePreview(url);

    const img = new Image();
    img.onload = () => {
      setImageRes(`${img.naturalWidth} × ${img.naturalHeight} px`);
    };
    img.src = url;
  }, []);

  const handleFileSelect = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) loadImage(file);
  };

  const loadSample = useCallback(
    async (samplePath: string, sampleName: string) => {
      try {
        setStatusText("Loading Sample...");
        const res = await fetch(samplePath);
        const blob = await res.blob();
        const file = new File([blob], sampleName, { type: blob.type || "image/jpeg" });
        loadImage(file);
      } catch {
        setError("Failed to load sample image.");
        setStatusText("Load Error");
      }
    },
    [loadImage],
  );

  const runDiagnosis = async () => {
    if (!imageFile) return;
    setLoading(true);
    setError(null);
    setStatusText("Running Pipeline...");

    try {
      const res = await runNetraDiagnosis(imageFile, (msg) => setStatusText(msg));
      setResult(res);
      setStatusText("Diagnosis Complete");
    } catch (err: any) {
      setError(err.message || "Diagnosis failed.");
      setStatusText("Analysis Error");
    } finally {
      setLoading(false);
    }
  };

  const severityIndex = result?.icdrLevel ?? -1;
  const severityLabel = severityIndex >= 0 ? ICDR_LABELS[severityIndex] : "Awaiting Retinal Scan";
  const isReferable = result?.isReferable ?? false;
  const probabilities = result?.severityDistribution?.confidences ?? [];

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-paper-alt)] text-[var(--color-ink)] font-sans antialiased">
      {/* ── Console Header ── */}
      <header className="border-b border-[var(--color-gray-line)] bg-[var(--color-paper)] sticky top-0 z-30 px-6 py-3.5">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-[14px] font-medium text-[var(--color-gray)] hover:text-[var(--color-ink)] transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> Home
            </Link>
            <span className="h-4 w-px bg-[var(--color-gray-line)]" />
            <div className="flex items-center gap-2.5">
              <Activity className="h-5 w-5 text-[var(--color-teal)]" />
              <span className="font-serif text-xl font-semibold text-[var(--color-ink)] tracking-tight">
                Netra Rakshak
              </span>
              <span className="text-[var(--color-gray-line)]">|</span>
              <span className="font-sans text-xs uppercase tracking-wider font-semibold text-[var(--color-gray)]">
                Clinical Decision Support Station
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <span className="hidden md:inline text-[var(--color-gray)]">
              MathWorks SIH26038 • Edge-XAI Telemedicine Pipeline
            </span>
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                result
                  ? isReferable
                    ? "bg-[#C1652F]/10 text-[#C1652F] border-[#C1652F]/30"
                    : "bg-[#3F7D5C]/10 text-[#3F7D5C] border-[#3F7D5C]/30"
                  : loading
                    ? "bg-[#0F6F6A]/10 text-[#0F6F6A] border-[#0F6F6A]/30"
                    : "bg-[var(--color-paper-alt)] text-[var(--color-gray)] border-[var(--color-gray-line)]"
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  loading ? "bg-[var(--color-teal)] animate-pulse" : result ? (isReferable ? "bg-[#C1652F]" : "bg-[#3F7D5C]") : "bg-[var(--color-gray)]"
                }`}
              />
              {statusText}
            </span>
          </div>
        </div>
      </header>

      {/* ── Main Dashboard Workspace ── */}
      <main className="flex-1 p-4 lg:p-6 mx-auto max-w-[1500px] w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* ─── LEFT COLUMN: Ingestion, Controls, Metadata & IQA (3 cols) ─── */}
          <div className="lg:col-span-3 space-y-4">
            {/* Image Ingestion Card */}
            <EditorialCard title="Patient Scan Ingestion" icon={<Upload className="h-3.5 w-3.5 text-[var(--color-teal)]" />}>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              <button
                onClick={handleFileSelect}
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-3 text-xs font-medium rounded border border-[var(--color-gray-line)] bg-[var(--color-paper)] text-[var(--color-ink)] hover:bg-[var(--color-paper-alt)] hover:border-[var(--color-teal)] transition-colors cursor-pointer"
              >
                <Upload className="h-3.5 w-3.5 text-[var(--color-teal)]" />
                Select Patient Fundus Scan
              </button>

              {/* Quick Clinical Samples Dropdown */}
              <div className="mt-2.5">
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-[var(--color-gray)] mb-1">
                  Quick Benchmark Samples
                </label>
                <select
                  defaultValue=""
                  onChange={(e) => {
                    const val = e.target.value;
                    if (!val) return;
                    const [path, name] = val.split("|");
                    loadSample(path, name);
                  }}
                  className="w-full py-2 px-2.5 text-xs font-medium rounded border border-[var(--color-gray-line)] bg-[var(--color-paper)] text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-teal)] transition-colors cursor-pointer"
                >
                  <option value="">-- Quick Clinical Samples --</option>
                  <option value="/samples/sample_level_0.png|Sample Level 0 (Healthy)">
                    Sample Level 0: Healthy Retina
                  </option>
                  <option value="/samples/sample_level_1.png|Sample Level 1 (Mild NPDR)">
                    Sample Level 1: Mild NPDR
                  </option>
                  <option value="/samples/16_right.jpeg|16_right.jpeg (Moderate NPDR)">
                    Sample Level 2: 16_right.jpeg (Moderate NPDR)
                  </option>
                  <option value="/samples/sample_level_3.png|Sample Level 3 (Severe NPDR)">
                    Sample Level 3: Severe NPDR
                  </option>
                  <option value="/samples/sample_level_4.png|Sample Level 4 (Proliferative DR)">
                    Sample Level 4: Proliferative DR
                  </option>
                </select>
              </div>

              {/* Run Diagnosis Button */}
              <button
                onClick={runDiagnosis}
                disabled={!imageFile || loading}
                className="mt-3.5 w-full inline-flex items-center justify-center gap-2 py-3 px-4 text-xs font-semibold uppercase tracking-wider text-white bg-[var(--color-teal)] hover:bg-[#0c5854] rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-xs"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Zap className="h-4 w-4" />
                )}
                {loading ? "Diagnosing Retina..." : "Run Clinical Diagnosis"}
              </button>

              {error && (
                <div className="mt-3 flex items-start gap-2 p-2.5 rounded bg-red-50 text-red-700 border border-red-200 text-xs">
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-red-600" />
                  <span>{error}</span>
                </div>
              )}
            </EditorialCard>

            {/* Patient & Repository Metadata */}
            <EditorialCard title="Patient & Repository Metadata" icon={<Eye className="h-3.5 w-3.5 text-[var(--color-teal)]" />}>
              <MetadataItem label="Record ID" value={fileName} />
              <MetadataItem label="Resolution" value={imageRes} />
              <MetadataItem label="Camera Spec" value="45° Mydriatic / Non-Mydriatic" />
            </EditorialCard>

            {/* Phase 1: IQA Telemetry */}
            <EditorialCard title="Phase 1: Quality Gate (IQA)" icon={<Shield className="h-3.5 w-3.5 text-[var(--color-teal)]" />}>
              <MetadataItem
                label="Sharpness Index"
                value={result?.sharpnessIndex ?? "--"}
              />
              <MetadataItem
                label="Illumination Balance"
                value={result?.illuminationBalance ?? "--"}
              />
              <div className="pt-2 border-t border-[var(--color-gray-line)]/60 flex items-center justify-between text-xs">
                <span className="text-[var(--color-gray)] font-medium">Quality Decision:</span>
                <span
                  className={`font-semibold ${
                    result?.qualityPassed
                      ? "text-[var(--color-green)]"
                      : result
                        ? "text-[var(--color-amber)]"
                        : "text-[var(--color-gray)]"
                  }`}
                >
                  {result?.qualityDecision ?? "Pending Scan"}
                </span>
              </div>
            </EditorialCard>

            {/* Scan Thumbnail */}
            {imagePreview && (
              <div className="border border-[var(--color-gray-line)] bg-[var(--color-paper)] p-2 rounded">
                <div className="text-[10px] uppercase tracking-wider font-semibold text-[var(--color-gray)] mb-1.5">
                  Input Scan Preview
                </div>
                <div className="bg-[#0B0F17] rounded overflow-hidden flex items-center justify-center max-h-[160px]">
                  <img
                    src={imagePreview}
                    alt="Loaded patient scan"
                    className="max-h-[160px] w-full object-contain"
                  />
                </div>
              </div>
            )}
          </div>

          {/* ─── CENTER COLUMN: 2×2 Diagnostic Inspection Matrix (5 cols) ─── */}
          <div className="lg:col-span-5 space-y-3">
            <div className="border border-[var(--color-gray-line)] bg-[var(--color-paper)] p-3 rounded">
              <div className="flex items-center justify-between border-b border-[var(--color-gray-line)] pb-2.5 mb-3">
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-[var(--color-teal)]" />
                  <h2 className="font-serif text-base font-semibold text-[var(--color-ink)]">
                    Multi-Modal Inspection Matrix
                  </h2>
                </div>
                <span className="text-[11px] font-mono text-[var(--color-gray)]">
                  4-Quadrant Telemetry
                </span>
              </div>

              {/* 2×2 Grid */}
              <div className="grid grid-cols-2 gap-2.5">
                <QuadrantCard
                  number="1"
                  title="Primary Optical Scan"
                  imageUrl={result?.primaryOpticalUrl ?? imagePreview}
                  placeholder="Load a patient scan..."
                />
                <QuadrantCard
                  number="2"
                  title="Rayleigh Green CLAHE"
                  imageUrl={result?.rayleighClaheUrl}
                  placeholder="Run diagnosis for CLAHE..."
                />
                <QuadrantCard
                  number="3"
                  title="Grad-CAM Saliency Map"
                  imageUrl={result?.gradCamSaliencyUrl}
                  placeholder="Run diagnosis for Grad-CAM..."
                />
                <QuadrantCard
                  number="4"
                  title="Biomarker Segmentation"
                  imageUrl={result?.biomarkerSegmentationUrl}
                  placeholder="Run diagnosis for lesions..."
                />
              </div>

              <div className="mt-2.5 text-[11px] text-[var(--color-gray)] flex items-center justify-between">
                <span>Green-channel Rayleigh CLAHE contrast enhancement</span>
                <span className="font-mono">SIH 26038</span>
              </div>
            </div>
          </div>

          {/* ─── RIGHT COLUMN: Clinical Severity, Biomarkers & Telemedicine (4 cols) ─── */}
          <div className="lg:col-span-4 space-y-4">
            {/* Phase 3: Clinical Severity Rating (ICDR) */}
            <EditorialCard
              title="Phase 3: Clinical Severity Rating (ICDR)"
              icon={<Activity className="h-3.5 w-3.5 text-[var(--color-teal)]" />}
            >
              <div className="space-y-3 pt-1">
                <div>
                  <div className="text-[11px] text-[var(--color-gray)] font-medium">
                    Diagnostic Consensus
                  </div>
                  <div className="font-serif text-lg font-semibold text-[var(--color-ink)] leading-snug mt-0.5">
                    {severityLabel}
                  </div>
                  <div className="text-xs font-mono text-[var(--color-gray)] mt-0.5">
                    {result ? `Model Confidence: ${result.confidencePercent.toFixed(2)}%` : "Confidence: --"}
                  </div>
                </div>

                {/* Referral Triage Status Banner */}
                <div
                  className={`w-full py-2.5 px-3 text-xs font-semibold tracking-wide uppercase text-center rounded transition-colors ${
                    result
                      ? isReferable
                        ? "bg-[#C1652F] text-white"
                        : "bg-[#3F7D5C] text-white"
                      : "bg-[var(--color-paper-alt)] text-[var(--color-gray)] border border-[var(--color-gray-line)]"
                  }`}
                >
                  {result
                    ? isReferable
                      ? "Triage: Referral Required (Level 2+)"
                      : "Triage: Non-Referable (Local Clearance)"
                    : "Triage Status: Pending Scan"}
                </div>
              </div>
            </EditorialCard>

            {/* Phase 2: Retinal Biomarkers */}
            <EditorialCard
              title="Phase 2: Deterministic Retinal Biomarkers"
              icon={<Eye className="h-3.5 w-3.5 text-[var(--color-teal)]" />}
            >
              <MetadataItem label="Sub-pixel MAs" value={result?.subPixelMAs ?? "--"} />
              <MetadataItem label="Blot Hemorrhages" value={result?.blotHemorrhages ?? "--"} />
              <MetadataItem label="Hard Exudates Burden" value={result?.hardExudatesBurden ?? "--"} />
              <MetadataItem
                label="Vascular Density (Target: 10-15%)"
                value={result?.vascularDensity ?? "--"}
              />
            </EditorialCard>

            {/* Phase 5: Telemedicine Dispatch */}
            <EditorialCard
              title="Phase 5: Telemedicine Dispatch"
              icon={<Wifi className="h-3.5 w-3.5 text-[var(--color-teal)]" />}
            >
              <MetadataItem
                label="Transmission Action"
                value={
                  result
                    ? isReferable
                      ? "Uplink Dispatch → District Hospital"
                      : "Local Archive → Discharged at PHC"
                    : "--"
                }
                highlight={result ? (isReferable ? "amber" : "green") : undefined}
              />
              <MetadataItem
                label="Uplink Payload Size"
                value={result?.payloadSize ?? (result ? (isReferable ? "0.65 MB (Compressed XAI)" : "0.00 MB") : "--")}
              />
              <MetadataItem
                label="2G/3G Upload Time"
                value={result?.networkLatency ?? "--"}
              />
              <div className="pt-2 border-t border-[var(--color-gray-line)]/60 flex items-center justify-between text-xs">
                <span className="text-[var(--color-gray)] font-medium">Queue Priority:</span>
                <span
                  className={`font-semibold ${
                    result
                      ? severityIndex >= 4
                        ? "text-red-600"
                        : isReferable
                          ? "text-[var(--color-amber)]"
                          : "text-[var(--color-gray)]"
                      : "text-[var(--color-gray)]"
                  }`}
                >
                  {result?.doctorQueuePriority ?? "--"}
                </span>
              </div>
            </EditorialCard>

            {/* 5-Stage Probability Distribution */}
            <EditorialCard
              title="5-Stage Probability Distribution"
              icon={<BarChart3 className="h-3.5 w-3.5 text-[var(--color-teal)]" />}
            >
              <div className="space-y-2 pt-1">
                {ICDR_SHORT.map((label, i) => {
                  const prob = probabilities[i]?.confidence ?? 0;
                  const pct = (prob * 100).toFixed(1);
                  const isMax = i === severityIndex;
                  return (
                    <div key={label} className="text-xs">
                      <div className="flex items-center justify-between font-mono text-[11px] mb-1">
                        <span className={isMax ? "font-semibold text-[var(--color-ink)]" : "text-[var(--color-gray)]"}>
                          {label}
                        </span>
                        <span className={isMax ? "font-semibold text-[var(--color-ink)]" : "text-[var(--color-gray)]"}>
                          {pct}%
                        </span>
                      </div>
                      <div className="h-2 w-full bg-[var(--color-paper-alt)] border border-[var(--color-gray-line)] rounded-sm overflow-hidden">
                        <div
                          className="h-full rounded-sm transition-all duration-500 ease-out"
                          style={{
                            width: `${Math.max(prob * 100, 0.5)}%`,
                            backgroundColor: ICDR_COLORS[i],
                            opacity: isMax ? 1 : 0.6,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </EditorialCard>
          </div>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-[var(--color-gray-line)] bg-[var(--color-paper)] py-4 px-6 text-xs text-[var(--color-gray)]">
        <div className="mx-auto max-w-[1500px] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            Netra Rakshak CDSS v2.6 • Validated against APTOS, DRIVE, IDRiD, & Messidor-2 cohorts
          </div>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5 text-[var(--color-green)] font-medium">
              <CheckCircle2 className="h-3.5 w-3.5" /> MATLAB Trained ResNet-50 Pipeline
            </span>
            <span>© {new Date().getFullYear()} Team Netra Rakshak</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ─── Editorial Sub-Components ───────────────────────────── */

function EditorialCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-[var(--color-gray-line)] bg-[var(--color-paper)] rounded shadow-xs overflow-hidden">
      <div className="px-3.5 py-2.5 border-b border-[var(--color-gray-line)] flex items-center gap-2 bg-[var(--color-paper)]">
        {icon}
        <h3 className="font-sans text-[11px] uppercase tracking-wider font-semibold text-[var(--color-ink)]">
          {title}
        </h3>
      </div>
      <div className="p-3.5 space-y-2">{children}</div>
    </div>
  );
}

function MetadataItem({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: "amber" | "green";
}) {
  return (
    <div className="flex items-baseline justify-between gap-3 text-xs">
      <span className="text-[var(--color-gray)] font-medium shrink-0">{label}:</span>
      <span
        className={`text-right font-medium truncate ${
          highlight === "amber"
            ? "text-[var(--color-amber)] font-semibold"
            : highlight === "green"
              ? "text-[var(--color-green)] font-semibold"
              : "text-[var(--color-ink)] font-semibold"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function QuadrantCard({
  number,
  title,
  imageUrl,
  placeholder,
}: {
  number: string;
  title: string;
  imageUrl?: string | null;
  placeholder: string;
}) {
  return (
    <div className="border border-[var(--color-gray-line)] bg-[var(--color-paper)] rounded overflow-hidden flex flex-col">
      <div className="px-2.5 py-1.5 border-b border-[var(--color-gray-line)] bg-[var(--color-paper)] flex items-center justify-between text-[11px] font-semibold text-[var(--color-ink)]">
        <span className="truncate">
          {number}. {title}
        </span>
      </div>
      <div className="aspect-square bg-[#0B0F17] relative flex items-center justify-center overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-contain"
          />
        ) : (
          <span className="text-xs text-[var(--color-gray)] px-3 text-center">
            {placeholder}
          </span>
        )}
      </div>
    </div>
  );
}
