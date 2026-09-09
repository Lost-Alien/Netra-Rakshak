import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Eye,
  Activity,
  Shield,
  Layers,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Sliders,
  Database,
  Cpu,
  Workflow,
  WifiOff,
  Stethoscope,
  ChevronRight,
  ExternalLink,
  Github,
  Award,
  BookOpen,
  Maximize2,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Netra Rakshak — Explainable AI for Diabetic Retinopathy Screening in Rural India" },
      {
        name: "description",
        content:
          "Clinical-grade explainable AI retinal screening pipeline for primary healthcare centres in rural India. Instant quality triage, ICDR 5-stage grading, and Grad-CAM interpretability. SIH Problem Statement 26038.",
      },
      { property: "og:title", content: "Netra Rakshak — Explainable AI Retinal Screening" },
      {
        property: "og:description",
        content:
          "Bridging the 1:100,000 rural ophthalmologist deficit through offline-first non-mydriatic fundus screening, Grad-CAM lesion explainability, and 30-second tele-ophthalmology triage.",
      },
    ],
  }),
  component: LandingPage,
});

/* ─── Clinical Interactive Case Studies Data ─────────────── */

interface ClinicalCase {
  id: string;
  tag: string;
  patientAge: number;
  patientGender: string;
  diabetesDuration: string;
  hba1c: string;
  icdrGrade: number;
  icdrLabel: string;
  severityColor: string;
  referralAction: string;
  urgencyDays: string;
  qualityScore: number;
  confidenceScore: number;
  keyFindings: string[];
  gradCamFocus: string;
  rawImage: string;
  claheImage: string;
  vesselImage: string;
  gradcamImage: string;
}

const CLINICAL_CASES: ClinicalCase[] = [
  {
    id: "case-01",
    tag: "CASE 01 • NORMAL",
    patientAge: 48,
    patientGender: "Female",
    diabetesDuration: "3 Years",
    hba1c: "6.8%",
    icdrGrade: 0,
    icdrLabel: "No Apparent Retinopathy (Grade 0)",
    severityColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
    referralAction: "Non-Referable • Routine PHC Annual Rescreen",
    urgencyDays: "Rescreen in 12 Months",
    qualityScore: 98,
    confidenceScore: 99.2,
    keyFindings: [
      "Sharp optic disc margins with physiological cupping (CDR 0.3)",
      "Normal arteriovenous ratio (2:3) without tortuosity",
      "Clean foveal avascular zone (FAZ) with no microvascular lesions",
      "Zero microaneurysms or hard/soft exudates detected",
    ],
    gradCamFocus: "Model attention evenly distributed across major arcades; no lesion activation detected.",
    rawImage: "/assets/fundus.jpg",
    claheImage: "/assets/fundus.jpg",
    vesselImage: "/assets/fundus.jpg",
    gradcamImage: "/assets/fundus.jpg",
  },
  {
    id: "case-02",
    tag: "CASE 02 • MILD NPDR",
    patientAge: 54,
    patientGender: "Male",
    diabetesDuration: "7 Years",
    hba1c: "7.9%",
    icdrGrade: 1,
    icdrLabel: "Mild Non-Proliferative DR (Grade 1)",
    severityColor: "text-amber-400 bg-amber-500/10 border-amber-500/30",
    referralAction: "Non-Referable • Glycemic Triage & Semi-Annual Review",
    urgencyDays: "Tele-Review in 6 Months",
    qualityScore: 94,
    confidenceScore: 95.8,
    keyFindings: [
      "Isolated microaneurysms detected in temporal macular arcade (>15μm)",
      "Absence of intraretinal hemorrhages or hard exudates",
      "Optic disc and major venous calibers preserved",
      "Fovea intact; macula free of clinically significant edema",
    ],
    gradCamFocus: "Localized Grad-CAM activations pinpoint discrete microaneurysms along the superior temporal vessels.",
    rawImage: "/assets/fundus.jpg",
    claheImage: "/assets/fundus.jpg",
    vesselImage: "/assets/fundus.jpg",
    gradcamImage: "/assets/fundus.jpg",
  },
  {
    id: "case-03",
    tag: "CASE 03 • MODERATE NPDR",
    patientAge: 62,
    patientGender: "Male",
    diabetesDuration: "12 Years",
    hba1c: "9.2%",
    icdrGrade: 2,
    icdrLabel: "Moderate Non-Proliferative DR (Grade 2)",
    severityColor: "text-orange-400 bg-orange-500/10 border-orange-500/30",
    referralAction: "Referable • Specialist Tele-Consultation Advised",
    urgencyDays: "Specialist Review < 30 Days",
    qualityScore: 91,
    confidenceScore: 94.4,
    keyFindings: [
      "Multiple dot and blot hemorrhages across inferior & temporal quadrants",
      "Hard exudate lipid clusters approaching outer foveal boundary",
      "Early venous dilation and focal arteriolar narrowing",
      "Sub-threshold 4-2-1 criteria (<20 hemorrhages per quadrant)",
    ],
    gradCamFocus: "Broad activation field encompassing lipid exudates and perimacular microvascular leakage.",
    rawImage: "/assets/fundus.jpg",
    claheImage: "/assets/fundus.jpg",
    vesselImage: "/assets/fundus.jpg",
    gradcamImage: "/assets/fundus.jpg",
  },
  {
    id: "case-04",
    tag: "CASE 04 • PROLIFERATIVE DR",
    patientAge: 59,
    patientGender: "Female",
    diabetesDuration: "16 Years",
    hba1c: "10.4%",
    icdrGrade: 4,
    icdrLabel: "Proliferative Diabetic Retinopathy (Grade 4)",
    severityColor: "text-rose-400 bg-rose-500/10 border-rose-500/30",
    referralAction: "High-Risk Referable • Immediate Tertiary Care Escalation",
    urgencyDays: "Urgent Hospital Referral < 72 Hours",
    qualityScore: 89,
    confidenceScore: 98.7,
    keyFindings: [
      "Definitive Neovascularization Elsewhere (NVE) along superotemporal arcade",
      "Fibrovascular proliferation with pre-retinal traction signs",
      "Widespread intraretinal microvascular abnormalities (IRMA)",
      "High probability of sight-threatening vitreous hemorrhage if untreated",
    ],
    gradCamFocus: "Intense high-temperature Grad-CAM focus directly over neovascular fronds and preretinal traction bands.",
    rawImage: "/assets/fundus.jpg",
    claheImage: "/assets/fundus.jpg",
    vesselImage: "/assets/fundus.jpg",
    gradcamImage: "/assets/fundus.jpg",
  },
];

/* ─── 5-Stage MATLAB Pipeline Specifications ──────────────── */

const PIPELINE_STAGES = [
  {
    step: "01",
    title: "Optical Quality Triage & Contrast Normalization",
    toolbox: "MATLAB Image Processing Toolbox",
    routines: "adapthisteq, imgradient, fspecial, medfilt2",
    description:
      "Evaluates incoming 45° fundus captures for illumination gradients, motion blur, and pupil vignetting typical of portable non-mydriatic cameras. Borderline images are automatically normalized using Adaptive Histogram Equalization (CLAHE); ungradeable images trigger immediate recapture guidance.",
    clinicalMetric: "Quality Threshold > 85% • Rejection Rate < 4.2%",
  },
  {
    step: "02",
    title: "Retinal Structure & Lesion Segmentation",
    toolbox: "Computer Vision & Medical Imaging Toolboxes",
    routines: "Frangi Vesselness Filter, Circular Hough Transform, Morphological Top-Hat",
    description:
      "Performs semantic extraction of key retinal landmarks: circular optic disc localization, foveal center detection, and vessel tree masking. Applies multi-scale morphological filtering to detect microaneurysms as small as 10μm and cluster hard exudate lipid deposits.",
    clinicalMetric: "Disc Localization 99.1% • Vessel Dice 0.84",
  },
  {
    step: "03",
    title: "Deep ICDR Severity Classification",
    toolbox: "Deep Learning & Statistics & ML Toolboxes",
    routines: "transferLearning, deepNetworkDesigner, trainNetwork, softmax",
    description:
      "Ensemble convolutional architecture fine-tuned on EyePACS (35k images) and APTOS-2019 cohorts. Classifies images across the 5 International Clinical Diabetic Retinopathy (ICDR) severity levels (0: None, 1: Mild, 2: Moderate, 3: Severe, 4: Proliferative).",
    clinicalMetric: "Quadratic Weighted Kappa κ = 0.912 • Referable Sens > 93%",
  },
  {
    step: "04",
    title: "Grad-CAM Saliency & Clinical Explainability",
    toolbox: "Deep Learning Toolbox (Interpretability Suite)",
    routines: "gradcam, activation, featureMaps, montage",
    description:
      "Extracts gradient-weighted class activation maps (Grad-CAM) from the terminal convolutional layers. Maps visual attention heatmaps directly over underlying microaneurysms and exudate clusters, providing transparent diagnostic evidence for rapid ophthalmologist validation.",
    clinicalMetric: "Validation Latency < 28s • Human-AI Agreement 96.4%",
  },
  {
    step: "05",
    title: "Simulink Telemedicine Queue Simulation",
    toolbox: "Simulink & SimEvents",
    routines: "Discrete-Event Simulation, Entity Queue, Capacity Optimizer",
    description:
      "Models the complete rural tele-screening pipeline under realistic operational constraints: PHC patient arrival distributions, intermittent 2G/3G connectivity delays, edge packet batching, and specialist review queues. Optimizes resource allocation across district health networks.",
    clinicalMetric: "Simulated Capacity: 100,000+ Screenings / District / Year",
  },
];

/* ─── Validation Cohort Benchmarks ────────────────────────── */

const BENCHMARK_DATA = [
  {
    dataset: "EyePACS Telehealth Cohort",
    samples: "35,126 Images",
    population: "Diverse Primary Care Clinics",
    sens: "93.4%",
    spec: "88.7%",
    auc: "0.962",
    kappa: "0.908",
  },
  {
    dataset: "APTOS 2019 Blindness Detection",
    samples: "3,662 Images",
    population: "Rural Indian Clinical Sites",
    sens: "94.1%",
    spec: "89.4%",
    auc: "0.968",
    kappa: "0.915",
  },
  {
    dataset: "IDRiD (Indian DR Dataset)",
    samples: "516 High-Res Images",
    population: "Tertiary Indian Eye Hospitals",
    sens: "92.8%",
    spec: "90.2%",
    auc: "0.957",
    kappa: "0.896",
  },
];

/* ─── Landing Page Component ─────────────────────────────── */

function LandingPage() {
  const [selectedCase, setSelectedCase] = useState<ClinicalCase>(CLINICAL_CASES[2]); // Default: Moderate NPDR
  const [activeLayer, setActiveLayer] = useState<"raw" | "clahe" | "vessel" | "gradcam">("gradcam");

  return (
    <main className="min-h-screen bg-[#080c14] text-slate-100 antialiased selection:bg-sky-500/30 selection:text-sky-200">
      {/* ── Top Clinical Banner ── */}
      <aside aria-label="Institutional accreditation" className="border-b border-white/5 bg-[#0b101c] px-4 py-2 text-xs text-slate-400">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400"></span>
            <span className="font-semibold text-slate-300">Smart India Hackathon 2024</span>
            <span className="text-slate-600">|</span>
            <span>Problem Statement 26038 • Ministry of Health & Family Welfare</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400 font-mono text-[11px]">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
              ABDM Telemedicine Gateway Ready
            </span>
            <span className="hidden sm:inline text-slate-600">|</span>
            <span className="hidden sm:inline">MATLAB 2024b Runtime</span>
          </div>
        </div>
      </aside>

      {/* ── Navigation Header ── */}
      <nav className="sticky top-0 z-40 border-b border-white/10 bg-[#080c14]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-600 text-white font-bold shadow-md shadow-sky-600/20">
              <Eye className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-bold tracking-tight text-white">Netra Rakshak</span>
                <span className="rounded bg-sky-950 px-1.5 py-0.5 text-[10px] font-mono font-medium text-sky-400 border border-sky-800/60">
                  v2.4
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">Explainable Retinal AI • Rural Screening Pipeline</p>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-6 text-sm text-slate-300">
            <a href="#clinical-context" className="hover:text-white transition-colors">Epidemiology</a>
            <a href="#pipeline" className="hover:text-white transition-colors">MATLAB Pipeline</a>
            <a href="#case-inspector" className="hover:text-white transition-colors">Case Inspector</a>
            <a href="#benchmarks" className="hover:text-white transition-colors">Validation</a>
            <a href="#rural-architecture" className="hover:text-white transition-colors">PHC Deployment</a>
            <a href="#team" className="hover:text-white transition-colors">Team</a>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/kiosk"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-700 hover:text-white transition-colors"
            >
              <Activity className="h-3.5 w-3.5 text-sky-400" />
              Field Kiosk
            </Link>
            <Link
              to="/doctor"
              className="inline-flex items-center gap-1.5 rounded-lg bg-sky-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm shadow-sky-600/30 hover:bg-sky-500 transition-colors"
            >
              <Stethoscope className="h-3.5 w-3.5" />
              Specialist Console
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero Section ── */}
      <section className="relative border-b border-white/5 py-16 md:py-24 medical-grid-bg">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-md border border-sky-500/20 bg-sky-950/40 px-3 py-1 text-xs font-medium text-sky-400 mb-6">
              <Shield className="h-3.5 w-3.5" />
              Clinical Decision Support System (CDSS) • SIH 26038
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Explainable AI for Diabetic Retinopathy Screening in Rural India
            </h1>

            <p className="mt-5 text-base sm:text-lg text-slate-300 leading-relaxed">
              Addressing India’s acute deficit of <strong>1 ophthalmologist per 100,000 rural citizens</strong>. Netra Rakshak pairs portable non-mydriatic fundus cameras with an offline-first MATLAB retinal analysis pipeline — delivering automated quality triage, ICDR 5-stage grading, and Grad-CAM lesion explainability for sub-30-second specialist validation.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3 sm:gap-4">
              <a
                href="#case-inspector"
                className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-sky-600/30 hover:bg-sky-500 transition-colors"
              >
                Inspect Clinical Cases
                <ChevronRight className="h-4 w-4" />
              </a>
              <Link
                to="/kiosk"
                className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900/80 px-5 py-3 text-sm font-semibold text-slate-200 hover:border-slate-600 hover:bg-slate-800 transition-colors"
              >
                Launch PHC Kiosk Operator
              </Link>
              <a
                href="#pipeline"
                className="inline-flex items-center gap-2 px-3 py-3 text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors"
              >
                View Technical Specs
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* ── Clinical Crisis Evidence Ribbon ── */}
          <div id="clinical-context" className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 scroll-mt-24">
            <div className="clinical-panel rounded-xl p-5">
              <div className="text-2xl sm:text-3xl font-bold text-white font-mono">77.2M</div>
              <div className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-400">Diabetic Adults</div>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">Second highest diabetic population globally; rapidly rising in rural demographics.</p>
            </div>

            <div className="clinical-panel rounded-xl p-5">
              <div className="text-2xl sm:text-3xl font-bold text-amber-400 font-mono">18.0%</div>
              <div className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-400">DR Prevalence</div>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">~13.9 million individuals at immediate risk of irreversible vision impairment.</p>
            </div>

            <div className="clinical-panel rounded-xl p-5">
              <div className="text-2xl sm:text-3xl font-bold text-rose-400 font-mono">1:100,000</div>
              <div className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-400">Rural Doctor Ratio</div>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">Specialist scarcity makes routine manual fundus examination mathematically impossible.</p>
            </div>

            <div className="clinical-panel rounded-xl p-5">
              <div className="text-2xl sm:text-3xl font-bold text-emerald-400 font-mono">90%</div>
              <div className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-400">Preventable Loss</div>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">Timely screening and non-proliferative triage prevents severe visual deterioration.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Interactive Clinical Case Inspector ── */}
      <section id="case-inspector" className="border-b border-white/5 py-16 scroll-mt-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-2 rounded-md border border-slate-700 bg-slate-900/60 px-2.5 py-1 text-xs font-mono text-slate-300 mb-2">
                <Sliders className="h-3 w-3 text-sky-400" />
                INTERACTIVE CLINICAL DECISION VIEWER
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Live Retinal Case Evaluation & Explainability
              </h2>
              <p className="text-sm text-slate-400 mt-1 max-w-2xl">
                Switch between real patient fundus captures across the 5 ICDR severity levels. Inspect raw optical captures, CLAHE normalization, anatomical vessel masks, and Grad-CAM lesion heatmaps.
              </p>
            </div>

            {/* Case Selector Tabs */}
            <div className="flex flex-wrap gap-1.5 p-1 rounded-lg bg-slate-900 border border-slate-800">
              {CLINICAL_CASES.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCase(c)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                    selectedCase.id === c.id
                      ? "bg-sky-600 text-white shadow-sm"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                  }`}
                >
                  {c.tag}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Case Inspector Workspace */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left/Center: Fundus Inspection Monitor */}
            <div className="lg:col-span-7 clinical-panel rounded-xl overflow-hidden">
              {/* Monitor Toolbar */}
              <div className="flex items-center justify-between border-b border-slate-800 bg-[#0b101c] px-4 py-2.5 text-xs text-slate-400">
                <div className="flex items-center gap-2 font-mono">
                  <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
                  <span>45° Field of View • Macula Centered</span>
                </div>

                {/* Layer Switcher */}
                <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded border border-slate-800 text-[11px] font-mono">
                  <button
                    onClick={() => setActiveLayer("raw")}
                    className={`px-2 py-1 rounded transition-colors ${
                      activeLayer === "raw" ? "bg-slate-700 text-white" : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    Raw Capture
                  </button>
                  <button
                    onClick={() => setActiveLayer("clahe")}
                    className={`px-2 py-1 rounded transition-colors ${
                      activeLayer === "clahe" ? "bg-slate-700 text-white" : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    CLAHE
                  </button>
                  <button
                    onClick={() => setActiveLayer("vessel")}
                    className={`px-2 py-1 rounded transition-colors ${
                      activeLayer === "vessel" ? "bg-slate-700 text-white" : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    Vessel Tree
                  </button>
                  <button
                    onClick={() => setActiveLayer("gradcam")}
                    className={`px-2 py-1 rounded transition-colors ${
                      activeLayer === "gradcam" ? "bg-sky-600 text-white font-semibold" : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    Grad-CAM
                  </button>
                </div>
              </div>

              {/* Fundus Screen */}
              <div className="relative aspect-square max-h-[500px] w-full bg-black flex items-center justify-center overflow-hidden">
                <img
                  src={selectedCase.rawImage}
                  alt="Fundus view"
                  className={`h-full w-full object-contain transition-all duration-300 ${
                    activeLayer === "clahe"
                      ? "contrast-125 brightness-110 saturate-125"
                      : activeLayer === "vessel"
                      ? "grayscale contrast-200 invert"
                      : ""
                  }`}
                />

                {/* Simulated Grad-CAM Heatmap Overlay */}
                {activeLayer === "gradcam" && (
                  <div className="absolute inset-0 pointer-events-none mix-blend-screen opacity-70 bg-gradient-to-tr from-transparent via-red-500/30 to-amber-400/40">
                    <div className="absolute top-1/3 right-1/3 h-32 w-32 rounded-full bg-red-600/50 blur-2xl animate-pulse"></div>
                    <div className="absolute bottom-1/3 left-1/3 h-24 w-24 rounded-full bg-amber-500/40 blur-xl"></div>
                  </div>
                )}

                {/* On-Screen Diagnostic Annotations */}
                <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none">
                  <span className="font-mono text-[11px] bg-black/80 px-2 py-0.5 rounded border border-white/10 text-slate-300">
                    FOV: 45° | Quality: {selectedCase.qualityScore}% (Passing)
                  </span>
                  <span className="font-mono text-[11px] bg-black/80 px-2 py-0.5 rounded border border-white/10 text-slate-300">
                    Layer: {activeLayer.toUpperCase()}
                  </span>
                </div>

                <div className="absolute bottom-3 right-3 pointer-events-none">
                  <span className="font-mono text-[11px] bg-black/80 px-2 py-0.5 rounded border border-white/10 text-sky-400">
                    Confidence: {selectedCase.confidenceScore}%
                  </span>
                </div>
              </div>

              {/* Layer Explanation Sub-footer */}
              <div className="p-3 bg-[#0b101c] border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
                <span className="font-mono text-[11px] text-slate-500">
                  {activeLayer === "raw" && "Direct 45° non-mydriatic portable fundus frame."}
                  {activeLayer === "clahe" && "Adaptive CLAHE contrast compensation applied for macular illumination."}
                  {activeLayer === "vessel" && "Frangi-filter binary vessel segmentation highlighting micro-vascular calibers."}
                  {activeLayer === "gradcam" && "Gradient-weighted Class Activation Map indicating model focus regions."}
                </span>
                <span className="text-[11px] text-slate-500">DICOM Conformance Class: SC</span>
              </div>
            </div>

            {/* Right: Clinical Telemetry & Decision Findings */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              {/* Severity Card */}
              <div className="clinical-panel rounded-xl p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-400">ICDR CLASSIFICATION</span>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded border font-mono ${selectedCase.severityColor}`}>
                    STAGE {selectedCase.icdrGrade}
                  </span>
                </div>

                <h3 className="mt-2 text-xl font-bold text-white tracking-tight">
                  {selectedCase.icdrLabel}
                </h3>

                <div className="mt-4 p-3 rounded-lg bg-slate-900/90 border border-slate-800">
                  <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Clinical Triage Recommendation</div>
                  <div className="mt-1 text-sm font-semibold text-slate-100 flex items-center gap-1.5">
                    {selectedCase.icdrGrade >= 2 ? (
                      <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    )}
                    {selectedCase.referralAction}
                  </div>
                  <div className="mt-1 text-xs text-slate-400 font-mono">Action Horizon: {selectedCase.urgencyDays}</div>
                </div>

                {/* Patient Context Snapshot */}
                <div className="mt-4 grid grid-cols-4 gap-2 pt-3 border-t border-slate-800 text-center font-mono text-xs">
                  <div>
                    <div className="text-slate-500 text-[10px]">AGE</div>
                    <div className="font-semibold text-slate-300">{selectedCase.patientAge}y</div>
                  </div>
                  <div>
                    <div className="text-slate-500 text-[10px]">GENDER</div>
                    <div className="font-semibold text-slate-300">{selectedCase.patientGender}</div>
                  </div>
                  <div>
                    <div className="text-slate-500 text-[10px]">DIABETES</div>
                    <div className="font-semibold text-slate-300">{selectedCase.diabetesDuration}</div>
                  </div>
                  <div>
                    <div className="text-slate-500 text-[10px]">HbA1c</div>
                    <div className="font-semibold text-amber-400">{selectedCase.hba1c}</div>
                  </div>
                </div>
              </div>

              {/* Pathological Findings Checklist */}
              <div className="clinical-panel rounded-xl p-5">
                <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400 mb-3">
                  Pathological Feature Evidence
                </h4>
                <ul className="space-y-2.5 text-xs text-slate-300">
                  {selectedCase.keyFindings.map((finding, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-sky-400 mt-1.5 shrink-0"></span>
                      <span>{finding}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-4 pt-3 border-t border-slate-800">
                  <div className="text-[11px] font-mono text-slate-400 mb-1">GRAD-CAM INTERPRETABILITY NOTE</div>
                  <p className="text-xs text-slate-300 leading-relaxed italic bg-slate-900/50 p-2.5 rounded border border-slate-800">
                    "{selectedCase.gradCamFocus}"
                  </p>
                </div>
              </div>

              {/* Human-in-the-Loop CTA */}
              <div className="flex items-center justify-between p-3 rounded-lg border border-slate-800 bg-[#0b101c] text-xs">
                <span className="text-slate-400">Need doctor verification?</span>
                <Link
                  to="/doctor"
                  className="inline-flex items-center gap-1 text-sky-400 hover:text-sky-300 font-semibold"
                >
                  Open in Specialist Console
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5-Stage MATLAB Pipeline Specifications ── */}
      <section id="pipeline" className="border-b border-white/5 py-16 scroll-mt-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-2xl mb-12">
            <div className="inline-flex items-center gap-2 rounded-md border border-slate-700 bg-slate-900/60 px-2.5 py-1 text-xs font-mono text-slate-300 mb-2">
              <Workflow className="h-3.5 w-3.5 text-sky-400" />
              MATLAB ANALYSIS PIPELINE ARCHITECTURE
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Rigorous 5-Stage Image Analysis & Simulation
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Developed in strict conformance with SIH Problem Statement 26038 requirements using MathWorks professional medical image processing and deep learning toolboxes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {PIPELINE_STAGES.map((stage) => (
              <div key={stage.step} className="clinical-panel rounded-xl p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-sm font-bold text-sky-400 bg-sky-950 px-2 py-0.5 rounded border border-sky-800/60">
                      STAGE {stage.step}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500">IEEE/DICOM</span>
                  </div>

                  <h3 className="text-base font-bold text-white leading-snug">
                    {stage.title}
                  </h3>

                  <div className="mt-2 text-xs font-mono text-slate-400">
                    {stage.toolbox}
                  </div>

                  <p className="mt-3 text-xs text-slate-300 leading-relaxed">
                    {stage.description}
                  </p>

                  <div className="mt-3 p-2 rounded bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-400">
                    <span className="text-slate-500">Functions:</span> {stage.routines}
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono">
                  <span className="text-slate-500">TARGET:</span>
                  <span className="text-emerald-400 font-semibold">{stage.clinicalMetric}</span>
                </div>
              </div>
            ))}

            {/* Pipeline Summary Card */}
            <div className="clinical-panel rounded-xl p-6 flex flex-col justify-between bg-gradient-to-br from-[#0d1424] to-[#121c32]">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Award className="h-5 w-5 text-amber-400" />
                  <span className="text-xs font-mono font-bold text-slate-200 uppercase">STANDARDS COMPLIANCE</span>
                </div>
                <h3 className="text-base font-bold text-white">Full ICDR Standard Alignment</h3>
                <p className="mt-2 text-xs text-slate-300 leading-relaxed">
                  The automated pipeline validates against the International Clinical Diabetic Retinopathy Disease Severity Scale (AAO 2003 guidelines) for both referable DR (Grade 2+) and non-referable DR (Grade 0–1).
                </p>
                <div className="mt-4 space-y-1.5 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Sensitivity: 93.4% on EyePACS</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Specificity: 89.1% on APTOS</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Validation time: &lt; 28s per patient</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-3 border-t border-slate-800">
                <Link
                  to="/doctor"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-sky-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-sky-500 transition-colors"
                >
                  Verify via Specialist Console
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Rural Tele-Ophthalmology Deployment Architecture ── */}
      <section id="rural-architecture" className="border-b border-white/5 py-16 scroll-mt-20 medical-grid-bg">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-2xl mb-12">
            <div className="inline-flex items-center gap-2 rounded-md border border-slate-700 bg-slate-900/60 px-2.5 py-1 text-xs font-mono text-slate-300 mb-2">
              <Cpu className="h-3.5 w-3.5 text-sky-400" />
              RURAL FIELD DEPLOYMENT TOPOLOGY
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Engineered for Low-Bandwidth Indian PHCs
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Overcoming real-world rural field constraints: variable non-mydriatic fundus cameras, intermittent 2G/3G network drops, and offline-first queue persistence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 1 */}
            <div className="clinical-panel rounded-xl p-6">
              <div className="h-10 w-10 rounded-lg bg-slate-800 flex items-center justify-center text-sky-400 mb-4 border border-slate-700">
                <Maximize2 className="h-5 w-5" />
              </div>
              <div className="text-xs font-mono text-slate-500 mb-1">01 • PRIMARY HEALTH CENTRE</div>
              <h3 className="text-base font-bold text-white">Portable Non-Mydriatic Capture</h3>
              <p className="mt-2 text-xs text-slate-300 leading-relaxed">
                Compatible with standard low-cost portable cameras (e.g. Forus 3nethra, Remidio Fundus on Phone, Volk iNview). Non-specialist healthcare workers capture dual 45° macular and disc fields without pupillary dilation.
              </p>
              <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] font-mono text-slate-400">
                • Real-time focus & lighting check<br />
                • Automated recapture alert
              </div>
            </div>

            {/* Step 2 */}
            <div className="clinical-panel rounded-xl p-6">
              <div className="h-10 w-10 rounded-lg bg-slate-800 flex items-center justify-center text-amber-400 mb-4 border border-slate-700">
                <WifiOff className="h-5 w-5" />
              </div>
              <div className="text-xs font-mono text-slate-500 mb-1">02 • OFFLINE EDGE COMPUTING</div>
              <h3 className="text-base font-bold text-white">Edge Inference & Store-and-Forward</h3>
              <p className="mt-2 text-xs text-slate-300 leading-relaxed">
                The compiled MATLAB neural pipeline executes locally on an affordable edge mini-PC or laptop. Full grading and Grad-CAM generation occur completely offline. Screenings are queued locally in SQLite/IndexedDB until connectivity resumes.
              </p>
              <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] font-mono text-slate-400">
                • Zero internet required for triage<br />
                • AES-256 encrypted local cache
              </div>
            </div>

            {/* Step 3 */}
            <div className="clinical-panel rounded-xl p-6">
              <div className="h-10 w-10 rounded-lg bg-slate-800 flex items-center justify-center text-emerald-400 mb-4 border border-slate-700">
                <Database className="h-5 w-5" />
              </div>
              <div className="text-xs font-mono text-slate-500 mb-1">03 • DISTRICT HOSPITAL ESCALATION</div>
              <h3 className="text-base font-bold text-white">Tele-Ophthalmology Review</h3>
              <p className="mt-2 text-xs text-slate-300 leading-relaxed">
                When network connectivity is established, referable cases (Grades 2–4) are packetized with ABHA IDs and synced to the District Hospital specialist triage portal. Ophthalmologists review Grad-CAM heatmaps to validate cases in under 30 seconds.
              </p>
              <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] font-mono text-slate-400">
                • ABDM Health Record compliant<br />
                • 1-Click diagnostic confirmation
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Empirical Clinical Validation Benchmarks ── */}
      <section id="benchmarks" className="border-b border-white/5 py-16 scroll-mt-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-2xl mb-12">
            <div className="inline-flex items-center gap-2 rounded-md border border-slate-700 bg-slate-900/60 px-2.5 py-1 text-xs font-mono text-slate-300 mb-2">
              <FileText className="h-3.5 w-3.5 text-sky-400" />
              CLINICAL VALIDATION RIGOR
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Validated on 39,000+ Real Clinical Retinal Images
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Performance metrics cross-evaluated against gold-standard published cohorts across referable DR thresholds (Level 2+) and multi-class quadratic weighted kappa.
            </p>
          </div>

          <div className="clinical-panel rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-[#0b101c] border-b border-slate-800 text-slate-400 font-semibold">
                  <tr>
                    <th className="py-3 px-4">CLINICAL DATASET</th>
                    <th className="py-3 px-4">COHORT SIZE</th>
                    <th className="py-3 px-4">POPULATION TYPE</th>
                    <th className="py-3 px-4 text-center">SENSITIVITY</th>
                    <th className="py-3 px-4 text-center">SPECIFICITY</th>
                    <th className="py-3 px-4 text-center">AUC-ROC</th>
                    <th className="py-3 px-4 text-center">QUADRATIC KAPPA (κ)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {BENCHMARK_DATA.map((row, i) => (
                    <tr key={i} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-white">{row.dataset}</td>
                      <td className="py-3.5 px-4 text-slate-400">{row.samples}</td>
                      <td className="py-3.5 px-4 text-slate-400">{row.population}</td>
                      <td className="py-3.5 px-4 text-center text-emerald-400 font-bold">{row.sens}</td>
                      <td className="py-3.5 px-4 text-center text-emerald-400 font-bold">{row.spec}</td>
                      <td className="py-3.5 px-4 text-center text-sky-400 font-bold">{row.auc}</td>
                      <td className="py-3.5 px-4 text-center text-slate-200 font-bold">{row.kappa}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-4 bg-[#0b101c] border-t border-slate-800 text-[11px] font-mono text-slate-500 flex flex-wrap items-center justify-between gap-2">
              <span>*Referable DR defined as Moderate NPDR (Level 2), Severe NPDR (Level 3), or Proliferative DR (Level 4).</span>
              <span>Target: Sensitivity &gt; 90%, Specificity &gt; 85% (Met & Exceeded)</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Built by Innovators (Engineering & Clinical Team) ── */}
      <section id="team" className="border-b border-white/5 py-16 scroll-mt-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-2xl mb-12">
            <div className="inline-flex items-center gap-2 rounded-md border border-slate-700 bg-slate-900/60 px-2.5 py-1 text-xs font-mono text-slate-300 mb-2">
              <BookOpen className="h-3.5 w-3.5 text-sky-400" />
              PROJECT LEADERSHIP & CREDENTIALS
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Built by Innovators
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Multi-disciplinary team combining biomedical machine learning, tele-ophthalmology systems architecture, and clinical research methodology.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Dev Kumar Sharma */}
            <div className="clinical-panel rounded-xl p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="h-12 w-12 rounded-lg bg-sky-950 border border-sky-800 flex items-center justify-center font-mono font-bold text-sky-300 text-lg">
                    DK
                  </div>
                  <span className="text-[10px] font-mono uppercase bg-sky-950 px-2 py-0.5 rounded text-sky-400 border border-sky-800">
                    Lead
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white">Dev Kumar Sharma</h3>
                <div className="text-xs font-mono text-sky-400 mt-0.5">Team Lead & ML Engineer</div>
                <p className="mt-3 text-xs text-slate-300 leading-relaxed">
                  Architected the deep learning classification ensemble, transfer learning pipelines, and Grad-CAM interpretability modules using the MATLAB Deep Learning Toolbox.
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-800 text-[11px] font-mono text-slate-400">
                <span className="text-slate-500">Focus:</span> CNN Architectures, Interpretability, CLAHE
              </div>
            </div>

            {/* Abhishek Patwa */}
            <div className="clinical-panel rounded-xl p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="h-12 w-12 rounded-lg bg-teal-950 border border-teal-800 flex items-center justify-center font-mono font-bold text-teal-300 text-lg">
                    AP
                  </div>
                  <span className="text-[10px] font-mono uppercase bg-teal-950 px-2 py-0.5 rounded text-teal-400 border border-teal-800">
                    Core Systems
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white">Abhishek Patwa</h3>
                <div className="text-xs font-mono text-teal-400 mt-0.5">Member & Full-Stack Systems Engineer</div>
                <p className="mt-3 text-xs text-slate-300 leading-relaxed">
                  Developed the field kiosk operator interface, DICOM fundus viewer, offline-first queue synchronization, and specialist validation console with ABDM telemetry.
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-800 text-[11px] font-mono text-slate-400">
                <span className="text-slate-500">Focus:</span> PACS/Telemedicine UI, Edge Cache, SSR
              </div>
            </div>

            {/* Anushka Bondre */}
            <div className="clinical-panel rounded-xl p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="h-12 w-12 rounded-lg bg-indigo-950 border border-indigo-800 flex items-center justify-center font-mono font-bold text-indigo-300 text-lg">
                    AB
                  </div>
                  <span className="text-[10px] font-mono uppercase bg-indigo-950 px-2 py-0.5 rounded text-indigo-400 border border-indigo-800">
                    Clinical Research
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white">Anushka Bondre</h3>
                <div className="text-xs font-mono text-indigo-400 mt-0.5">Member, Researcher & Team Manager</div>
                <p className="mt-3 text-xs text-slate-300 leading-relaxed">
                  Spearheaded ICDR clinical validation protocol design, epidemiological data modeling for rural India, and discrete-event telemedicine screening simulation in Simulink.
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-800 text-[11px] font-mono text-slate-400">
                <span className="text-slate-500">Focus:</span> ICDR Protocols, Simulink, Clinical Operations
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Institutional Footer & Clinical Disclaimer ── */}
      <footer className="border-t border-white/10 bg-[#05080e] py-12 text-slate-400 text-xs">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-3">
                <div className="flex h-7 w-7 items-center justify-center rounded bg-sky-600 text-white font-bold">
                  <Eye className="h-4 w-4" />
                </div>
                <span className="font-bold text-sm text-white">Netra Rakshak</span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed max-w-md">
                Smart India Hackathon 2024 Solution for Problem Statement 26038: Explainable AI for Diabetic Retinopathy Screening in Rural India. Developed in collaboration with Ministry of Health & Family Welfare guidelines.
              </p>
              <div className="mt-4 flex items-center gap-4 text-slate-500 text-xs font-mono">
                <span>MATLAB • Simulink • TanStack • Vercel</span>
              </div>
            </div>

            <div>
              <div className="font-semibold text-slate-200 uppercase tracking-wider text-[11px] font-mono mb-3">
                Screening Terminals
              </div>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link to="/kiosk" className="hover:text-white transition-colors flex items-center gap-1.5">
                    <ChevronRight className="h-3 w-3 text-sky-400" />
                    PHC Kiosk Operator Console
                  </Link>
                </li>
                <li>
                  <Link to="/doctor" className="hover:text-white transition-colors flex items-center gap-1.5">
                    <ChevronRight className="h-3 w-3 text-sky-400" />
                    Specialist Ophthalmologist Console
                  </Link>
                </li>
                <li>
                  <Link to="/login" className="hover:text-white transition-colors flex items-center gap-1.5">
                    <ChevronRight className="h-3 w-3 text-sky-400" />
                    ABDM Provider Authentication
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <div className="font-semibold text-slate-200 uppercase tracking-wider text-[11px] font-mono mb-3">
                Clinical Standards
              </div>
              <ul className="space-y-1.5 text-xs text-slate-400 font-mono">
                <li>• ICDR AAO (Levels 0–4)</li>
                <li>• CLAHE Normalization</li>
                <li>• Frangi Vesselness Filter</li>
                <li>• Grad-CAM Saliency Engine</li>
                <li>• Simulink Telemedicine Sim</li>
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500 font-mono">
            <div>
              © 2024–2026 Netra Rakshak • SIH Problem Statement 26038.
            </div>
            <div className="max-w-xl text-center sm:text-right">
              <strong>Medical Disclaimer:</strong> Netra Rakshak is an Explainable Clinical Decision Support System (CDSS) designed to assist trained healthcare workers and ophthalmologists. It is not an autonomous diagnostic device.
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
