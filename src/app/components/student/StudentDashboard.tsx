import { motion } from "motion/react";
import { CalendarCheck, ClipboardList, CalendarDays, Bot, TrendingUp, Flame } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { ClayCard, AttendanceRing, StatusPill, SectionTitle } from "../ui-kit";
import { relativeDeadline, isOverdue, fmtDateTime } from "../../utils/format";

export function StudentDashboard() {
  const { currentUser, attendancePercent, assignments, events, subjectStats } = useApp();
  const overall = attendancePercent("s1");
  const myAssignments = assignments.filter(
    (a) => a.createdBy === "s1" || a.createdBy === "t1"
  );
  const pending = myAssignments.filter((a) => !a.completed);
  const nextDeadline = [...pending].sort(
    (a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
  )[0];
  const upcomingEvent = [...events]
    .filter((e) => e.published)
    .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime())[0];
  const atRisk = subjectStats("s1").filter((s) => s.percent < 75);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-soft text-sm">Welcome back,</p>
          <h1 className="font-display">{currentUser!.name.split(" ")[0]} 👋</h1>
        </div>
        <div className="clay-sm px-3 py-2 flex items-center gap-2">
          <Flame size={18} style={{ color: "var(--accent-amber)" }} />
          <span className="font-display text-sm">7-day streak</span>
        </div>
      </div>

      {/* Attendance hero */}
      <ClayCard className="flex items-center gap-5">
        <AttendanceRing percent={overall} size={110} label="overall" />
        <div className="min-w-0">
          <SectionTitle sub="Across all subjects">Attendance</SectionTitle>
          {atRisk.length > 0 ? (
            <p className="text-sm mt-2" style={{ color: "var(--accent-coral)" }}>
              ⚠ {atRisk.length} subject{atRisk.length > 1 ? "s" : ""} below 75%
            </p>
          ) : (
            <p className="text-sm mt-2" style={{ color: "var(--accent-mint)" }}>
              ✓ You're on track everywhere
            </p>
          )}
          <div className="flex items-center gap-1.5 mt-2 text-soft text-sm">
            <TrendingUp size={15} /> Keep it above 75% to stay eligible
          </div>
        </div>
      </ClayCard>

      <div className="grid sm:grid-cols-2 gap-4">
        {/* Next deadline */}
        <ClayCard>
          <div className="flex items-center gap-2 mb-3 role-text">
            <ClipboardList size={18} />
            <span className="font-display text-sm">Next deadline</span>
          </div>
          {nextDeadline ? (
            <>
              <div className="font-display">{nextDeadline.title}</div>
              <div className="text-soft text-sm">{nextDeadline.subject}</div>
              <div className="mt-2">
                <StatusPill status={isOverdue(nextDeadline.deadline, false) ? "overdue" : "pending"} />
                <span className="text-soft text-sm ml-2">
                  {relativeDeadline(nextDeadline.deadline)}
                </span>
              </div>
            </>
          ) : (
            <p className="text-soft text-sm">All caught up! 🎉</p>
          )}
        </ClayCard>

        {/* Upcoming event */}
        <ClayCard>
          <div className="flex items-center gap-2 mb-3 role-text">
            <CalendarDays size={18} />
            <span className="font-display text-sm">Upcoming event</span>
          </div>
          {upcomingEvent ? (
            <>
              <div className="font-display">{upcomingEvent.title}</div>
              <div className="text-soft text-sm">{upcomingEvent.venue}</div>
              <div className="text-soft text-sm mt-2">{fmtDateTime(upcomingEvent.dateTime)}</div>
            </>
          ) : (
            <p className="text-soft text-sm">No events yet</p>
          )}
        </ClayCard>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-4">
        <StatMini icon={CalendarCheck} label="Subjects" value={String(subjectStats("s1").length)} />
        <StatMini icon={ClipboardList} label="Pending" value={String(pending.length)} />
        <StatMini icon={CalendarDays} label="Events" value={String(events.filter((e) => e.published).length)} />
      </div>

      {/* AI quick access */}
      <motion.div whileHover={{ y: -4 }} className="glass p-5 flex items-center gap-4">
        <div className="grid place-items-center w-12 h-12 rounded-2xl role-bg">
          <Bot className="text-white" size={24} />
        </div>
        <div className="min-w-0">
          <div className="font-display">Ask Campus Copilot</div>
          <p className="text-soft text-sm truncate">
            "What's my lowest attendance subject?"
          </p>
        </div>
      </motion.div>
    </div>
  );
}

function StatMini({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof CalendarCheck;
  label: string;
  value: string;
}) {
  return (
    <div className="clay-sm p-4 text-center">
      <Icon size={20} className="mx-auto role-text mb-1" />
      <div className="font-display text-xl">{value}</div>
      <div className="text-soft text-xs">{label}</div>
    </div>
  );
}
