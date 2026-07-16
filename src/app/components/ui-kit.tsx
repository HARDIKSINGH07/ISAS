import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { ReactNode, ButtonHTMLAttributes, useRef } from "react";

// ---------- ClayCard with cursor-follow tilt + lift ----------
export function ClayCard({
  children,
  className = "",
  tilt = true,
  onClick,
  lift = true,
}: {
  children: ReactNode;
  className?: string;
  tilt?: boolean;
  onClick?: () => void;
  lift?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const rx = useSpring(useMotionValue(0), { stiffness: 200, damping: 18 });
  const ry = useSpring(useMotionValue(0), { stiffness: 200, damping: 18 });

  function handleMove(e: React.MouseEvent) {
    if (!tilt || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    ry.set(px * 8);
    rx.set(-py * 8);
  }
  function reset() {
    rx.set(0);
    ry.set(0);
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      onClick={onClick}
      whileHover={lift ? { y: -4 } : undefined}
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 800 }}
      className={`clay p-5 ${onClick ? "cursor-pointer" : ""} ${className}`}
    >
      {children}
    </motion.div>
  );
}

// ---------- ClayButton with squish ----------
type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "soft";
  children: ReactNode;
};
export function ClayButton({
  variant = "primary",
  children,
  className = "",
  disabled,
  ...rest
}: BtnProps) {
  const base =
    "relative inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl select-none focus-clay transition-colors disabled:opacity-40 disabled:cursor-not-allowed";
  const styles: Record<string, string> = {
    primary: "role-bg text-white",
    ghost: "clay-sm",
    soft: "text-white",
  };
  return (
    <motion.button
      whileTap={disabled ? undefined : { scale: 0.95 }}
      transition={{ type: "spring", stiffness: 500, damping: 20 }}
      className={`${base} ${styles[variant]} ${className}`}
      style={
        variant === "primary"
          ? { boxShadow: "var(--clay-shadow-sm)" }
          : variant === "soft"
          ? { background: "var(--role)", boxShadow: "var(--clay-shadow-sm)" }
          : undefined
      }
      disabled={disabled}
      {...(rest as any)}
    >
      {children}
    </motion.button>
  );
}

// ---------- IconButton ----------
export function IconButton({
  children,
  className = "",
  active = false,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode; active?: boolean }) {
  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      className={`grid place-items-center w-11 h-11 rounded-2xl clay-sm focus-clay ${className}`}
      style={active ? { boxShadow: "var(--clay-pressed)", color: "var(--role)" } : undefined}
      {...(rest as any)}
    >
      {children}
    </motion.button>
  );
}

// ---------- Attendance ring ----------
export function AttendanceRing({
  percent,
  size = 96,
  stroke = 10,
  label,
}: {
  percent: number;
  size?: number;
  stroke?: number;
  label?: string;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const color =
    percent < 75 ? "var(--accent-coral)" : percent < 85 ? "var(--accent-amber)" : "var(--accent-mint)";
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          stroke="var(--clay-bg-2)"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          stroke={color}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c - (c * Math.min(percent, 100)) / 100 }}
          transition={{ type: "spring", stiffness: 60, damping: 15 }}
        />
      </svg>
      <div className="absolute text-center leading-tight">
        <div className="font-display" style={{ fontSize: size * 0.24, color }}>
          {percent}%
        </div>
        {label && <div className="text-soft" style={{ fontSize: 10 }}>{label}</div>}
      </div>
    </div>
  );
}

// ---------- Status pill ----------
export function StatusPill({ status }: { status: string }) {
  const map: Record<string, { bg: string; label: string }> = {
    Present: { bg: "var(--accent-mint)", label: "Present" },
    Absent: { bg: "var(--accent-coral)", label: "Absent" },
    Late: { bg: "var(--accent-amber)", label: "Late" },
    overdue: { bg: "var(--accent-coral)", label: "Overdue" },
    done: { bg: "var(--accent-mint)", label: "Done" },
    pending: { bg: "var(--accent-amber)", label: "Pending" },
  };
  const s = map[status] ?? { bg: "var(--role)", label: status };
  return (
    <span
      className="px-2.5 py-0.5 rounded-full text-white"
      style={{ background: s.bg, fontSize: 11 }}
    >
      {s.label}
    </span>
  );
}

// ---------- Toggle switch ----------
export function ClayToggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="relative w-14 h-8 rounded-full clay-inset focus-clay"
      style={{ background: checked ? "var(--role)" : "var(--clay-bg-2)" }}
      aria-pressed={checked}
    >
      <motion.span
        className="absolute top-1 w-6 h-6 rounded-full bg-white"
        style={{ boxShadow: "2px 2px 5px rgba(0,0,0,0.25)" }}
        animate={{ left: checked ? 28 : 4 }}
        transition={{ type: "spring", stiffness: 500, damping: 28 }}
      />
    </button>
  );
}

// ---------- Text input ----------
export function ClayInput({
  className = "",
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`w-full px-4 py-3 rounded-2xl clay-inset bg-transparent outline-none focus-clay placeholder:text-[var(--clay-text-soft)] ${className}`}
      style={{ color: "var(--clay-text)" }}
      {...rest}
    />
  );
}

export function ClayTextarea({
  className = "",
  ...rest
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={`w-full px-4 py-3 rounded-2xl clay-inset bg-transparent outline-none focus-clay resize-none placeholder:text-[var(--clay-text-soft)] ${className}`}
      style={{ color: "var(--clay-text)" }}
      {...rest}
    />
  );
}

// ---------- Section title ----------
export function SectionTitle({ children, sub }: { children: ReactNode; sub?: string }) {
  return (
    <div className="mb-1">
      <h2 className="font-display">{children}</h2>
      {sub && <p className="text-soft text-sm">{sub}</p>}
    </div>
  );
}
