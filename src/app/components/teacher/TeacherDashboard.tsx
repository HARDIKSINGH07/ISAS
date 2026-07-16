import { BookOpen, AlertTriangle, ClipboardCheck, Users } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { roster } from "../../data/mockData";
import { ClayCard, AttendanceRing, SectionTitle, StatusPill } from "../ui-kit";

export function TeacherDashboard() {
  const { currentUser, classAverage, attendancePercent, assignments } = useApp();
  const subjects = currentUser!.subjectsTaught ?? [];

  // students below threshold across taught subjects
  const alerts: { name: string; subject: string; percent: number }[] = [];
  subjects.forEach((subject) => {
    roster.forEach((r) => {
      const p = attendancePercent(r.studentID, subject);
      if (p < 75) alerts.push({ name: r.name, subject, percent: p });
    });
  });

  const pendingGrading = assignments.filter(
    (a) => a.createdBy === "t1" && !a.completed
  );

  return (
    <div className="space-y-5">
      <div>
        <p className="text-soft text-sm">Faculty dashboard</p>
        <h1 className="font-display">{currentUser!.name}</h1>
      </div>

      {/* My subjects */}
      <SectionTitle sub="Class-average attendance">My Subjects</SectionTitle>
      <div className="grid sm:grid-cols-2 gap-4">
        {subjects.map((s) => (
          <ClayCard key={s} className="flex items-center gap-4">
            <AttendanceRing percent={classAverage(s)} size={72} label="class avg" />
            <div className="min-w-0">
              <div className="flex items-center gap-2 role-text mb-1">
                <BookOpen size={16} />
                <span className="font-display text-sm truncate">{s}</span>
              </div>
              <div className="text-soft text-sm">{roster.length} students</div>
            </div>
          </ClayCard>
        ))}
      </div>

      {/* Risk alerts */}
      <ClayCard tilt={false}>
        <div className="flex items-center gap-2 mb-3" style={{ color: "var(--accent-coral)" }}>
          <AlertTriangle size={18} />
          <span className="font-display text-sm">Attendance below threshold</span>
        </div>
        {alerts.length === 0 ? (
          <p className="text-soft text-sm">All students are above 75%. 🎉</p>
        ) : (
          <div className="space-y-2">
            {alerts.slice(0, 6).map((a, i) => (
              <div key={i} className="flex items-center justify-between clay-inset px-3 py-2 rounded-xl">
                <div>
                  <div className="text-sm">{a.name}</div>
                  <div className="text-soft text-xs">{a.subject}</div>
                </div>
                <span className="font-display text-sm" style={{ color: "var(--accent-coral)" }}>
                  {a.percent}%
                </span>
              </div>
            ))}
          </div>
        )}
      </ClayCard>

      {/* Pending items */}
      <div className="grid grid-cols-2 gap-4">
        <ClayCard>
          <ClipboardCheck size={20} className="role-text mb-2" />
          <div className="font-display text-xl">{pendingGrading.length}</div>
          <div className="text-soft text-xs">Open assignments</div>
        </ClayCard>
        <ClayCard>
          <Users size={20} className="role-text mb-2" />
          <div className="font-display text-xl">{roster.length}</div>
          <div className="text-soft text-xs">Students</div>
        </ClayCard>
      </div>
    </div>
  );
}
