import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Users,
  Eye,
  Activity,
  Clock,
  Flame,
  AlertTriangle,
} from "lucide-react";
import fundus from "@/assets/fundus.jpg";

export const Route = createFileRoute("/doctor")({
  head: () => ({
    meta: [
      { title: "Specialist Validation Console — Netra Rakshak" },
      {
        name: "description",
        content:
          "Review queued retinopathy cases, inspect Grad-CAM explainability overlays, and confirm or override AI grades.",
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
};

// Mock rows standing in for a Supabase `screenings` table.
const INITIAL_QUEUE: Patient[] = [
  { id: "P-1042", grade: 2, gradeLabel: "Moderate NPDR", wait: "14 mins", age: 54, center: "PHC Anand" },
  { id: "P-1043", grade: 3, gradeLabel: "Severe NPDR", wait: "9 mins", age: 61, center: "PHC Nadiad" },
  { id: "P-1044", grade: 1, gradeLabel: "Mild NPDR", wait: "6 mins", age: 47, center: "PHC Anand" },
  { id: "P-1045", grade: 4, gradeLabel: "Proliferative DR", wait: "3 mins", age: 66, center: "PHC Borsad" },
  { id: "P-1046", grade: 0, gradeLabel: "No DR", wait: "1 min", age: 38, center: "PHC Nadiad" },
];

const GRADES = [
  "Grade 0: No DR",
  "Grade 1: Mild NPDR",
  "Grade 2: Moderate NPDR",
  "Grade 3: Severe NPDR",
  "Grade 4: Proliferative DR",
];

function gradeColor(grade: number) {
  switch (grade) {
    case 0: return "bg-emerald-500";
    case 1: return "bg-cyan-500";
    case 2: return "bg-amber-500";
    case 3: return "bg-orange-500";
    case 4: return "bg-red-500";
    default: return "bg-slate-500";
  }
}

function gradeBorderColor(grade: number) {
  switch (grade) {
    case 0: return "border-emerald-500/30";
    case 1: return "border-cyan-500/30";
    case 2: return "border-amber-500/30";
    case 3: return "border-orange-500/30";
    case 4: return "border-red-500/30";
    default: return "border-slate-500/30";
  }
}

function DoctorPage() {
  const [queue, setQueue] = useState<Patient[]>(INITIAL_QUEUE);
  const [selectedId, setSelectedId] = useState<string | null>(INITIAL_QUEUE[0]!.id);
  const [heatmap, setHeatmap] = useState(false);
  const [finalGrade, setFinalGrade] = useState<number>(INITIAL_QUEUE[0]!.grade);

  const selected = queue.find((p) => p.id === selectedId) ?? null;

  const urgentCount = queue.filter(p => p.grade >= 3).length;
  const avgWait = queue.length > 0
    ? Math.round(queue.reduce((acc, p) => acc + parseInt(p.wait), 0) / queue.length)
    : 0;

  function select(p: Patient) {
    setSelectedId(p.id);
    setFinalGrade(p.grade);
    setHeatmap(false);
  }

  function resolve() {
    if (!selected) return;
    const remaining = queue.filter((p) => p.id !== selected.id);
    setQueue(remaining);
    const next = remaining[0] ?? null;
    setSelectedId(next?.id ?? null);
    setFinalGrade(next?.grade ?? 0);
    setHeatmap(false);
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="glass border-b border-white/5 px-5 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm text-slate-500 transition-colors hover:text-teal-400"
            >
              <ArrowLeft className="h-4 w-4" /> Sign out
            </Link>
            <span className="hidden h-4 w-px bg-white/10 sm:block" />
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-cyan-500">
                <Eye className="h-4 w-4 text-white" />
              </span>
              <h1 className="text-base font-bold text-white">Specialist Validation Console</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {urgentCount > 0 && (
              <div className="flex items-center gap-1.5 rounded-full bg-red-500/10 border border-red-500/20 px-3 py-1 text-xs font-medium text-red-400">
                <AlertTriangle className="h-3.5 w-3.5" /> {urgentCount} urgent
              </div>
            )}
            <div className="flex items-center gap-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 px-3 py-1 text-xs font-medium text-teal-400">
              <Users className="h-3.5 w-3.5" /> {queue.length} pending
            </div>
            <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-white/5 border border-white/10 px-3 py-1 text-xs font-medium text-slate-400">
              <Clock className="h-3.5 w-3.5" /> Avg wait: {avgWait} min
            </div>
          </div>
        </div>
      </header>

      <div className="grid gap-5 p-5 lg:grid-cols-[340px_1fr]">
        {/* Queue */}
        <aside className="glass-card rounded-2xl">
          <div className="border-b border-white/5 px-4 py-3">
            <h2 className="text-sm font-bold text-white">Pending Queue</h2>
            <p className="text-xs text-slate-500">Sorted by urgency · Awaiting specialist verification</p>
          </div>
          <ul className="max-h-[70vh] divide-y divide-white/5 overflow-y-auto">
            {queue.map((p) => {
              const active = p.id === selectedId;
              return (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => select(p)}
                    className={`flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left transition-all ${
                      active
                        ? "bg-teal-500/10 border-l-4 border-teal-500"
                        : "hover:bg-white/5 border-l-4 border-transparent"
                    }`}
                  >
                    <span>
                      <span className="block text-sm font-bold text-white">{p.id}</span>
                      <span className="block text-xs text-slate-500">
                        {p.age}y · {p.center}
                      </span>
                    </span>
                    <span className="text-right">
                      <span className={`block rounded-full ${gradeColor(p.grade)} px-2.5 py-0.5 text-xs font-bold text-white`}>
                        Grade {p.grade}
                      </span>
                      <span className="mt-1 block text-xs text-slate-500">{p.wait}</span>
                    </span>
                  </button>
                </li>
              );
            })}
            {queue.length === 0 && (
              <li className="px-4 py-10 text-center text-sm text-slate-500">
                <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-400 mb-2" />
                Queue cleared. All cases verified.
              </li>
            )}
          </ul>
        </aside>

        {/* XAI console */}
        <section className="glass-card rounded-2xl">
          {selected ? (
            <div className="flex h-full flex-col">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 px-5 py-4">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    {selected.id}
                    <span className={`rounded-full ${gradeColor(selected.grade)} px-2.5 py-0.5 text-xs font-bold text-white`}>
                      Grade {selected.grade}
                    </span>
                  </h2>
                  <p className="text-sm text-slate-400">
                    AI prediction:{" "}
                    <span className="font-semibold gradient-text">
                      {selected.gradeLabel}
                    </span>
                    {" · "}{selected.age}y · {selected.center}
                  </p>
                </div>
                <label className="flex cursor-pointer items-center gap-3 text-sm text-slate-300">
                  <Flame className="h-4 w-4 text-teal-400" />
                  Grad-CAM Heatmap
                  <span className="relative inline-flex">
                    <input
                      type="checkbox"
                      checked={heatmap}
                      onChange={(e) => setHeatmap(e.target.checked)}
                      className="peer sr-only"
                    />
                    <span className="block h-6 w-11 rounded-full bg-white/10 border border-white/10 transition-colors peer-checked:bg-gradient-to-r peer-checked:from-teal-600 peer-checked:to-cyan-600" />
                    <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-5" />
                  </span>
                </label>
              </div>

              <div className="p-5">
                <div className={`relative mx-auto aspect-square w-full max-w-xl overflow-hidden rounded-2xl bg-black border-2 ${gradeBorderColor(selected.grade)} transition-colors`}>
                  <img
                    src={fundus}
                    alt={`Fundus scan for patient ${selected.id}`}
                    width={1024}
                    height={1024}
                    className="h-full w-full object-contain"
                  />
                  {heatmap && (
                    <div
                      className="pointer-events-none absolute inset-0 mix-blend-screen opacity-70"
                      style={{
                        background:
                          "radial-gradient(circle at 38% 44%, rgba(255,0,0,0.85) 0%, rgba(255,180,0,0.55) 12%, rgba(0,200,255,0.28) 24%, transparent 38%), radial-gradient(circle at 63% 61%, rgba(255,40,0,0.7) 0%, rgba(255,220,0,0.45) 10%, rgba(0,160,255,0.22) 20%, transparent 32%), radial-gradient(circle at 52% 30%, rgba(255,120,0,0.5) 0%, rgba(0,180,255,0.2) 14%, transparent 26%)",
                      }}
                    />
                  )}
                  {heatmap && (
                    <span className="absolute bottom-3 left-3 rounded-lg bg-black/80 backdrop-blur-sm px-3 py-1.5 text-xs text-white border border-white/10">
                      <Flame className="inline h-3 w-3 mr-1 text-teal-400" />
                      Grad-CAM activation — haemorrhages & exudates
                    </span>
                  )}
                </div>
              </div>

              {/* Action bar */}
              <div className="mt-auto flex flex-col gap-3 border-t border-white/5 bg-white/[3%] px-5 py-4 sm:flex-row sm:items-center">
                <label className="flex items-center gap-2 text-sm text-slate-300">
                  Final Grade
                  <select
                    value={finalGrade}
                    onChange={(e) => setFinalGrade(Number(e.target.value))}
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500/50 transition-all"
                  >
                    {GRADES.map((label, i) => (
                      <option key={label} value={i} className="bg-slate-900 text-white">
                        {label}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={resolve}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-5 py-2.5 font-bold text-white shadow-lg shadow-emerald-500/20 transition-all hover:shadow-emerald-500/40 hover:brightness-110"
                  >
                    <CheckCircle2 className="h-5 w-5" /> Confirm AI Diagnosis
                  </button>
                  <button
                    type="button"
                    onClick={resolve}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-red-500 px-5 py-2.5 font-bold text-white shadow-lg shadow-red-500/20 transition-all hover:shadow-red-500/40 hover:brightness-110"
                  >
                    <XCircle className="h-5 w-5" /> Override Diagnosis
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex h-full min-h-[50vh] flex-col items-center justify-center px-6 text-center">
              <CheckCircle2 className="h-16 w-16 text-emerald-400 mb-4" />
              <p className="text-lg font-semibold text-white">All Clear</p>
              <p className="text-sm text-slate-500 mt-1">No patient selected — the pending queue is empty.</p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
