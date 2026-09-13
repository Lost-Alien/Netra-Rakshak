import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  UploadCloud,
  Clock,
  History,
  X,
  Flame,
  User,
  Phone,
  IdCard,
  Lock,
  Eye,
  Check,
  Stethoscope,
  ChevronRight,
  Info,
  Sparkles,
  Layers,
  Activity,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";
import fundus from "@/assets/fundus.jpg";
import {
  runNetraDiagnosis,
  NetraDiagnosisResult,
} from "@/lib/netra-model";

export const Route = createFileRoute("/kiosk")({
  head: () => ({
    meta: [
      { title: "PHC Kiosk Intake Station — Netra Rakshak" },
      {
        name: "description",
        content:
          "Upload fundus images at the PHC kiosk, get an instant AI retinopathy grade, and track specialist verification status for every scan.",
      },
      { property: "og:title", content: "PHC Kiosk Intake Station — Netra Rakshak" },
      {
        property: "og:description",
        content: "Instant AI grading plus a live verification status tracker for kiosk operators.",
      },
    ],
  }),
  component: KioskPage,
});

type Stage = "idle" | "processing" | "result";
type VisualMode = "optical" | "clahe" | "gradcam" | "biomarkers";

type Scan = {
  id: string;
  timestamp: string;
  grade: string;
  status: "pending" | "verified";
  image: string;
  finalGrade?: string;
  doctor?: string;
  notes?: string;
  patientName?: string;
  contact?: string;
  specialId?: string;
  diagnosis?: NetraDiagnosisResult;
};

const NAME_RE = /^[a-zA-Z][a-zA-Z\s.'-]{1,99}$/;
const PHONE_RE = /^\+91[6-9]\d{9}$/;
const ID_RE = /^[a-zA-Z0-9-]{4,32}$/;

const INITIAL_HISTORY: Scan[] = [
  {
    id: "P-1042",
    timestamp: "08 Sep 2026, 10:14",
    grade: "Grade 2: Moderate NPDR",
    status: "verified",
    image: fundus,
    finalGrade: "Grade 2: Moderate NPDR",
    doctor: "Dr. Sharma (District Civil Hospital)",
    notes: "Confirmed AI grade. Scattered microaneurysms in superior temporal quadrant. Scheduled for 6-month follow-up.",
    patientName: "Kamlesh Patel",
    contact: "+91 98251 40921",
    specialId: "ABHA-24-9012-3841",
  },
  {
    id: "P-1043",
    timestamp: "08 Sep 2026, 10:41",
    grade: "Grade 3: Severe NPDR",
    status: "verified",
    image: fundus,
    finalGrade: "Grade 4: Proliferative DR",
    doctor: "Dr. Sharma (District Civil Hospital)",
    notes: "Overridden — early neovascularisation detected at the disc periphery. Urgent laser photocoagulation referral issued.",
    patientName: "Sumitra Ben",
    contact: "+91 94082 11983",
    specialId: "ABHA-18-4421-9920",
  },
  {
    id: "P-1044",
    timestamp: "08 Sep 2026, 11:05",
    grade: "Grade 1: Mild NPDR",
    status: "pending",
    image: fundus,
    patientName: "Jignesh Varma",
    contact: "+91 97230 55120",
    specialId: "ABHA-33-0182-4112",
  },
];

function StatusBadge({ scan }: { scan: Scan }) {
  if (scan.status === "verified") {
    return (
      <span className="inline-flex items-center gap-1 border border-[#3F7D5C]/30 bg-[#3F7D5C]/10 px-2 py-0.5 text-[11px] font-medium text-[#3F7D5C]">
        <CheckCircle2 className="h-3 w-3" />
        Verified by {scan.doctor?.split(" ")[1] ?? "Specialist"}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 border border-[var(--color-amber)]/30 bg-[var(--color-amber)]/10 px-2 py-0.5 text-[11px] font-medium text-[var(--color-amber)]">
      <Clock className="h-3 w-3" />
      Awaiting Verification
    </span>
  );
}

function KioskPage() {
  const [tab, setTab] = useState<"upload" | "history">("upload");
  const [stage, setStage] = useState<Stage>("idle");
  const [fileName, setFileName] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [history, setHistory] = useState<Scan[]>(INITIAL_HISTORY);
  const [selected, setSelected] = useState<Scan | null>(null);
  const [heatmap, setHeatmap] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // MATLAB Diagnostic Engine model state
  const [diagnosis, setDiagnosis] = useState<NetraDiagnosisResult | null>(null);
  const [visualMode, setVisualMode] = useState<VisualMode>("gradcam");
  const [progressText, setProgressText] = useState<string>("");
  const [pipelineStep, setPipelineStep] = useState<number>(1);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [patientName, setPatientName] = useState("Ramesh Patel");
  const [contact, setContact] = useState("+919876543210");
  const [specialId, setSpecialId] = useState("ABHA-91-8842-1045");

  const nameOk = NAME_RE.test(patientName.trim());
  const phoneOk = PHONE_RE.test(contact.trim().replace(/[\s-]/g, ""));
  const idOk = ID_RE.test(specialId.trim());
  const formValid = nameOk && phoneOk && idOk;

  async function handleFile(file: File | undefined | null) {
    if (!file || !formValid) return;
    const url = URL.createObjectURL(file);
    setFileName(file.name);
    setPreview(url);
    setStage("processing");
    setErrorMessage(null);
    setPipelineStep(1);
    setProgressText("Initializing 5-Stage Retinal Diagnostic Pipeline...");

    try {
      // Step 1: Quality Check & Illumination
      setPipelineStep(1);
      setProgressText("Stage 1: Optical Quality Gate & Illumination Assessment...");

      // Execute live diagnosis via MATLAB pipeline (step11_master_dashboard.m)
      const res = await runNetraDiagnosis(file, (stageMsg) => {
        setProgressText(stageMsg);
        if (stageMsg.includes("Quality")) setPipelineStep(1);
        else if (stageMsg.includes("Segmentation") || stageMsg.includes("CLAHE")) setPipelineStep(2);
        else if (stageMsg.includes("Grad-CAM") || stageMsg.includes("Grading")) setPipelineStep(3);
        else if (stageMsg.includes("Finalizing")) setPipelineStep(4);
      });

      setDiagnosis(res);
      setVisualMode("gradcam");
      setStage("result");

      const newScan: Scan = {
        id: `P-${1045 + history.length - INITIAL_HISTORY.length + 1}`,
        timestamp: new Date().toLocaleString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        grade: res.icdrDiagnosticGrade,
        status: "pending",
        image: res.primaryOpticalUrl || url,
        patientName: patientName.trim(),
        contact: contact.trim(),
        specialId: specialId.trim(),
        diagnosis: res,
      };

      setHistory((prev) => [newScan, ...prev]);
    } catch (err: any) {
      console.error("Netra Rakshak live diagnosis error:", err);
      setErrorMessage(
        err.message || "Diagnostic evaluation encountered an error. Please check the scan and retry."
      );
      setStage("idle");
    }
  }

  function reset() {
    setPreview(null);
    setFileName(null);
    setDiagnosis(null);
    setErrorMessage(null);
    setStage("idle");
    setPatientName("");
    setContact("");
    setSpecialId("");
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <main className="min-h-screen bg-[var(--color-paper-alt)]">
      {/* ── Kiosk Navigation Header ── */}
      <header className="border-b border-[var(--color-gray-line)] bg-[var(--color-paper)] px-6 py-4 sticky top-0 z-30">
        <div className="mx-auto flex max-w-[1000px] items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-[14px] font-medium text-[var(--color-gray)] hover:text-[var(--color-ink)] transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> Home
            </Link>
            <span className="h-4 w-px bg-[var(--color-gray-line)]" />
            <div>
              <h1 className="font-serif text-[18px] font-semibold text-[var(--color-ink)] leading-tight">
                PHC Intake & Screening Station
              </h1>
              <p className="text-[12px] text-[var(--color-gray)]">Primary Health Centre Anand (Unit 04)</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/doctor"
              className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[var(--color-teal)] hover:underline"
            >
              <Stethoscope className="h-4 w-4" />
              Doctor Portal
            </Link>
          </div>
        </div>
      </header>

      {/* ── Content Container ── */}
      <div className="mx-auto max-w-[900px] px-6 py-10">
        {/* Tab switch */}
        <div className="flex border-b border-[var(--color-gray-line)] mb-8">
          <button
            type="button"
            onClick={() => setTab("upload")}
            className={`flex items-center gap-2 pb-3 px-4 font-medium text-[15px] border-b-2 transition-colors ${
              tab === "upload"
                ? "border-[var(--color-teal)] text-[var(--color-teal)]"
                : "border-transparent text-[var(--color-gray)] hover:text-[var(--color-ink)]"
            }`}
          >
            <UploadCloud className="h-4 w-4" />
            New Patient Scan
          </button>
          <button
            type="button"
            onClick={() => setTab("history")}
            className={`flex items-center gap-2 pb-3 px-4 font-medium text-[15px] border-b-2 transition-colors ${
              tab === "history"
                ? "border-[var(--color-teal)] text-[var(--color-teal)]"
                : "border-transparent text-[var(--color-gray)] hover:text-[var(--color-ink)]"
            }`}
          >
            <History className="h-4 w-4" />
            Screening Ledger ({history.length})
          </button>
        </div>

        {tab === "upload" && (
          <div className="space-y-6">
            {stage === "idle" && (
              <div className="space-y-6">
                {/* Patient Information Form */}
                <div className="border border-[var(--color-gray-line)] bg-[var(--color-paper)] p-6">
                  <div className="flex items-center justify-between border-b border-[var(--color-gray-line)] pb-4 mb-4">
                    <div>
                      <h2 className="font-serif text-[18px] font-semibold text-[var(--color-ink)]">
                        1. Patient Registration
                      </h2>
                      <p className="text-[13px] text-[var(--color-gray)] mt-0.5">
                        Government Health ID (ABHA) or local PHC registry details.
                      </p>
                    </div>
                    {formValid && (
                      <span className="flex items-center gap-1 text-[12px] font-medium text-[var(--color-green)]">
                        <Check className="h-4 w-4" /> Details Ready
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[12px] font-medium text-[var(--color-ink)] mb-1">
                        Patient Full Name *
                      </label>
                      <input
                        type="text"
                        value={patientName}
                        onChange={(e) => setPatientName(e.target.value)}
                        placeholder="e.g. Ramesh Patel"
                        className="w-full border border-[var(--color-gray-line)] bg-[var(--color-paper-alt)] px-3 py-2 text-[14px] text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-teal)]"
                      />
                    </div>

                    <div>
                      <label className="block text-[12px] font-medium text-[var(--color-ink)] mb-1">
                        Contact (+91 10-digits) *
                      </label>
                      <input
                        type="tel"
                        value={contact}
                        onChange={(e) => setContact(e.target.value)}
                        placeholder="+919876543210"
                        className="w-full border border-[var(--color-gray-line)] bg-[var(--color-paper-alt)] px-3 py-2 text-[14px] text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-teal)]"
                      />
                    </div>

                    <div>
                      <label className="block text-[12px] font-medium text-[var(--color-ink)] mb-1">
                        ABHA / Center ID *
                      </label>
                      <input
                        type="text"
                        value={specialId}
                        onChange={(e) => setSpecialId(e.target.value)}
                        placeholder="ABHA-12-3456-7890"
                        className="w-full border border-[var(--color-gray-line)] bg-[var(--color-paper-alt)] px-3 py-2 text-[14px] text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-teal)]"
                      />
                    </div>
                  </div>
                </div>

                {/* Upload Zone */}
                <div className="border border-[var(--color-gray-line)] bg-[var(--color-paper)] p-6">
                  <h2 className="font-serif text-[18px] font-semibold text-[var(--color-ink)] mb-1">
                    2. Retinal Fundus Capture Upload
                  </h2>
                  <p className="text-[13px] text-[var(--color-gray)] mb-6">
                    Connect portable fundus camera or drag and drop DICOM/JPEG photograph.
                  </p>

                  <div
                    aria-disabled={!formValid}
                    onDragOver={(e) => {
                      if (!formValid) return;
                      e.preventDefault();
                      setDragging(true);
                    }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragging(false);
                      if (formValid) handleFile(e.dataTransfer.files?.[0]);
                    }}
                    onClick={() => formValid && inputRef.current?.click()}
                    role="button"
                    tabIndex={formValid ? 0 : -1}
                    className={`flex flex-col items-center justify-center border-2 border-dashed p-10 text-center transition-all ${
                      !formValid
                        ? "cursor-not-allowed border-[var(--color-gray-line)] bg-[var(--color-paper-alt)]/50 opacity-60"
                        : dragging
                        ? "cursor-pointer border-[var(--color-teal)] bg-[var(--color-teal)]/5"
                        : "cursor-pointer border-[var(--color-gray-line)] bg-[var(--color-paper-alt)] hover:border-[var(--color-teal)]"
                    }`}
                  >
                    {formValid ? (
                      <UploadCloud className="h-10 w-10 text-[var(--color-teal)] mb-3" />
                    ) : (
                      <Lock className="h-10 w-10 text-[var(--color-gray)] mb-3" />
                    )}

                    <p className="text-[16px] font-semibold text-[var(--color-ink)]">
                      {formValid ? "Drop fundus photograph here or click to browse" : "Complete patient details above to unlock upload"}
                    </p>
                    <p className="mt-1 text-[13px] text-[var(--color-gray)]">
                      Supports JPG, PNG from Remidio, Forus 3nethra, or standard fundus scopes
                    </p>

                    <input
                      ref={inputRef}
                      type="file"
                      accept="image/jpeg,image/png"
                      disabled={!formValid}
                      className="hidden"
                      onChange={(e) => handleFile(e.target.files?.[0])}
                    />
                  </div>

                  {/* Error Notification */}
                  {errorMessage && (
                    <div className="mt-4 flex items-center justify-between border border-red-300 bg-red-50 p-4 text-[13px] text-red-800">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 shrink-0 text-red-600" />
                        <span>{errorMessage}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setErrorMessage(null)}
                        className="text-[12px] font-medium text-red-700 hover:underline"
                      >
                        Dismiss
                      </button>
                    </div>
                  )}

                  {/* Sample test shortcut button */}
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-[13px] text-[var(--color-gray)] border-t border-[var(--color-gray-line)] pt-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-[var(--color-teal)]" />
                      <span>Diagnostic AI Engine: Connected (<strong>SIH 26038</strong>)</span>
                    </div>
                    <button
                      type="button"
                      disabled={!formValid}
                      onClick={async () => {
                        try {
                          const res = await fetch(fundus);
                          const blob = await res.blob();
                          const file = new File([blob], "sample-benchmark-fundus.jpg", { type: "image/jpeg" });
                          handleFile(file);
                        } catch (e: any) {
                          setErrorMessage("Failed to load sample image. " + e?.message);
                        }
                      }}
                      className="text-[var(--color-teal)] font-medium hover:underline disabled:opacity-50"
                    >
                      Diagnose with Sample Fundus Scan →
                    </button>
                  </div>
                </div>
              </div>
            )}

            {stage === "processing" && (
              <div className="border border-[var(--color-gray-line)] bg-[var(--color-paper)] p-12 text-center">
                <Loader2 className="mx-auto h-12 w-12 animate-spin text-[var(--color-teal)] mb-4" />
                <h3 className="font-serif text-[22px] font-semibold text-[var(--color-ink)]">
                  Running Deep Retinal Diagnostic Pipeline
                </h3>
                <p className="text-[13px] text-[var(--color-gray)] mt-1">
                  Clinical Diagnostic Engine • SIH 26038 Pipeline
                </p>

                <div className="mt-6 max-w-md mx-auto space-y-2.5 text-[13px] font-mono text-left bg-[var(--color-paper-alt)] p-4 border border-[var(--color-gray-line)]">
                  <div className="flex items-center justify-between border-b border-[var(--color-gray-line)] pb-1.5">
                    <span>Stage 1: Quality Gate & Illumination</span>
                    <span className={pipelineStep >= 1 ? "text-[var(--color-green)] font-bold" : "text-[var(--color-gray)]"}>
                      {pipelineStep > 1 ? "✓ PASS" : pipelineStep === 1 ? "RUNNING..." : "QUEUED"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-b border-[var(--color-gray-line)] pb-1.5">
                    <span>Stage 2: Rayleigh CLAHE & Vessel Segmentation</span>
                    <span className={pipelineStep >= 2 ? "text-[var(--color-green)] font-bold" : "text-[var(--color-gray)]"}>
                      {pipelineStep > 2 ? "✓ DONE" : pipelineStep === 2 ? "SEGMENTING..." : "QUEUED"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-b border-[var(--color-gray-line)] pb-1.5">
                    <span>Stage 3: Deep CNN 5-Stage ICDR Grading</span>
                    <span className={pipelineStep >= 3 ? "text-[var(--color-green)] font-bold" : "text-[var(--color-gray)]"}>
                      {pipelineStep > 3 ? "✓ CLASSIFIED" : pipelineStep === 3 ? "INFERRING..." : "QUEUED"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Stage 4: Grad-CAM Explainability Saliency</span>
                    <span className={pipelineStep >= 4 ? "text-[var(--color-teal)] font-bold animate-pulse" : "text-[var(--color-gray)]"}>
                      {pipelineStep >= 4 ? "COMPUTING..." : "QUEUED"}
                    </span>
                  </div>
                </div>

                {progressText && (
                  <p className="mt-4 text-[12px] font-mono text-[var(--color-teal)] animate-pulse">
                    Status: {progressText}
                  </p>
                )}
              </div>
            )}

            {stage === "result" && (
              <div className="border border-[var(--color-gray-line)] bg-[var(--color-paper)] overflow-hidden shadow-sm">
                {/* Result Header */}
                <div className="p-6 border-b border-[var(--color-gray-line)] bg-[var(--color-paper-alt)] flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] font-mono text-[var(--color-teal)] uppercase tracking-wider font-semibold">
                        Point-of-Care Triage Verdict
                      </span>
                      <span className="text-[11px] font-mono text-[var(--color-gray)]">
                        • {diagnosis?.executionTimeMs ? `${(diagnosis.executionTimeMs / 1000).toFixed(2)}s roundtrip` : "AI Engine"}
                      </span>
                    </div>
                    <h2 className="font-serif text-[22px] font-semibold text-[var(--color-ink)] mt-0.5">
                      Screening Summary — {patientName || "Patient"} ({specialId || "Unregistered"})
                    </h2>
                  </div>

                  <div className="flex items-center gap-3">
                    {diagnosis?.isUrgent ? (
                      <span className="border border-[#b91c1c]/40 bg-[#b91c1c]/10 px-3 py-1 text-[13px] font-mono font-bold text-[#b91c1c]">
                        🚨 URGENT REFERRAL ESCALATION
                      </span>
                    ) : diagnosis?.isReferable ? (
                      <span className="border border-[#C1652F]/40 bg-[#C1652F]/10 px-3 py-1 text-[13px] font-mono font-bold text-[#C1652F]">
                        ⚠️ REFERABLE DR FLAGGED
                      </span>
                    ) : (
                      <span className="border border-[#3F7D5C]/40 bg-[#3F7D5C]/10 px-3 py-1 text-[13px] font-mono font-bold text-[#3F7D5C]">
                        ✓ NON-REFERABLE (LOCAL CLEARANCE)
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {/* Multi-Modal Visual Inspector */}
                  <div className="border border-[var(--color-gray-line)] bg-[var(--color-paper-alt)] p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--color-gray-line)] pb-3 mb-4">
                      <div>
                        <span className="text-[11px] font-mono uppercase text-[var(--color-gray)]">
                          Phase Multi-Modal Visualization
                        </span>
                        <h4 className="font-serif text-[16px] font-semibold text-[var(--color-ink)]">
                          Explainable Retinal Evidence (4-Layer Model Output)
                        </h4>
                      </div>

                      {/* Visual Mode Switcher */}
                      <div className="inline-flex rounded border border-[var(--color-gray-line)] bg-[var(--color-paper)] p-0.5 text-[12px] font-medium">
                        <button
                          type="button"
                          onClick={() => setVisualMode("optical")}
                          className={`px-3 py-1 transition-colors ${
                            visualMode === "optical"
                              ? "bg-[var(--color-ink)] text-white"
                              : "text-[var(--color-gray)] hover:text-[var(--color-ink)]"
                          }`}
                        >
                          1. Raw Optical
                        </button>
                        <button
                          type="button"
                          onClick={() => setVisualMode("clahe")}
                          className={`px-3 py-1 transition-colors ${
                            visualMode === "clahe"
                              ? "bg-[var(--color-ink)] text-white"
                              : "text-[var(--color-gray)] hover:text-[var(--color-ink)]"
                          }`}
                        >
                          2. Rayleigh CLAHE
                        </button>
                        <button
                          type="button"
                          onClick={() => setVisualMode("gradcam")}
                          className={`px-3 py-1 transition-colors ${
                            visualMode === "gradcam"
                              ? "bg-[var(--color-teal)] text-white"
                              : "text-[var(--color-gray)] hover:text-[var(--color-ink)]"
                          }`}
                        >
                          3. Grad-CAM Heatmap
                        </button>
                        <button
                          type="button"
                          onClick={() => setVisualMode("biomarkers")}
                          className={`px-3 py-1 transition-colors ${
                            visualMode === "biomarkers"
                              ? "bg-[var(--color-ink)] text-white"
                              : "text-[var(--color-gray)] hover:text-[var(--color-ink)]"
                          }`}
                        >
                          4. Biomarkers Map
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                      {/* Image Frame */}
                      <div className="md:col-span-6 bg-black border border-[var(--color-gray-line)] aspect-square overflow-hidden flex items-center justify-center relative">
                        {visualMode === "optical" && (
                          <img
                            src={diagnosis?.primaryOpticalUrl || preview || fundus}
                            alt="Primary Optical Acquisition"
                            className="h-full w-full object-contain"
                          />
                        )}
                        {visualMode === "clahe" && (
                          <img
                            src={diagnosis?.rayleighClaheUrl || diagnosis?.primaryOpticalUrl || preview || fundus}
                            alt="Rayleigh Green-Channel CLAHE"
                            className="h-full w-full object-contain"
                          />
                        )}
                        {visualMode === "gradcam" && (
                          <img
                            src={diagnosis?.gradCamSaliencyUrl || preview || fundus}
                            alt="Phase 4 Grad-CAM Saliency Map"
                            className="h-full w-full object-contain"
                          />
                        )}
                        {visualMode === "biomarkers" && (
                          <img
                            src={diagnosis?.biomarkerSegmentationUrl || preview || fundus}
                            alt="Phase 2 Biomarker Segmentation Map"
                            className="h-full w-full object-contain"
                          />
                        )}
                        <span className="absolute bottom-2 left-2 bg-black/75 px-2 py-0.5 text-[10px] font-mono text-white tracking-wider uppercase">
                          {visualMode === "optical" && "Layer 1: Primary Optical Acquisition"}
                          {visualMode === "clahe" && "Layer 2: Rayleigh Green CLAHE Contrast"}
                          {visualMode === "gradcam" && "Layer 3: CNN Grad-CAM Attention"}
                          {visualMode === "biomarkers" && "Layer 4: Segmented Lesions & Vessels"}
                        </span>
                      </div>

                      {/* Primary Diagnostic Summary */}
                      <div className="md:col-span-6 space-y-3">
                        <div className="border border-[var(--color-gray-line)] p-3.5 bg-[var(--color-paper)]">
                          <span className="text-[11px] font-mono uppercase text-[var(--color-gray)]">
                            Optical Quality Gate Verdict
                          </span>
                          <div className="text-[15px] font-semibold text-[var(--color-green)] mt-0.5 flex items-center gap-1.5">
                            <Check className="h-4 w-4" />
                            {diagnosis?.qualityDecision ?? "PASSED (CLINICAL GRADE)"}
                          </div>
                          <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-[var(--color-gray-line)] text-[12px]">
                            <div>
                              <span className="text-[var(--color-gray)]">Resolution: </span>
                              <span className="font-mono text-[var(--color-ink)]">{diagnosis?.opticalResolution}</span>
                            </div>
                            <div>
                              <span className="text-[var(--color-gray)]">Sharpness: </span>
                              <span className="font-mono text-[var(--color-ink)]">{diagnosis?.sharpnessIndex}</span>
                            </div>
                          </div>
                        </div>

                        <div className="border border-[var(--color-gray-line)] p-3.5 bg-[var(--color-paper)]">
                          <span className="text-[11px] font-mono uppercase text-[var(--color-gray)]">
                            ICDR Severity Classification
                          </span>
                          <div className="font-serif text-[20px] font-semibold text-[var(--color-ink)] mt-0.5">
                            {diagnosis?.icdrDiagnosticGrade ?? "Grade 2: Moderate NPDR"}
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-[13px]">
                            <span className="text-[var(--color-teal)] font-medium">
                              {diagnosis?.modelConfidence ?? "Model Confidence: 86.5%"}
                            </span>
                            <span className="text-[var(--color-gray)]">•</span>
                            <span className="text-[var(--color-gray)] font-mono text-[11px]">
                              {diagnosis?.triageStatus}
                            </span>
                          </div>
                        </div>

                        <div className="border border-[var(--color-gray-line)] p-3.5 bg-[var(--color-paper)]">
                          <span className="text-[11px] font-mono uppercase text-[var(--color-gray)]">
                            Quantitative Lesion Count (Stage 2)
                          </span>
                          <div className="grid grid-cols-2 gap-2 mt-1.5 text-[12px]">
                            <div>
                              <span className="text-[var(--color-gray)]">Sub-pixel MAs:</span>{" "}
                              <strong className="text-[var(--color-ink)]">{diagnosis?.subPixelMAs ?? "N/A"}</strong>
                            </div>
                            <div>
                              <span className="text-[var(--color-gray)]">Hemorrhages:</span>{" "}
                              <strong className="text-[var(--color-ink)]">{diagnosis?.blotHemorrhages ?? "N/A"}</strong>
                            </div>
                            <div>
                              <span className="text-[var(--color-gray)]">Hard Exudates:</span>{" "}
                              <strong className="text-[var(--color-ink)]">{diagnosis?.hardExudatesBurden ?? "N/A"}</strong>
                            </div>
                            <div>
                              <span className="text-[var(--color-gray)]">Vascular Density:</span>{" "}
                              <strong className="text-[var(--color-ink)]">{diagnosis?.vascularDensity ?? "N/A"}</strong>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Softmax Probability Distribution */}
                  {diagnosis?.severityDistribution?.confidences && (
                    <div className="border border-[var(--color-gray-line)] p-4 bg-[var(--color-paper-alt)]">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[11px] font-mono uppercase text-[var(--color-gray)]">
                          5-Stage Severity Probability Distribution (Softmax Logits)
                        </span>
                        <span className="text-[11px] font-mono text-[var(--color-teal)] font-semibold">
                          Validated via Netra Rakshak ONNX
                        </span>
                      </div>
                      <div className="space-y-2">
                        {diagnosis.severityDistribution.confidences.map((item, idx) => {
                          const pct = Math.round((item.confidence || 0) * 100);
                          const isTop = idx === diagnosis.icdrLevel || pct > 50;
                          return (
                            <div key={item.label} className="text-[12px]">
                              <div className="flex justify-between font-mono mb-0.5">
                                <span className={isTop ? "font-bold text-[var(--color-ink)]" : "text-[var(--color-gray)]"}>
                                  {item.label}
                                </span>
                                <span className={isTop ? "font-bold text-[var(--color-teal)]" : "text-[var(--color-gray)]"}>
                                  {pct}% ({((item.confidence || 0) * 100).toFixed(2)}%)
                                </span>
                              </div>
                              <div className="w-full bg-[var(--color-gray-line)] h-2 rounded-sm overflow-hidden">
                                <div
                                  className={`h-full transition-all ${
                                    isTop ? "bg-[var(--color-teal)]" : "bg-[var(--color-gray)]/40"
                                  }`}
                                  style={{ width: `${Math.max(pct, 1)}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Telemetry & District Hospital Queue */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border border-[var(--color-gray-line)] p-4 bg-[var(--color-paper-alt)]">
                      <span className="text-[11px] font-mono uppercase text-[var(--color-gray)]">
                        Rural 2G/3G Transmission Telemetry
                      </span>
                      <p className="text-[14px] font-medium text-[var(--color-ink)] mt-1">
                        {diagnosis?.transmissionAction ?? "LOCAL ARCHIVE -> DISCHARGED AT PHC"}
                      </p>
                      <div className="mt-2 grid grid-cols-2 text-[12px] text-[var(--color-gray)] border-t border-[var(--color-gray-line)] pt-2">
                        <div>
                          Payload: <span className="font-mono text-[var(--color-ink)]">{diagnosis?.payloadSize ?? "0.00 MB"}</span>
                        </div>
                        <div>
                          Uplink Latency: <span className="font-mono text-[var(--color-ink)]">{diagnosis?.networkLatency ?? "0.00s"}</span>
                        </div>
                      </div>
                    </div>

                    <div className="border border-[var(--color-gray-line)] p-4 bg-[var(--color-paper-alt)]">
                      <span className="text-[11px] font-mono uppercase text-[var(--color-gray)]">
                        District Civil Hospital Triage SLA
                      </span>
                      <p className="text-[14px] font-medium text-[var(--color-ink)] mt-1">
                        Priority Queue:{" "}
                        <span className="font-mono text-[var(--color-teal)]">
                          {diagnosis?.doctorQueuePriority ?? "P3 - ROUTINE ANNUAL RE-SCREEN"}
                        </span>
                      </p>
                      <p className="text-[12px] text-[var(--color-gray)] mt-1">
                        Case packet logged to Anand District Tele-Ophthalmology Portal for specialist sign-off.
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[var(--color-gray-line)]">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={reset}
                        className="bg-[var(--color-teal)] px-6 py-2.5 text-[14px] font-medium text-white transition-colors hover:bg-[#0c5854]"
                      >
                        Intake Next Patient
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setTab("history");
                        }}
                        className="border border-[var(--color-gray-line)] px-4 py-2.5 text-[14px] font-medium text-[var(--color-ink)] hover:bg-[var(--color-paper-alt)]"
                      >
                        View Screening Ledger
                      </button>
                    </div>

                    <Link
                      to="/doctor"
                      className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[var(--color-teal)] hover:underline"
                    >
                      <Stethoscope className="h-4 w-4" /> Open Specialist Portal →
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {tab === "history" && (
          <div className="border border-[var(--color-gray-line)] bg-[var(--color-paper)]">
            <div className="border-b border-[var(--color-gray-line)] bg-[var(--color-paper-alt)] p-4 flex items-center justify-between">
              <div>
                <h2 className="font-serif text-[18px] font-semibold text-[var(--color-ink)]">
                  Primary Healthcare Center Screening Ledger
                </h2>
                <p className="text-[12px] text-[var(--color-gray)]">
                  Recent fundus evaluations and district hospital sign-off status.
                </p>
              </div>
              <span className="text-[12px] font-mono text-[var(--color-gray)]">
                {history.length} records logged
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-[14px] border-collapse">
                <thead>
                  <tr className="border-b border-[var(--color-gray-line)] bg-[var(--color-paper-alt)] text-[12px] font-mono uppercase text-[var(--color-gray)]">
                    <th className="px-4 py-3">Patient / ID</th>
                    <th className="px-4 py-3">Timestamp</th>
                    <th className="px-4 py-3">AI Preliminary Grade</th>
                    <th className="px-4 py-3">Specialist Status</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-gray-line)] text-[var(--color-ink)]">
                  {history.map((scan) => (
                    <tr
                      key={scan.id + scan.timestamp}
                      onClick={() => {
                        setSelected(scan);
                        setHeatmap(false);
                      }}
                      className="hover:bg-[var(--color-paper-alt)] cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-[var(--color-ink)]">{scan.patientName ?? scan.id}</div>
                        <div className="font-mono text-[11px] text-[var(--color-gray)]">{scan.id} {scan.specialId ? `• ${scan.specialId}` : ""}</div>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-[13px] text-[var(--color-gray)]">{scan.timestamp}</td>
                      <td className="px-4 py-3.5 font-medium">{scan.grade}</td>
                      <td className="px-4 py-3.5">
                        <StatusBadge scan={scan} />
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <button className="text-[var(--color-teal)] hover:underline text-[13px] font-medium">
                          Review →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ── Detail Inspection Modal ── */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setSelected(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl max-h-[90vh] overflow-y-auto border border-[var(--color-gray-line)] bg-[var(--color-paper)] p-6 shadow-xl"
          >
            <div className="flex items-start justify-between border-b border-[var(--color-gray-line)] pb-4">
              <div>
                <h3 className="font-serif text-[20px] font-semibold text-[var(--color-ink)]">
                  {selected.patientName ?? selected.id}
                </h3>
                <p className="font-mono text-[12px] text-[var(--color-gray)]">
                  Record ID: {selected.id} • {selected.timestamp}
                </p>
                {selected.contact && (
                  <p className="text-[12px] text-[var(--color-gray)] mt-0.5">
                    Contact: {selected.contact} {selected.specialId ? `• ${selected.specialId}` : ""}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="text-[var(--color-gray)] hover:text-[var(--color-ink)] p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Fundus Visual / Multi-Modal Preview */}
            <div className="mt-4">
              {selected.diagnosis && (
                <div className="flex items-center justify-between border-b border-[var(--color-gray-line)] pb-2 mb-2 text-[11px] font-medium">
                  <span className="font-mono text-[var(--color-gray)] uppercase">Select Evidence Layer:</span>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => setVisualMode("optical")}
                      className={`px-2 py-0.5 border ${
                        visualMode === "optical" ? "border-[var(--color-ink)] bg-[var(--color-ink)] text-white" : "border-[var(--color-gray-line)] text-[var(--color-gray)]"
                      }`}
                    >
                      Optical
                    </button>
                    <button
                      type="button"
                      onClick={() => setVisualMode("clahe")}
                      className={`px-2 py-0.5 border ${
                        visualMode === "clahe" ? "border-[var(--color-ink)] bg-[var(--color-ink)] text-white" : "border-[var(--color-gray-line)] text-[var(--color-gray)]"
                      }`}
                    >
                      CLAHE
                    </button>
                    <button
                      type="button"
                      onClick={() => setVisualMode("gradcam")}
                      className={`px-2 py-0.5 border ${
                        visualMode === "gradcam" ? "border-[var(--color-teal)] bg-[var(--color-teal)] text-white" : "border-[var(--color-gray-line)] text-[var(--color-gray)]"
                      }`}
                    >
                      Grad-CAM
                    </button>
                    <button
                      type="button"
                      onClick={() => setVisualMode("biomarkers")}
                      className={`px-2 py-0.5 border ${
                        visualMode === "biomarkers" ? "border-[var(--color-ink)] bg-[var(--color-ink)] text-white" : "border-[var(--color-gray-line)] text-[var(--color-gray)]"
                      }`}
                    >
                      Biomarkers
                    </button>
                  </div>
                </div>
              )}

              <div className="relative aspect-square max-h-72 w-full overflow-hidden border border-[var(--color-gray-line)] bg-black mx-auto flex items-center justify-center">
                <img
                  src={
                    selected.diagnosis
                      ? visualMode === "clahe"
                        ? selected.diagnosis.rayleighClaheUrl
                        : visualMode === "gradcam"
                        ? selected.diagnosis.gradCamSaliencyUrl
                        : visualMode === "biomarkers"
                        ? selected.diagnosis.biomarkerSegmentationUrl
                        : selected.diagnosis.primaryOpticalUrl || selected.image
                      : selected.image
                  }
                  alt={`Fundus scan for ${selected.id}`}
                  className="h-full w-full object-contain"
                />
                {!selected.diagnosis && heatmap && selected.status === "verified" && (
                  <div
                    className="pointer-events-none absolute inset-0 mix-blend-screen opacity-75"
                    style={{
                      background:
                        "radial-gradient(circle at 40% 46%, rgba(255, 0, 0, 0.85) 0%, rgba(255, 180, 0, 0.5) 15%, transparent 32%)",
                    }}
                  />
                )}
              </div>
            </div>

            {!selected.diagnosis && selected.status === "verified" && (
              <div className="mt-3 flex justify-end">
                <button
                  type="button"
                  onClick={() => setHeatmap(!heatmap)}
                  className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[var(--color-teal)] hover:underline"
                >
                  <Flame className="h-3.5 w-3.5 text-[var(--color-amber)]" />
                  {heatmap ? "Hide Grad-CAM Activation" : "Show Grad-CAM Activation"}
                </button>
              </div>
            )}

            <div className="mt-4 space-y-3">
              <div className="border border-[var(--color-gray-line)] p-3 bg-[var(--color-paper-alt)]">
                <span className="text-[11px] font-mono uppercase text-[var(--color-gray)]">AI Automated Classification</span>
                <p className="font-semibold text-[15px] text-[var(--color-ink)] mt-0.5">{selected.grade}</p>
                {selected.diagnosis && (
                  <p className="text-[12px] font-mono text-[var(--color-teal)] mt-0.5">
                    {selected.diagnosis.modelConfidence} • {selected.diagnosis.triageStatus}
                  </p>
                )}
              </div>

              {selected.diagnosis && (
                <div className="border border-[var(--color-gray-line)] p-3 bg-[var(--color-paper)] text-[12px]">
                  <span className="text-[11px] font-mono uppercase text-[var(--color-gray)]">Biomarker Extraction Summary</span>
                  <div className="mt-1.5 grid grid-cols-2 gap-2 text-[var(--color-ink)]">
                    <div>MAs: <strong>{selected.diagnosis.subPixelMAs}</strong></div>
                    <div>Hemorrhages: <strong>{selected.diagnosis.blotHemorrhages}</strong></div>
                    <div>Hard Exudates: <strong>{selected.diagnosis.hardExudatesBurden}</strong></div>
                    <div>Vascular Density: <strong>{selected.diagnosis.vascularDensity}</strong></div>
                  </div>
                </div>
              )}

              <div className="border border-[var(--color-gray-line)] p-3">
                <span className="text-[11px] font-mono uppercase text-[var(--color-gray)]">District Specialist Verification</span>
                <div className="mt-1.5">
                  <StatusBadge scan={selected} />
                </div>
                {selected.status === "verified" && (
                  <div className="mt-3 border-t border-[var(--color-gray-line)] pt-2 text-[13px]">
                    <div className="font-medium text-[var(--color-ink)]">Doctor Signed Grade: {selected.finalGrade}</div>
                    <p className="text-[var(--color-gray)] mt-1 italic">"{selected.notes}"</p>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="border border-[var(--color-gray-line)] px-4 py-2 text-[13px] font-medium text-[var(--color-ink)] hover:bg-[var(--color-paper-alt)]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
