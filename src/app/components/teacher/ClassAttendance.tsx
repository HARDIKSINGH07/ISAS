import { useState } from "react";
import { motion } from "motion/react";
import { Check, X, Clock, Users } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { roster, SECTIONS, AttendanceStatus, CURRENT_DATE } from "../../data/mockData";
import { ClayCard, AttendanceRing, SectionTitle } from "../ui-kit";

const STATUSES: { key: AttendanceStatus; icon: typeof Check; color: string }[] = [
  { key: "Present", icon: Check, color: "var(--accent-mint)" },
  { key: "Late", icon: Clock, color: "var(--accent-amber)" },
  { key: "Absent", icon: X, color: "var(--accent-coral)" },
];

export function ClassAttendance() {
  const { currentUser, setStudentStatus, classAverage, attendance, pushToast } = useApp();
  const subjects = currentUser!.subjectsTaught ?? [];
  const [subject, setSubject] = useState(subjects[0]);
  const [section, setSection] = useState(SECTIONS[0]);

  const students = roster.filter((r) => r.section === section);
  const today = CURRENT_DATE.toDateString();

  function todayStatus(studentID: string): AttendanceStatus | null {
    const rec = attendance.find(
      (a) =>
        a.studentID === studentID &&
        a.subject === subject &&
        new Date(a.date).toDateString() === today
    );
    return rec?.status ?? null;
  }

  function markAll(status: AttendanceStatus) {
    students.forEach((s) => setStudentStatus(s.studentID, subject, status));
    pushToast({ title: `All marked ${status}`, message: `${subject} · ${section}`, tone: "success" });
  }

  return (
    <div className="space-y-5">
      <SectionTitle sub="Mark and edit attendance for your class">Class Attendance</SectionTitle>

      {/* controls */}
      <div className="flex flex-wrap gap-3">
        <select
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="px-4 py-2.5 rounded-2xl clay-sm bg-transparent outline-none focus-clay flex-1"
          style={{ color: "var(--clay-text)" }}
        >
          {subjects.map((s) => (
            <option key={s} value={s} style={{ color: "#000" }}>
              {s}
            </option>
          ))}
        </select>
        <select
          value={section}
          onChange={(e) => setSection(e.target.value)}
          className="px-4 py-2.5 rounded-2xl clay-sm bg-transparent outline-none focus-clay"
          style={{ color: "var(--clay-text)" }}
        >
          {SECTIONS.map((s) => (
            <option key={s} value={s} style={{ color: "#000" }}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {/* class average ring */}
      <ClayCard tilt={false} className="flex items-center gap-5">
        <AttendanceRing percent={classAverage(subject, section)} size={96} label="class avg" />
        <div className="flex-1">
          <div className="flex items-center gap-2 role-text mb-1">
            <Users size={18} /> <span className="font-display text-sm">{section}</span>
          </div>
          <p className="text-soft text-sm mb-3">{students.length} students · {subject}</p>
          <div className="flex gap-2">
            {STATUSES.map((s) => (
              <button
                key={s.key}
                onClick={() => markAll(s.key)}
                className="text-xs px-3 py-1.5 rounded-full clay-sm focus-clay"
              >
                All {s.key}
              </button>
            ))}
          </div>
        </div>
      </ClayCard>

      {/* roster */}
      <div className="space-y-2">
        {students.map((st) => {
          const status = todayStatus(st.studentID);
          return (
            <motion.div key={st.studentID} layout className="clay-sm p-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="grid place-items-center w-9 h-9 rounded-xl text-white text-sm"
                  style={{ background: "var(--role)" }}
                >
                  {st.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div className="text-sm truncate">{st.name}</div>
              </div>
              <div className="flex gap-1.5 shrink-0">
                {STATUSES.map((s) => {
                  const Icon = s.icon;
                  const on = status === s.key;
                  return (
                    <motion.button
                      key={s.key}
                      whileTap={{ scale: 0.88 }}
                      onClick={() => {
                        setStudentStatus(st.studentID, subject, s.key);
                        pushToast({ title: `${st.name}: ${s.key}`, tone: "success" });
                      }}
                      className="grid place-items-center w-9 h-9 rounded-xl focus-clay"
                      style={
                        on
                          ? { background: s.color, boxShadow: "var(--clay-shadow-sm)" }
                          : { boxShadow: "var(--clay-pressed)", background: "var(--clay-bg)" }
                      }
                    >
                      <Icon size={16} style={{ color: on ? "#fff" : "var(--clay-text-soft)" }} />
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
