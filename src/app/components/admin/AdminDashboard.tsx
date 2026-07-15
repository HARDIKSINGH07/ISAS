import {
  BarChart,
  Bar,
  ResponsiveContainer,
  XAxis,
  Tooltip,
  Cell,
} from "recharts";
import { Users, CalendarDays, GraduationCap, Activity } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { roster, users } from "../../data/mockData";
import { ClayCard, SectionTitle } from "../ui-kit";

export function AdminDashboard() {
  const { currentUser, events } = useApp();
  const published = events.filter((e) => e.published);

  const byCat = ["Workshop", "Hackathon", "Seminar"].map((c) => ({
    name: c,
    value: events.filter((e) => e.category === c).length,
  }));
  const colors = ["var(--accent-peri)", "var(--accent-coral)", "var(--accent-mint)"];

  const totalStudents = roster.length;
  const totalTeachers = users.filter((u) => u.role === "teacher").length;

  return (
    <div className="space-y-5">
      <div>
        <p className="text-soft text-sm">Platform oversight</p>
        <h1 className="font-display">{currentUser!.name}</h1>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <StatCard icon={GraduationCap} value={totalStudents} label="Students" />
        <StatCard icon={Users} value={totalTeachers} label="Teachers" />
        <StatCard icon={CalendarDays} value={published.length} label="Live events" />
        <StatCard icon={Activity} value={"92%"} label="Engagement" />
      </div>

      <ClayCard tilt={false}>
        <SectionTitle sub="Distribution by category">Events snapshot</SectionTitle>
        <div className="h-48 mt-3">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={byCat} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--clay-text-soft)" }} />
              <Tooltip
                cursor={{ fill: "var(--clay-bg-2)", radius: 8 }}
                contentStyle={{
                  borderRadius: 16,
                  border: "none",
                  background: "var(--clay-surface)",
                  boxShadow: "var(--clay-shadow-sm)",
                  color: "var(--clay-text)",
                }}
              />
              <Bar dataKey="value" radius={[10, 10, 10, 10]} animationDuration={700}>
                {byCat.map((_, i) => (
                  <Cell key={i} fill={colors[i]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ClayCard>

      <ClayCard tilt={false}>
        <div className="font-display text-sm mb-3">Recent activity</div>
        <div className="space-y-2">
          {published.slice(0, 4).map((e) => (
            <div key={e.eventID} className="flex items-center justify-between clay-inset px-3 py-2 rounded-xl">
              <div className="text-sm">{e.title}</div>
              <span className="text-soft text-xs">{e.category}</span>
            </div>
          ))}
        </div>
      </ClayCard>
    </div>
  );
}

function StatCard({
  icon: Icon,
  value,
  label,
}: {
  icon: typeof Users;
  value: string | number;
  label: string;
}) {
  return (
    <ClayCard>
      <div
        className="grid place-items-center w-11 h-11 rounded-2xl mb-3"
        style={{ background: "var(--role)" }}
      >
        <Icon size={20} className="text-white" />
      </div>
      <div className="font-display text-2xl">{value}</div>
      <div className="text-soft text-sm">{label}</div>
    </ClayCard>
  );
}
