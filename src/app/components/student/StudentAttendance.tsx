import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { Check, X, Clock, TrendingUp } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { AttendanceStatus } from "../../data/mockData";
import { ClayCard, AttendanceRing, SectionTitle } from "../ui-kit";

export function StudentAttendance() {
  const {
    subjectStats,
    logAttendance,
    predictClassesNeeded,
    attendance,
    pushToast,
    attendancePercent,
  } = useApp();
  const stats = subjectStats("s1");
  const [selected, setSelected] = useState(stats[0].subject);

  function mark(subject: string, status: AttendanceStatus) {
    const before = attendancePercent("s1", subject);
    logAttendance(subject, status);
    // re-check after state settles
    setTimeout(() => {
      const after = attendancePercent("s1", subject);
      if (before >= 75 && after < 75) {
        pushToast({
          title: "Attendance alert",
          message: `${subject} dropped below 75%`,
          tone: "error",
        });
      } else {
        pushToast({ title: `Marked ${status}`, message: subject, tone: "success" });
      }
    }, 60);
  }

  // trend chart for selected subject
  const recs = attendance
    .filter((a) => a.studentID === "s1" && a.subject === selected)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  let cum = 0,
    tot = 0;
  const trend = recs.map((r, i) => {
    tot++;
    if (r.status !== "Absent") cum++;
    return { name: `S${i + 1}`, pct: Math.round((cum / tot) * 100) };
  });

  const sel = stats.find((s) => s.subject === selected)!;
  const needed = predictClassesNeeded("s1", selected);

  return (
    <div className="space-y-5">
      <SectionTitle sub="Log your sessions and track subject-wise percentage">
        Attendance
      </SectionTitle>

      {/* Subject list with rings */}
      <div className="grid sm:grid-cols-2 gap-4">
        {stats.map((s) => (
          <motion.div
            key={s.subject}
            layout
            onClick={() => setSelected(s.subject)}
            whileHover={{ y: -3 }}
            className="clay p-4 cursor-pointer flex items-center gap-4"
            style={
              selected === s.subject
                ? { boxShadow: "var(--clay-pressed)" }
                : undefined
            }
          >
            <AttendanceRing percent={s.percent} size={64} stroke={8} />
            <div className="min-w-0">
              <div className="font-display text-sm truncate">{s.subject}</div>
              <div className="text-soft text-xs">
                {s.present}/{s.total} attended
              </div>
              {s.percent < 75 && (
                <div style={{ color: "var(--accent-coral)", fontSize: 11 }}>Below threshold</div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Detail panel */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selected}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
        >
          <ClayCard tilt={false}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-display">{selected}</h3>
                <p className="text-soft text-sm">Log today's session</p>
              </div>
              <AttendanceRing percent={sel.percent} size={72} />
            </div>

            {/* recovery predictor */}
            <div
              className="clay-inset p-3 mb-4 flex items-center gap-2 text-sm"
              style={{ color: needed > 0 ? "var(--accent-amber)" : "var(--accent-mint)" }}
            >
              <TrendingUp size={16} />
              {needed > 0
                ? `Attend the next ${needed} class${needed > 1 ? "es" : ""} to reach 75%`
                : "You're above the 75% threshold — keep it up!"}
            </div>

            {/* log buttons */}
            <div className="grid grid-cols-3 gap-3 mb-5">
              <LogBtn icon={Check} label="Present" color="var(--accent-mint)" onClick={() => mark(selected, "Present")} />
              <LogBtn icon={Clock} label="Late" color="var(--accent-amber)" onClick={() => mark(selected, "Late")} />
              <LogBtn icon={X} label="Absent" color="var(--accent-coral)" onClick={() => mark(selected, "Absent")} />
            </div>

            {/* trend chart */}
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trend} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--clay-bg-2)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: "var(--clay-text-soft)" }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "var(--clay-text-soft)" }} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 16,
                      border: "none",
                      background: "var(--clay-surface)",
                      boxShadow: "var(--clay-shadow-sm)",
                      color: "var(--clay-text)",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="pct"
                    stroke="var(--role)"
                    strokeWidth={3}
                    dot={false}
                    animationDuration={600}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </ClayCard>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function LogBtn({
  icon: Icon,
  label,
  color,
  onClick,
}: {
  icon: typeof Check;
  label: string;
  color: string;
  onClick: () => void;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.94 }}
      onClick={onClick}
      className="clay-sm py-3 flex flex-col items-center gap-1 focus-clay"
    >
      <span className="grid place-items-center w-9 h-9 rounded-xl" style={{ background: color }}>
        <Icon size={18} className="text-white" />
      </span>
      <span className="text-xs">{label}</span>
    </motion.button>
  );
}
