import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Eye, Info, ArrowLeft, Shield, Stethoscope, MonitorSmartphone } from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — Netra Rakshak Screening Portal" },
      {
        name: "description",
        content:
          "Sign in to Netra Rakshak as a PHC kiosk operator or as an ophthalmologist to validate AI retinopathy grades.",
      },
      { property: "og:title", content: "Sign in — Netra Rakshak Screening Portal" },
      {
        property: "og:description",
        content: "Role-based access for PHC kiosk operators and specialist ophthalmologists.",
      },
    ],
  }),
  component: LoginPage,
});

type Role = "kiosk" | "doctor";

function LoginPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState<Role>("kiosk");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [centerId, setCenterId] = useState("");
  const [pending, setPending] = useState(false);

  function submit(e: FormEvent) {
    e.preventDefault();
    if (role === "kiosk") {
      // Mock session; swap for Supabase auth later.
      navigate({ to: "/kiosk" });
    } else {
      setPending(true);
    }
  }

  const tab = (value: Role, label: string, Icon: typeof Shield) => (
    <button
      key={value}
      type="button"
      onClick={() => {
        setRole(value);
        setPending(false);
      }}
      className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
        role === value
          ? "bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-lg shadow-teal-500/20"
          : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-12 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-teal-500/5 rounded-full blur-[120px] animate-pulse-glow" />
        <div className="absolute bottom-1/4 right-1/3 w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-[100px] animate-pulse-glow" style={{ animationDelay: "1.5s" }} />
        <div className="absolute inset-0 bg-dot opacity-30" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-slate-500 transition-colors hover:text-teal-400 mb-6"
        >
          <ArrowLeft className="h-4 w-4" /> Back home
        </Link>

        <div className="glass-card rounded-2xl p-8">
          <div className="flex flex-col items-center text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 shadow-lg shadow-teal-500/30">
              <Eye className="h-7 w-7 text-white" />
            </span>
            <h1 className="mt-5 text-2xl font-bold tracking-tight text-white">
              Netra Rakshak Portal
            </h1>
            <p className="mt-1 text-sm text-slate-400">Sign in or register to continue</p>
          </div>

          <div className="mt-6 flex gap-1 rounded-2xl bg-white/5 border border-white/5 p-1">
            {tab("kiosk", "PHC Kiosk", MonitorSmartphone)}
            {tab("doctor", "Ophthalmologist", Stethoscope)}
          </div>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="email" className="text-sm font-medium text-slate-300">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@health.gov.in"
                className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/20 transition-all"
              />
            </div>

            <div>
              <label htmlFor="password" className="text-sm font-medium text-slate-300">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/20 transition-all"
              />
            </div>

            {role === "kiosk" && (
              <div>
                <label htmlFor="center" className="text-sm font-medium text-slate-300">
                  Center / Organization ID
                </label>
                <input
                  id="center"
                  required
                  value={centerId}
                  onChange={(e) => setCenterId(e.target.value)}
                  placeholder="PHC-ANAND-04"
                  className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/20 transition-all"
                />
              </div>
            )}

            {pending && (
              <div className="flex items-start gap-2.5 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3.5 text-sm text-amber-300">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                <p>Account registered. Pending admin verification.</p>
              </div>
            )}

            <button
              type="submit"
              className="w-full rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 px-5 py-3.5 font-bold text-white shadow-lg shadow-teal-500/20 transition-all hover:shadow-teal-500/40 hover:brightness-110"
            >
              {role === "kiosk" ? "Sign in & Start Screening" : "Sign in / Register"}
            </button>

            {role === "doctor" && (
              <button
                type="button"
                onClick={() => navigate({ to: "/doctor" })}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-5 py-3.5 font-semibold text-slate-300 transition-all hover:bg-white/10 hover:border-white/20"
              >
                Enter Doctor Portal (Demo Mode)
              </button>
            )}
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-slate-600">
          Demo build — authentication is simulated.
        </p>
      </div>
    </main>
  );
}
