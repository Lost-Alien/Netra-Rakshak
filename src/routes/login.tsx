import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Eye, Info, ArrowLeft, Shield, Stethoscope, MonitorSmartphone, Lock } from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — Netra Rakshak Portal" },
      {
        name: "description",
        content:
          "Sign in to Netra Rakshak as a PHC kiosk operator or as an ophthalmologist to validate AI retinopathy grades.",
      },
      { property: "og:title", content: "Sign in — Netra Rakshak Portal" },
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
  const [email, setEmail] = useState("phc.anand@health.gov.in");
  const [password, setPassword] = useState("••••••••");
  const [centerId, setCenterId] = useState("PHC-ANAND-04");
  const [pending, setPending] = useState(false);

  function submit(e: FormEvent) {
    e.preventDefault();
    if (role === "kiosk") {
      navigate({ to: "/kiosk" });
    } else {
      navigate({ to: "/doctor" });
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[var(--color-paper-alt)] px-4 py-12">
      <div className="w-full max-w-md">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-[14px] font-medium text-[var(--color-gray)] hover:text-[var(--color-ink)] transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Netra Rakshak Home
        </Link>

        <div className="border border-[var(--color-gray-line)] bg-[var(--color-paper)] p-8 shadow-sm">
          <div className="text-center pb-6 border-b border-[var(--color-gray-line)]">
            <span className="inline-flex h-12 w-12 items-center justify-center border border-[var(--color-gray-line)] bg-[var(--color-paper-alt)] font-serif text-xl font-bold text-[var(--color-teal)] mb-3">
              NR
            </span>
            <h1 className="font-serif text-[24px] font-semibold text-[var(--color-ink)]">
              Portal Access
            </h1>
            <p className="text-[13px] text-[var(--color-gray)] mt-1">
              Diabetic Retinopathy Screening & Specialist Validation
            </p>
          </div>

          {/* Role selector */}
          <div className="mt-6 flex border border-[var(--color-gray-line)] p-1 bg-[var(--color-paper-alt)]">
            <button
              type="button"
              onClick={() => {
                setRole("kiosk");
                setEmail("phc.anand@health.gov.in");
                setCenterId("PHC-ANAND-04");
              }}
              className={`flex flex-1 items-center justify-center gap-2 py-2 text-[13px] font-medium transition-all ${
                role === "kiosk"
                  ? "bg-[var(--color-paper)] text-[var(--color-teal)] shadow-sm font-semibold"
                  : "text-[var(--color-gray)] hover:text-[var(--color-ink)]"
              }`}
            >
              <MonitorSmartphone className="h-4 w-4" />
              PHC Kiosk
            </button>
            <button
              type="button"
              onClick={() => {
                setRole("doctor");
                setEmail("dr.sharma@hospital.gov.in");
              }}
              className={`flex flex-1 items-center justify-center gap-2 py-2 text-[13px] font-medium transition-all ${
                role === "doctor"
                  ? "bg-[var(--color-paper)] text-[var(--color-teal)] shadow-sm font-semibold"
                  : "text-[var(--color-gray)] hover:text-[var(--color-ink)]"
              }`}
            >
              <Stethoscope className="h-4 w-4" />
              Ophthalmologist
            </button>
          </div>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="email" className="block text-[12px] font-medium text-[var(--color-ink)] mb-1">
                Official Email ID
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@health.gov.in"
                className="w-full border border-[var(--color-gray-line)] bg-[var(--color-paper-alt)] px-3 py-2 text-[14px] text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-teal)]"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-[12px] font-medium text-[var(--color-ink)] mb-1">
                Security Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full border border-[var(--color-gray-line)] bg-[var(--color-paper-alt)] px-3 py-2 text-[14px] text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-teal)]"
              />
            </div>

            {role === "kiosk" && (
              <div>
                <label htmlFor="center" className="block text-[12px] font-medium text-[var(--color-ink)] mb-1">
                  Primary Health Centre / Facility ID
                </label>
                <input
                  id="center"
                  required
                  value={centerId}
                  onChange={(e) => setCenterId(e.target.value)}
                  placeholder="PHC-ANAND-04"
                  className="w-full border border-[var(--color-gray-line)] bg-[var(--color-paper-alt)] px-3 py-2 text-[14px] text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-teal)]"
                />
              </div>
            )}

            <div className="pt-2 space-y-2">
              <button
                type="submit"
                className="w-full bg-[var(--color-teal)] py-3 text-[14px] font-medium text-white transition-colors hover:bg-[#0c5854]"
              >
                {role === "kiosk" ? "Open Kiosk Screening Station →" : "Access Specialist Console →"}
              </button>

              <div className="relative py-2 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[var(--color-gray-line)]" />
                </div>
                <span className="relative bg-[var(--color-paper)] px-3 text-[11px] font-mono text-[var(--color-gray)] uppercase">
                  or quick demo access
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => navigate({ to: "/kiosk" })}
                  className="border border-[var(--color-gray-line)] py-2 text-[12px] font-medium text-[var(--color-ink)] hover:bg-[var(--color-paper-alt)] transition-colors"
                >
                  Demo Kiosk
                </button>
                <button
                  type="button"
                  onClick={() => navigate({ to: "/doctor" })}
                  className="border border-[var(--color-gray-line)] py-2 text-[12px] font-medium text-[var(--color-ink)] hover:bg-[var(--color-paper-alt)] transition-colors"
                >
                  Demo Specialist
                </button>
              </div>
            </div>
          </form>
        </div>

        <p className="mt-6 text-center text-[12px] text-[var(--color-gray)]">
          Smart India Hackathon 2026 • Demo Authentication Simulated
        </p>
      </div>
    </main>
  );
}
