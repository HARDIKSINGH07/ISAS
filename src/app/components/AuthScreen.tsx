import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { GraduationCap, Users, ShieldCheck, ArrowLeft, Sparkles } from "lucide-react";
import { useApp } from "../context/AppContext";
import { Role } from "../data/mockData";
import { ClayButton, ClayInput } from "./ui-kit";

const ROLES: {
  role: Role;
  label: string;
  desc: string;
  icon: typeof GraduationCap;
  accent: string;
  demo: { email: string; pass: string };
}[] = [
  {
    role: "student",
    label: "Student",
    desc: "Track attendance, assignments & events",
    icon: GraduationCap,
    accent: "var(--accent-peri)",
    demo: { email: "aarav@student.isas.edu", pass: "student123" },
  },
  {
    role: "teacher",
    label: "Teacher",
    desc: "Mark rosters & post assignments",
    icon: Users,
    accent: "var(--accent-teal)",
    demo: { email: "neha@faculty.isas.edu", pass: "teacher123" },
  },
  {
    role: "admin",
    label: "Admin",
    desc: "Manage campus events & oversight",
    icon: ShieldCheck,
    accent: "var(--accent-violet)",
    demo: { email: "rohan@admin.isas.edu", pass: "admin123" },
  },
];

export function AuthScreen() {
  const { login, pushToast } = useApp();
  const [selected, setSelected] = useState<Role | null>(null);
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const active = ROLES.find((r) => r.role === selected);

  async function handleLogin() {
    if (!selected) return;
    setLoading(true);
    setError("");
    const success = await login(email, pass, selected);
    setLoading(false);
    if (success) {
      pushToast({ title: "Welcome back!", message: `Signed in as ${selected}`, tone: "success" });
    } else {
      setError("Invalid credentials for this role. Try the demo autofill.");
    }
  }

  function pickRole(r: Role) {
    setSelected(r);
    setError("");
    setEmail("");
    setPass("");
    document.documentElement.setAttribute("data-role", r);
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="inline-flex items-center gap-2 mb-2">
          <div className="grid place-items-center w-12 h-12 rounded-2xl clay-sm">
            <Sparkles className="role-text" size={24} />
          </div>
          <span className="font-display text-3xl">ISAS</span>
        </div>
        <p className="text-soft">Integrated Student Assistance System</p>
      </motion.div>

      <AnimatePresence mode="wait">
        {!selected ? (
          <motion.div
            key="select"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-3xl"
          >
            <h2 className="font-display text-center mb-6">Choose your role to continue</h2>
            <div className="grid sm:grid-cols-3 gap-5" style={{ perspective: 1000 }}>
              {ROLES.map((r, i) => {
                const Icon = r.icon;
                return (
                  <motion.button
                    key={r.role}
                    initial={{ opacity: 0, y: 30, rotateX: -8 }}
                    animate={{
                      opacity: 1,
                      y: [0, -6, 0][i % 3] * 0 + (i === 1 ? -10 : 0),
                      rotateX: 0,
                    }}
                    transition={{ delay: i * 0.08, type: "spring", stiffness: 200, damping: 18 }}
                    whileHover={{ y: -10, scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => pickRole(r.role)}
                    className="clay p-6 text-left focus-clay"
                    style={{ ["--role" as any]: r.accent }}
                  >
                    <div
                      className="grid place-items-center w-14 h-14 rounded-2xl mb-4"
                      style={{ background: r.accent, boxShadow: "var(--clay-shadow-sm)" }}
                    >
                      <Icon size={26} className="text-white" />
                    </div>
                    <div className="font-display text-lg">{r.label}</div>
                    <p className="text-soft text-sm mt-1">{r.desc}</p>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="login"
            initial={{ opacity: 0, scale: 0.9, filter: "blur(8px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 200, damping: 22 }}
            className="glass p-7 w-full max-w-sm"
            style={{ ["--role" as any]: active!.accent }}
          >
            <button
              onClick={() => setSelected(null)}
              className="flex items-center gap-1.5 text-soft text-sm mb-5 focus-clay rounded-lg"
            >
              <ArrowLeft size={16} /> Back to roles
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div
                className="grid place-items-center w-12 h-12 rounded-2xl"
                style={{ background: active!.accent }}
              >
                <active.icon size={22} className="text-white" />
              </div>
              <div>
                <div className="font-display text-lg">{active!.label} Login</div>
                <div className="text-soft text-xs">Sign in to your account</div>
              </div>
            </div>

            <div className="space-y-3">
              <ClayInput
                placeholder="Email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
              />
              <ClayInput
                placeholder="Password"
                type="password"
                value={pass}
                onChange={(e) => {
                  setPass(e.target.value);
                  setError("");
                }}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              />

              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm px-1"
                  style={{ color: "var(--accent-coral)" }}
                >
                  {error}
                </motion.p>
              )}

              <ClayButton className="w-full" onClick={handleLogin} disabled={!email || !pass || loading}>
                {loading ? "Signing in..." : "Sign in"}
              </ClayButton>

              <button
                onClick={() => {
                  setEmail(active!.demo.email);
                  setPass(active!.demo.pass);
                  setError("");
                }}
                className="w-full text-center text-sm text-soft py-2 focus-clay rounded-xl"
              >
                Use demo credentials
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
