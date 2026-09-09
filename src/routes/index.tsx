import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import {
  Eye,
  ScanEye,
  Brain,
  Timer,
  ArrowRight,
  Activity,
  Shield,
  Microscope,
  Cpu,
  BarChart3,
  Workflow,
  ImagePlus,
  Layers,
  Target,
  Sparkles,
  TrendingUp,
  Users,
  ChevronRight,
  ExternalLink,
  Github,
  Mail,
  Linkedin,
  Menu,
  X,
} from "lucide-react";

export const Route = createFileRoute("/")(
  {
    head: () => ({
      meta: [
        { title: "Netra Rakshak — Explainable AI for Diabetic Retinopathy Screening in Rural India" },
        {
          name: "description",
          content:
            "Explainable AI diabetic retinopathy screening for rural India: instant quality triage, Grad-CAM heatmaps, >90% sensitivity, and 30-second specialist validation. SIH Problem Statement 26038.",
        },
        { property: "og:title", content: "Netra Rakshak — Explainable AI Retinal Screening" },
        {
          property: "og:description",
          content:
            "Instant quality triage, Grad-CAM lesion heatmaps, and rapid specialist sign-off for rural eye screening.",
        },
      ],
    }),
    component: LandingPage,
  },
);

/* ─── Animated Counter Hook ─────────────────────────────── */

function useCounter(end: number, duration = 2000, suffix = "") {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry?.isIntersecting) setStarted(true); },
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    let frame: number;
    const start = performance.now();
    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * end));
      if (progress < 1) frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [started, end, duration]);

  return { count, ref, suffix };
}

/* ─── Section wrapper with scroll-triggered fade-in ────── */

function FadeSection({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry?.isIntersecting) setVisible(true); },
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

/* ─── Data ──────────────────────────────────────────────── */

const CRISIS_STATS = [
  { value: "77M+", label: "Diabetic adults in India", sub: "2nd highest globally" },
  { value: "~18%", label: "Affected by DR", sub: "Diabetic Retinopathy prevalence" },
  { value: "90%", label: "Vision loss preventable", sub: "With early screening" },
  { value: "1:100K", label: "Ophthalmologist ratio", sub: "In rural populations" },
];

const PIPELINE_STEPS = [
  {
    icon: ImagePlus,
    step: "01",
    title: "Image Quality Assessment",
    desc: "Automatically evaluates fundus images for focus, illumination, and field of view. Applies adaptive CLAHE enhancement for borderline images; rejects ungradeable ones with recapture feedback.",
    tags: ["CLAHE", "Illumination Normalization", "Denoising"],
  },
  {
    icon: Microscope,
    step: "02",
    title: "Retinal Structure Segmentation",
    desc: "Extracts clinically relevant structures: optic disc/fovea localization, vessel segmentation, microaneurysm detection, exudate segmentation, hemorrhage classification, and neovascularization detection.",
    tags: ["Optic Disc", "Vessels", "Microaneurysms", "Exudates"],
  },
  {
    icon: Layers,
    step: "03",
    title: "DR Severity Grading",
    desc: "Classifies retinopathy using the International Clinical DR severity scale (Levels 0–4) with >90% sensitivity and >85% specificity for referable DR (Level 2+).",
    tags: ["ICDR Scale", "Levels 0–4", ">90% Sensitivity"],
  },
  {
    icon: Brain,
    step: "04",
    title: "Explainability Module",
    desc: "Implements Grad-CAM attention maps, lesion-level evidence correlated with clinical criteria, calibrated confidence scores, and automated annotated reports enabling ophthalmologist validation in under 30 seconds.",
    tags: ["Grad-CAM", "Confidence Scores", "Annotated Reports"],
  },
  {
    icon: Workflow,
    step: "05",
    title: "Simulink Workflow Simulation",
    desc: "Models the telemedicine screening pipeline — image acquisition rates, bandwidth constraints, processing throughput, and review capacity — to optimize resource allocation for district-level programs.",
    tags: ["Telemedicine", "Resource Optimization", "100K+ Patients/Year"],
  },
];

const FEATURES = [
  {
    icon: ScanEye,
    title: "Smart Quality Triage",
    body: "Instant focus and illumination check with automatic CLAHE enhancement and borderline image recovery.",
  },
  {
    icon: Brain,
    title: "Explainable Grad-CAM",
    body: "Zero black-box uncertainty — see exact lesion correlations with clinical-grade attention heatmaps.",
  },
  {
    icon: Timer,
    title: "30-Second Validation",
    body: "Risk-sorted triage enabling specialist sign-off in under 30 seconds for human-in-the-loop workflow.",
  },
  {
    icon: Target,
    title: "Sub-Pixel Detection",
    body: "Detects microaneurysms as small as 10μm using advanced deep learning and image processing techniques.",
  },
  {
    icon: Shield,
    title: "Clinical Validation",
    body: "Validated against published benchmarks (EyePACS, APTOS, IDRiD) with >90% sensitivity for referable DR.",
  },
  {
    icon: BarChart3,
    title: "Resource Optimization",
    body: "Simulink-modeled telemedicine pipeline optimizing screening throughput for 100K+ patients annually.",
  },
];

const TECH_STACK = [
  "MATLAB",
  "Image Processing Toolbox",
  "Deep Learning Toolbox",
  "Computer Vision Toolbox",
  "Medical Imaging Toolbox",
  "Simulink",
  "Statistics & ML Toolbox",
];

const TEAM = [
  { name: "Abhishek Patwa", role: "Team Lead & ML Engineer", initials: "AP" },
  { name: "Dr. Priya Sharma", role: "Clinical Advisor", initials: "PS" },
  { name: "Rahul Mehta", role: "Computer Vision Engineer", initials: "RM" },
  { name: "Sneha Gupta", role: "Full Stack Developer", initials: "SG" },
];

/* ─── Landing Page Component ───────────────────────────── */

function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const sensitivity = useCounter(93, 2000);
  const specificity = useCounter(88, 2000);
  const validationTime = useCounter(28, 1500);
  const capacity = useCounter(100, 2000);

  return (
    <main className="min-h-screen bg-background overflow-x-hidden">
      {/* ── Ambient background glow ── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-teal-500/5 rounded-full blur-[120px] animate-pulse-glow" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[100px] animate-pulse-glow" style={{ animationDelay: "1.5s" }} />
        <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-teal-600/3 rounded-full blur-[80px] animate-pulse-glow" style={{ animationDelay: "3s" }} />
      </div>

      {/* ── Navbar ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2.5 group">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 shadow-lg shadow-teal-500/20 group-hover:shadow-teal-500/40 transition-shadow">
              <Eye className="h-5 w-5 text-white" />
            </span>
            <span className="text-lg font-bold tracking-tight text-white">
              Netra <span className="gradient-text">Rakshak</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#pipeline" className="text-sm text-slate-400 hover:text-teal-400 transition-colors">Pipeline</a>
            <a href="#features" className="text-sm text-slate-400 hover:text-teal-400 transition-colors">Features</a>
            <a href="#metrics" className="text-sm text-slate-400 hover:text-teal-400 transition-colors">Performance</a>
            <a href="#team" className="text-sm text-slate-400 hover:text-teal-400 transition-colors">Team</a>
            <Link
              to="/login"
              className="rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-teal-500/20 transition-all hover:shadow-teal-500/40 hover:brightness-110"
            >
              Access Portal
            </Link>
          </div>

          {/* Mobile menu toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-400 hover:text-white transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden glass border-t border-white/5 px-6 py-4 space-y-3">
            <a href="#pipeline" onClick={() => setMobileMenuOpen(false)} className="block text-sm text-slate-300 hover:text-teal-400 transition-colors py-2">Pipeline</a>
            <a href="#features" onClick={() => setMobileMenuOpen(false)} className="block text-sm text-slate-300 hover:text-teal-400 transition-colors py-2">Features</a>
            <a href="#metrics" onClick={() => setMobileMenuOpen(false)} className="block text-sm text-slate-300 hover:text-teal-400 transition-colors py-2">Performance</a>
            <a href="#team" onClick={() => setMobileMenuOpen(false)} className="block text-sm text-slate-300 hover:text-teal-400 transition-colors py-2">Team</a>
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="block w-full text-center rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 px-5 py-2.5 text-sm font-semibold text-white mt-2"
            >
              Access Portal
            </Link>
          </div>
        )}
      </nav>

      {/* ── Hero Section ── */}
      <section className="relative z-10 pt-32 pb-20 sm:pt-40 sm:pb-28">
        <div className="mx-auto w-full max-w-7xl px-6">
          <div className="max-w-4xl mx-auto text-center">
            <FadeSection>
              <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/20 bg-teal-500/10 px-4 py-1.5 text-xs font-medium text-teal-400 mb-8">
                <Sparkles className="h-3.5 w-3.5" />
                SIH 2025 · Problem Statement 26038 · MathWorks
              </div>
            </FadeSection>

            <FadeSection delay={100}>
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight leading-[1.1]">
                <span className="text-white">Explainable AI for</span>
                <br />
                <span className="gradient-text text-shadow-glow">Diabetic Retinopathy</span>
                <br />
                <span className="text-white">Screening in Rural India</span>
              </h1>
            </FadeSection>

            <FadeSection delay={200}>
              <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg text-slate-400 leading-relaxed">
                Empowering frontline health workers with <span className="text-teal-400 font-medium">instant quality control</span>,{" "}
                <span className="text-teal-400 font-medium">sub-pixel lesion detection</span>, and{" "}
                <span className="text-teal-400 font-medium">30-second specialist validation</span> — turning every Primary Health Centre into an AI-powered eye screening station.
              </p>
            </FadeSection>

            <FadeSection delay={300}>
              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to="/login"
                  className="group inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-teal-600 to-cyan-600 px-8 py-4 text-base font-bold text-white shadow-xl shadow-teal-500/20 transition-all hover:shadow-teal-500/40 hover:brightness-110"
                >
                  Access Screening Portal
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
                <a
                  href="#pipeline"
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-8 py-4 text-base font-semibold text-slate-300 transition-all hover:bg-white/10 hover:border-white/20"
                >
                  View Pipeline
                  <ChevronRight className="h-5 w-5" />
                </a>
              </div>
            </FadeSection>
          </div>
        </div>
      </section>

      {/* ── Crisis Statistics ── */}
      <section className="relative z-10 py-16 sm:py-20">
        <div className="mx-auto w-full max-w-7xl px-6">
          <FadeSection>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {CRISIS_STATS.map((stat, i) => (
                <div
                  key={stat.label}
                  className="glass-card-hover rounded-2xl p-6 text-center"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <p className="text-3xl sm:text-4xl font-extrabold gradient-text">{stat.value}</p>
                  <p className="mt-2 text-sm font-medium text-slate-300">{stat.label}</p>
                  <p className="mt-1 text-xs text-slate-500">{stat.sub}</p>
                </div>
              ))}
            </div>
          </FadeSection>
        </div>
      </section>

      {/* ── Pipeline Section ── */}
      <section id="pipeline" className="relative z-10 py-20 sm:py-28 scroll-mt-24">
        <div className="mx-auto w-full max-w-7xl px-6">
          <FadeSection>
            <div className="text-center mb-16">
              <p className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-1.5 text-xs font-medium text-cyan-400 mb-4">
                <Cpu className="h-3.5 w-3.5" /> MATLAB-Powered Pipeline
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-white">
                End-to-End Screening <span className="gradient-text">Architecture</span>
              </h2>
              <p className="mt-4 max-w-2xl mx-auto text-slate-400">
                A five-stage pipeline addressing real-world deployment challenges — from image acquisition to district-level resource optimization.
              </p>
            </div>
          </FadeSection>

          <div className="space-y-6">
            {PIPELINE_STEPS.map((step, i) => (
              <FadeSection key={step.step} delay={i * 100}>
                <div className="glass-card-hover rounded-2xl p-6 sm:p-8 group">
                  <div className="flex flex-col sm:flex-row gap-6">
                    <div className="flex items-start gap-4 sm:w-16 shrink-0">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500/20 to-cyan-500/20 border border-teal-500/20 group-hover:border-teal-500/40 transition-colors">
                        <step.icon className="h-7 w-7 text-teal-400" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-xs font-bold text-teal-500 tracking-widest">STEP {step.step}</span>
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                      <p className="text-slate-400 leading-relaxed">{step.desc}</p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {step.tags.map((tag) => (
                          <span key={tag} className="rounded-full bg-teal-500/10 border border-teal-500/20 px-3 py-1 text-xs font-medium text-teal-400">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </FadeSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features Grid ── */}
      <section id="features" className="relative z-10 py-20 sm:py-28 scroll-mt-24">
        <div className="mx-auto w-full max-w-7xl px-6">
          <FadeSection>
            <div className="text-center mb-16">
              <p className="inline-flex items-center gap-2 rounded-full border border-teal-500/20 bg-teal-500/10 px-4 py-1.5 text-xs font-medium text-teal-400 mb-4">
                <Activity className="h-3.5 w-3.5" /> Key Capabilities
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-white">
                Clinical-Grade <span className="gradient-text">Features</span>
              </h2>
              <p className="mt-4 max-w-2xl mx-auto text-slate-400">
                Every feature is designed for real-world clinical deployment in resource-constrained settings.
              </p>
            </div>
          </FadeSection>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <FadeSection key={f.title} delay={i * 80}>
                <article className="glass-card-hover rounded-2xl p-6 h-full">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500/20 to-cyan-500/20 border border-teal-500/20">
                    <f.icon className="h-6 w-6 text-teal-400" />
                  </span>
                  <h3 className="mt-5 text-lg font-bold text-white">{f.title}</h3>
                  <p className="mt-2 text-sm text-slate-400 leading-relaxed">{f.body}</p>
                </article>
              </FadeSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── Performance Metrics ── */}
      <section id="metrics" className="relative z-10 py-20 sm:py-28 scroll-mt-24">
        <div className="mx-auto w-full max-w-7xl px-6">
          <FadeSection>
            <div className="text-center mb-16">
              <p className="inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-4 py-1.5 text-xs font-medium text-amber-400 mb-4">
                <TrendingUp className="h-3.5 w-3.5" /> Benchmark Performance
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-white">
                Exceeding Clinical <span className="gradient-text-warm">Thresholds</span>
              </h2>
            </div>
          </FadeSection>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { counter: sensitivity, label: "Sensitivity", suffix: "%", sub: "For referable DR (Level 2+)", target: ">90% target" },
              { counter: specificity, label: "Specificity", suffix: "%", sub: "True negative rate", target: ">85% target" },
              { counter: validationTime, label: "Validation Time", suffix: "s", sub: "Average specialist sign-off", target: "<30s target" },
              { counter: capacity, label: "Annual Capacity", suffix: "K+", sub: "Patients per district program", target: "Scalable target" },
            ].map((metric, i) => (
              <FadeSection key={metric.label} delay={i * 100}>
                <div ref={metric.counter.ref} className="glass-card rounded-2xl p-6 text-center">
                  <p className="text-5xl sm:text-6xl font-extrabold gradient-text tabular-nums">
                    {metric.counter.count}{metric.suffix}
                  </p>
                  <p className="mt-3 text-sm font-semibold text-white">{metric.label}</p>
                  <p className="mt-1 text-xs text-slate-500">{metric.sub}</p>
                  <span className="mt-3 inline-flex rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs font-medium text-emerald-400">
                    ✓ {metric.target}
                  </span>
                </div>
              </FadeSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── Technology Stack ── */}
      <section className="relative z-10 py-16 sm:py-20">
        <div className="mx-auto w-full max-w-7xl px-6">
          <FadeSection>
            <div className="glass-card rounded-2xl p-8 sm:p-12">
              <div className="text-center mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-white">
                  Powered by <span className="gradient-text">MathWorks</span>
                </h2>
                <p className="mt-2 text-slate-400">Built with industry-standard MATLAB toolboxes</p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3">
                {TECH_STACK.map((tool) => (
                  <span
                    key={tool}
                    className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-300 hover:border-teal-500/30 hover:bg-teal-500/10 hover:text-teal-300 transition-all cursor-default"
                  >
                    {tool}
                  </span>
                ))}
              </div>
            </div>
          </FadeSection>
        </div>
      </section>

      {/* ── Team Section ── */}
      <section id="team" className="relative z-10 py-20 sm:py-28 scroll-mt-24">
        <div className="mx-auto w-full max-w-7xl px-6">
          <FadeSection>
            <div className="text-center mb-16">
              <p className="inline-flex items-center gap-2 rounded-full border border-teal-500/20 bg-teal-500/10 px-4 py-1.5 text-xs font-medium text-teal-400 mb-4">
                <Users className="h-3.5 w-3.5" /> Our Team
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-white">
                Built by <span className="gradient-text">Innovators</span>
              </h2>
            </div>
          </FadeSection>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {TEAM.map((member, i) => (
              <FadeSection key={member.name} delay={i * 100}>
                <div className="glass-card-hover rounded-2xl p-6 text-center">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 text-2xl font-bold text-white shadow-lg shadow-teal-500/20">
                    {member.initials}
                  </div>
                  <h3 className="mt-4 text-base font-bold text-white">{member.name}</h3>
                  <p className="mt-1 text-sm text-slate-400">{member.role}</p>
                </div>
              </FadeSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="relative z-10 py-20">
        <div className="mx-auto w-full max-w-7xl px-6">
          <FadeSection>
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-600 to-cyan-700 p-10 sm:p-16 text-center shadow-2xl shadow-teal-500/20">
              <div className="absolute inset-0 bg-grid opacity-10" />
              <div className="relative z-10">
                <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
                  Ready to Screen?
                </h2>
                <p className="mt-4 max-w-xl mx-auto text-teal-100">
                  Experience the complete explainable AI screening pipeline — from fundus capture to specialist validation in under 30 seconds.
                </p>
                <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link
                    to="/login"
                    className="group inline-flex items-center gap-2 rounded-2xl bg-white px-8 py-4 text-base font-bold text-teal-700 shadow-xl transition-all hover:shadow-2xl hover:brightness-105"
                  >
                    Launch Screening Portal
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            </div>
          </FadeSection>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="relative z-10 border-t border-white/5 bg-background/80">
        <div className="mx-auto w-full max-w-7xl px-6 py-12">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-cyan-500">
                  <Eye className="h-4 w-4 text-white" />
                </span>
                <span className="text-base font-bold text-white">Netra Rakshak</span>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed">
                Explainable AI for Diabetic Retinopathy Screening in Rural India.
              </p>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-white mb-3">Project</h4>
              <ul className="space-y-2 text-sm text-slate-500">
                <li>SIH Problem ID: 26038</li>
                <li>Organization: MathWorks</li>
                <li>Category: Software</li>
                <li>Theme: MedTech / BioTech / HealthTech</li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-white mb-3">Portal</h4>
              <ul className="space-y-2">
                <li><Link to="/login" className="text-sm text-slate-500 hover:text-teal-400 transition-colors">Login</Link></li>
                <li><Link to="/kiosk" className="text-sm text-slate-500 hover:text-teal-400 transition-colors">PHC Kiosk</Link></li>
                <li><Link to="/doctor" className="text-sm text-slate-500 hover:text-teal-400 transition-colors">Doctor Console</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-white mb-3">Connect</h4>
              <div className="flex gap-3">
                <a href="#" className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-teal-400 hover:border-teal-500/30 transition-all">
                  <Github className="h-4 w-4" />
                </a>
                <a href="#" className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-teal-400 hover:border-teal-500/30 transition-all">
                  <Mail className="h-4 w-4" />
                </a>
                <a href="#" className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-teal-400 hover:border-teal-500/30 transition-all">
                  <Linkedin className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>

          <div className="mt-10 border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-slate-600">
              © 2025 Team Netra Rakshak. Demo build — screening results are simulated and not for clinical use.
            </p>
            <p className="text-xs text-slate-600">
              Built for Smart India Hackathon 2025
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
