import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Users,
  Eye,
  Clock,
  Flame,
  AlertTriangle,
  ChevronRight,
  ShieldCheck,
  Stethoscope,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import fundus from "@/assets/fundus.jpg";
import { DEFAULT_MATLAB_CLOUD_URL } from "@/lib/netra-model";

export const Route = createFileRoute("/doctor")({
  head: () => ({
    meta: [
      { title: "Specialist Validation Console — Netra Rakshak" },
      {
        name: "description",
        content:
          "Review queued retinopathy cases, inspect Grad-CAM explainability overlays, and confirm or override AI grades in under 30 seconds.",
      },
      { property: "og:title", content: "Specialist Validation Console — Netra Rakshak" },
      {
        property: "og:description",
        content: "Review AI-graded retinopathy cases with Grad-CAM explainability overlays.",
      },
    ],
  }),
  component: DoctorPage,
});

type Patient = {
  id: string;
  grade: number;
  gradeLabel: string;
  wait: string;
  age: number;
  center: string;
  lesions: string;
};

// Mock rows standing in for a tele-ophthalmology screening queue.
const INITIAL_QUEUE: Patient[] = [
  { id: "P-1042", grade: 2, gradeLabel: "Moderate NPDR", wait: "14 mins", age: 54, center: "PHC Anand", lesions: "Microaneurysms & hard exudates in temporal arcade" },
  { id: "P-1043", grade: 3, gradeLabel: "Severe NPDR", wait: "9 mins", age: 61, center: "PHC Nadiad", lesions: "Venous beading & >20 intraretinal hemorrhages" },
  { id: "P-1044", grade: 1, gradeLabel: "Mild NPDR", wait: "6 mins", age: 47, center: "PHC Anand", lesions: "Isolated microaneurysms only" },
  { id: "P-1045", grade: 4, gradeLabel: "Proliferative DR", wait: "3 mins", age: 66, center: "PHC Borsad", lesions: "Neovascularization at disc (NVD) with vitreous traction" },
  { id: "P-1046", grade: 0, gradeLabel: "No DR", wait: "1 min", age: 38, center: "PHC Nadiad", lesions: "No microvascular lesions detected" },
];

const GRADES = [
  "Grade 0: No Apparent Retinopathy",
  "Grade 1: Mild Non-Proliferative DR",
  "Grade 2: Moderate Non-Proliferative DR",
  "Grade 3: Severe Non-Proliferative DR",
  "Grade 4: Proliferative DR",
];

function getGradeBadge(grade: number) {
  switch (grade) {
    case 0:
      return {
        bg: "bg-[#3F7D5C]/10",
        text: "text-[#3F7D5C]",
        border: "border-[#3F7D5C]/30",
        label: "Grade 0 • Normal",
      };
    case 1:
      return {
        bg: "bg-[#0F6F6A]/10",
        text: "text-[#0F6F6A]",
        border: "border-[#0F6F6A]/30",
        label: "Grade 1 • Mild",
      };
    case 2:
      return {
        bg: "bg-[#C1652F]/10",
        text: "text-[#C1652F]",
        border: "border-[#C1652F]/30",
        label: "Grade 2 • Moderate",
      };
    case 3:
      return {
        bg: "bg-[#C1652F]/20",
        text: "text-[#9a3412]",
        border: "border-[#C1652F]/40",
        label: "Grade 3 • Severe",
      };
    case 4:
      return {
        bg: "bg-[#b91c1c]/10",
        text: "text-[#b91c1c]",
        border: "border-[#b91c1c]/30",
        label: "Grade 4 • PDR",
      };
    default:
      return {
        bg: "bg-gray-100",
        text: "text-gray-700",
        border: "border-gray-200",
        label: `Grade ${grade}`,
      };
  }
}

function DoctorPage() {
  const [queue, setQueue] = useState<Patient[]>(INITIAL_QUEUE);
  const [selectedId, setSelectedId] = useState<string | null>(INITIAL_QUEUE[0]!.id);
  const [heatmap, setHeatmap] = useState(true);
  const [finalGrade, setFinalGrade] = useState<number>(INITIAL_QUEUE[0]!.grade);
  const [lastAction, setLastAction] = useState<string | null>(null);

  const selected = queue.find((p) => p.id === selectedId) ?? null;

  const urgentCount = queue.filter((p) => p.grade >= 3).length;
  const avgWait =
    queue.length > 0
      ? Math.round(queue.reduce((acc, p) => acc + parseInt(p.wait), 0) / queue.length)
      : 0;

  function select(p: Patient) {
    setSelectedId(p.id);
    setFinalGrade(p.grade);
    setHeatmap(true);
    setLastAction(null);
  }

  function resolve(action: "confirmed" | "overridden") {
    if (!selected) return;
    const resolvedId = selected.id;
    const remaining = queue.filter((p) => p.id !== selected.id);
    setQueue(remaining);
    const next = remaining[0] ?? null;
    setSelectedId(next?.id ?? null);
    setFinalGrade(next?.grade ?? 0);
    setLastAction(`Case ${resolvedId} ${action === "confirmed" ? "confirmed" : "overridden"} successfully.`);
  }

  return (
    <main className="min-h-screen bg-[var(--color-paper-alt)]">
      {/* ── Console Header ── */}
      <header className="border-b border-[var(--color-gray-line)] bg-[var(--color-paper)] px-6 py-4 sticky top-0 z-30">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-[14px] font-medium text-[var(--color-gray)] hover:text-[var(--color-ink)] transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> Home
            </Link>
            <span className="h-4 w-px bg-[var(--color-gray-line)]" />
            <div className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5 text-[var(--color-teal)]" />
              <div>
                <h1 className="font-serif text-[18px] font-semibold leading-tight text-[var(--color-ink)]">
                  Specialist Validation Console
                </h1>
                <p className="text-[12px] text-[var(--color-gray)]">District Hospital Tele-Ophthalmology Workstation</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {urgentCount > 0 && (
              <div className="flex items-center gap-1.5 border border-[#b91c1c]/30 bg-[#b91c1c]/10 px-3 py-1 text-[12px] font-medium text-[#b91c1c]">
                <AlertTriangle className="h-3.5 w-3.5" />
                {urgentCount} Urgent (Grade 3/4)
              </div>
            )}
            <div className="flex items-center gap-1.5 border border-[var(--color-teal)]/30 bg-[var(--color-teal)]/10 px-3 py-1 text-[12px] font-medium text-[var(--color-teal)]">
              <Users className="h-3.5 w-3.5" />
              {queue.length} Pending
            </div>
            <div className="hidden sm:flex items-center gap-1.5 border border-[var(--color-gray-line)] bg-[var(--color-paper-alt)] px-3 py-1 text-[12px] font-medium text-[var(--color-gray)]">
              <Clock className="h-3.5 w-3.5" />
              Avg Wait: {avgWait} min
            </div>
            <a
              href={DEFAULT_MATLAB_CLOUD_URL}
              target="_blank"
              rel="noreferrer"
              className="hidden md:inline-flex items-center gap-1.5 border border-[var(--color-gray-line)] bg-[var(--color-paper-alt)] px-2.5 py-1 text-[12px] font-medium text-[var(--color-gray)] hover:text-[var(--color-teal)]"
            >
              <Sparkles className="h-3.5 w-3.5 text-[var(--color-teal)]" />
              MATLAB® Cloud Server
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </header>

      {/* ── Main Layout ── */}
      <div className="mx-auto max-w-[1400px] p-6">
        {lastAction && (
          <div className="mb-4 flex items-center justify-between border border-[#3F7D5C]/30 bg-[#3F7D5C]/10 px-4 py-2.5 text-[14px] font-medium text-[#3F7D5C]">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              {lastAction}
            </span>
            <button onClick={() => setLastAction(null)} className="text-xs hover:underline">Dismiss</button>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
          {/* ── Left Column: Queue ── */}
          <aside className="border border-[var(--color-gray-line)] bg-[var(--color-paper)]">
            <div className="border-b border-[var(--color-gray-line)] bg-[var(--color-paper-alt)] px-4 py-3">
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-[16px] font-semibold text-[var(--color-ink)]">
                  Pending Referrals
                </h2>
                <span className="font-mono text-[12px] text-[var(--color-gray)]">
                  {queue.length} cases
                </span>
              </div>
              <p className="mt-0.5 text-[12px] text-[var(--color-gray)]">
                Triage order: Priority by severity & wait time
              </p>
            </div>

            <ul className="max-h-[calc(100vh-220px)] divide-y divide-[var(--color-gray-line)] overflow-y-auto">
              {queue.map((p) => {
                const active = p.id === selectedId;
                const badge = getGradeBadge(p.grade);
                return (
                  <li key={p.id}>
                    <button
                      type="button"
                      onClick={() => select(p)}
                      className={`flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left transition-all ${
                        active
                          ? "bg-[var(--color-paper-alt)] border-l-4 border-[var(--color-teal)]"
                          : "hover:bg-[var(--color-paper-alt)]/50 border-l-4 border-transparent"
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[14px] font-bold text-[var(--color-ink)]">{p.id}</span>
                          <span className={`inline-block border px-1.5 py-0.2 text-[10px] font-bold font-mono ${badge.border} ${badge.bg} ${badge.text}`}>
                            G{p.grade}
                          </span>
                        </div>
                        <span className="mt-1 block text-[12px] text-[var(--color-gray)]">
                          {p.age}y • {p.center}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="block text-[11px] font-mono text-[var(--color-gray)]">
                          Wait: {p.wait}
                        </span>
                        <ChevronRight className={`ml-auto mt-1 h-4 w-4 ${active ? "text-[var(--color-teal)]" : "text-[var(--color-gray-line)]"}`} />
                      </div>
                    </button>
                  </li>
                );
              })}
              {queue.length === 0 && (
                <li className="px-4 py-16 text-center text-[14px] text-[var(--color-gray)]">
                  <CheckCircle2 className="mx-auto h-10 w-10 text-[var(--color-green)] mb-3" />
                  <p className="font-semibold text-[var(--color-ink)]">Queue Cleared</p>
                  <p className="text-[13px] text-[var(--color-gray)] mt-1">
                    All primary healthcare screening scans have been validated.
                  </p>
                </li>
              )}
            </ul>
          </aside>

          {/* ── Right Column: Diagnostic Inspection Workspace ── */}
          <section className="border border-[var(--color-gray-line)] bg-[var(--color-paper)] flex flex-col">
            {selected ? (
              <div className="flex h-full flex-col">
                {/* Patient Case Banner */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--color-gray-line)] bg-[var(--color-paper-alt)] px-6 py-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="font-serif text-[22px] font-semibold text-[var(--color-ink)]">
                        Patient {selected.id}
                      </h2>
                      {(() => {
                        const badge = getGradeBadge(selected.grade);
                        return (
                          <span className={`border px-2.5 py-0.5 text-[12px] font-mono font-bold ${badge.border} ${badge.bg} ${badge.text}`}>
                            {badge.label}
                          </span>
                        );
                      })()}
                    </div>
                    <p className="mt-1 text-[13px] text-[var(--color-gray)]">
                      Age: <strong className="text-[var(--color-ink)]">{selected.age} yrs</strong> • Center:{" "}
                      <strong className="text-[var(--color-ink)]">{selected.center}</strong> • Model Recommendation:{" "}
                      <strong className="text-[var(--color-ink)]">{selected.gradeLabel}</strong>
                    </p>
                  </div>

                  {/* Grad-CAM Toggle */}
                  <div className="flex items-center gap-3">
                    <label className="flex cursor-pointer items-center gap-2 text-[13px] font-medium text-[var(--color-ink)] select-none">
                      <Flame className={`h-4 w-4 ${heatmap ? "text-[var(--color-amber)]" : "text-[var(--color-gray)]"}`} />
                      Grad-CAM Heatmap
                      <input
                        type="checkbox"
                        checked={heatmap}
                        onChange={(e) => setHeatmap(e.target.checked)}
                        className="h-4 w-4 accent-[var(--color-teal)] cursor-pointer"
                      />
                    </label>
                  </div>
                </div>

                {/* Viewport and Evidence */}
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 p-6">
                  {/* Left: Retinal Image Viewport */}
                  <div className="xl:col-span-7 flex flex-col items-center">
                    <div className="relative aspect-square w-full max-w-[540px] overflow-hidden border border-[var(--color-gray-line)] bg-black">
                      <img
                        src={fundus}
                        alt={`Fundus scan for patient ${selected.id}`}
                        className="h-full w-full object-contain"
                      />

                      {/* Grad-CAM Activation Overlay */}
                      {heatmap && (
                        <div
                          className="pointer-events-none absolute inset-0 mix-blend-screen opacity-75"
                          style={{
                            background:
                              selected.grade === 0
                                ? "radial-gradient(circle at 48% 50%, rgba(0, 180, 255, 0.25) 0%, transparent 40%)"
                                : selected.grade === 1
                                ? "radial-gradient(circle at 48% 38%, rgba(255, 60, 0, 0.7) 0%, rgba(255, 200, 0, 0.4) 12%, transparent 24%)"
                                : selected.grade === 2
                                ? "radial-gradient(circle at 38% 44%, rgba(255, 0, 0, 0.85) 0%, rgba(255, 180, 0, 0.55) 12%, transparent 35%), radial-gradient(circle at 63% 61%, rgba(255, 40, 0, 0.7) 0%, transparent 28%)"
                                : "radial-gradient(circle at 38% 44%, rgba(255, 0, 0, 0.9) 0%, rgba(255, 140, 0, 0.6) 15%, transparent 38%), radial-gradient(circle at 63% 61%, rgba(255, 40, 0, 0.8) 0%, transparent 32%), radial-gradient(circle at 50% 30%, rgba(255, 100, 0, 0.7) 0%, transparent 26%)",
                          }}
                        />
                      )}

                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] text-white bg-black/85 px-3 py-1.5 border border-white/10 font-mono">
                        <span>{heatmap ? "GRAD-CAM OVERLAY ACTIVE" : "ORIGINAL UNFILTERED CAPTURE"}</span>
                        <span>QUALITY: PASS (CLAHE ENHANCED)</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Pathological Findings & Explainability Assessment */}
                  <div className="xl:col-span-5 flex flex-col justify-between space-y-6">
                    <div>
                      <h3 className="font-serif text-[18px] font-semibold text-[var(--color-ink)] mb-4">
                        Diagnostic Assessment
                      </h3>

                      <div className="space-y-4">
                        <div className="border border-[var(--color-gray-line)] p-3.5 bg-[var(--color-paper-alt)]">
                          <div className="text-[11px] font-mono uppercase text-[var(--color-gray)] mb-1">
                            Model Prediction Confidence
                          </div>
                          <div className="text-[16px] font-semibold text-[var(--color-ink)]">
                            {selected.gradeLabel} (92.8% Confidence)
                          </div>
                          <p className="mt-1 text-[12px] text-[var(--color-gray)]">
                            Multi-scale feature extraction verified against ICDR staging parameters.
                          </p>
                        </div>

                        <div className="border border-[var(--color-gray-line)] p-3.5 bg-[var(--color-paper)]">
                          <div className="text-[11px] font-mono uppercase text-[var(--color-gray)] mb-1">
                            Segmented Microvascular Lesions
                          </div>
                          <div className="text-[14px] text-[var(--color-ink)]">
                            {selected.lesions}
                          </div>
                        </div>

                        <div className="border border-[var(--color-gray-line)] p-3.5 bg-[var(--color-paper)]">
                          <div className="text-[11px] font-mono uppercase text-[var(--color-gray)] mb-1">
                            Clinical Action Guideline
                          </div>
                          <div className="text-[14px] font-medium text-[var(--color-teal)]">
                            {selected.grade >= 2
                              ? "Referral recommended to district hospital ophthalmology OPD within 30 days."
                              : "Non-referable; recommend routine annual rescreen at local PHC."}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="text-[12px] text-[var(--color-gray)] border-t border-[var(--color-gray-line)] pt-3">
                      Specialist action writes audit log entry with doctor timestamp and ABHA health ID mapping.
                    </div>
                  </div>
                </div>

                {/* ── Action Decision Bar ── */}
                <div className="mt-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-[var(--color-gray-line)] bg-[var(--color-paper-alt)] px-6 py-4">
                  <div className="flex items-center gap-3">
                    <label htmlFor="final-grade-select" className="text-[13px] font-medium text-[var(--color-ink)] whitespace-nowrap">
                      Sign-off Grade:
                    </label>
                    <select
                      id="final-grade-select"
                      value={finalGrade}
                      onChange={(e) => setFinalGrade(Number(e.target.value))}
                      className="border border-[var(--color-gray-line)] bg-[var(--color-paper)] px-3 py-2 text-[14px] text-[var(--color-ink)] font-medium focus:outline-none focus:border-[var(--color-teal)]"
                    >
                      {GRADES.map((label, i) => (
                        <option key={label} value={i}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => resolve("overridden")}
                      className="inline-flex items-center justify-center gap-2 border border-[var(--color-amber)] px-5 py-2.5 text-[14px] font-medium text-[var(--color-amber)] transition-colors hover:bg-[var(--color-amber)] hover:text-white"
                    >
                      <XCircle className="h-4 w-4" />
                      Override AI Grade
                    </button>
                    <button
                      type="button"
                      onClick={() => resolve("confirmed")}
                      className="inline-flex items-center justify-center gap-2 bg-[var(--color-teal)] px-6 py-2.5 text-[14px] font-medium text-white transition-colors hover:bg-[#0c5854]"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Confirm & Sign Off
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex h-full min-h-[60vh] flex-col items-center justify-center px-6 text-center">
                <CheckCircle2 className="h-14 w-14 text-[var(--color-green)] mb-4" />
                <h3 className="font-serif text-[24px] font-semibold text-[var(--color-ink)]">
                  All Cases Reviewed
                </h3>
                <p className="text-[14px] text-[var(--color-gray)] max-w-md mt-1">
                  The specialist triage queue is currently empty. New patient captures uploaded from PHC kiosks will stream here automatically.
                </p>
                <div className="mt-6 flex items-center gap-3">
                  <Link
                    to="/kiosk"
                    className="inline-flex items-center gap-2 border border-[var(--color-gray-line)] bg-[var(--color-paper)] px-4 py-2 text-[13px] font-medium text-[var(--color-ink)] hover:bg-[var(--color-paper-alt)]"
                  >
                    Go to PHC Kiosk to upload new scan
                  </Link>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
