import { useState } from "react";
import { Search, GraduationCap, Users as UsersIcon } from "lucide-react";
import { roster, users } from "../../data/mockData";
import { useApp } from "../../context/AppContext";
import { ClayCard, SectionTitle, ClayInput } from "../ui-kit";

export function UsersDirectory() {
  const { attendancePercent } = useApp();
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<"students" | "teachers">("students");

  const teachers = users.filter((u) => u.role === "teacher");

  const filteredStudents = roster.filter((r) =>
    r.name.toLowerCase().includes(query.toLowerCase())
  );
  const filteredTeachers = teachers.filter((t) =>
    t.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <SectionTitle sub="Read-only directory of platform users">Users</SectionTitle>

      <div className="clay-sm flex p-1 rounded-2xl">
        {(["students", "teachers"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="flex-1 py-2.5 rounded-xl text-sm capitalize focus-clay flex items-center justify-center gap-2"
            style={tab === t ? { boxShadow: "var(--clay-pressed)", color: "var(--role)" } : undefined}
          >
            {t === "students" ? <GraduationCap size={16} /> : <UsersIcon size={16} />}
            {t}
          </button>
        ))}
      </div>

      <div className="relative">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-soft" />
        <ClayInput className="pl-11" placeholder="Search users…" value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>

      <div className="space-y-2">
        {tab === "students"
          ? filteredStudents.map((s) => {
              const pct = attendancePercent(s.studentID);
              return (
                <ClayCard key={s.studentID} tilt={false} className="flex items-center justify-between !p-4">
                  <div className="flex items-center gap-3">
                    <div className="grid place-items-center w-10 h-10 rounded-xl text-white text-sm" style={{ background: "var(--role)" }}>
                      {s.name.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div>
                      <div className="text-sm">{s.name}</div>
                      <div className="text-soft text-xs">Section {s.section}</div>
                    </div>
                  </div>
                  <span
                    className="font-display text-sm"
                    style={{ color: pct < 75 ? "var(--accent-coral)" : "var(--accent-mint)" }}
                  >
                    {pct}%
                  </span>
                </ClayCard>
              );
            })
          : filteredTeachers.map((t) => (
              <ClayCard key={t.userID} tilt={false} className="flex items-center justify-between !p-4">
                <div className="flex items-center gap-3">
                  <div className="grid place-items-center w-10 h-10 rounded-xl text-white text-sm" style={{ background: "var(--role)" }}>
                    {t.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                  </div>
                  <div>
                    <div className="text-sm">{t.name}</div>
                    <div className="text-soft text-xs">{t.email}</div>
                  </div>
                </div>
                <span className="text-soft text-xs">{t.subjectsTaught?.length ?? 0} subjects</span>
              </ClayCard>
            ))}
      </div>
    </div>
  );
}
