import { useState } from "react";
import { motion } from "motion/react";
import { Moon, Sun, Bell, LogOut, Mail, BookOpen, Shield } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { ClayCard, ClayToggle, SectionTitle, ClayButton } from "../ui-kit";

export function ProfileScreen() {
  const { currentUser, dark, toggleDark, logout } = useApp();
  const [notif, setNotif] = useState(true);
  const [emailNotif, setEmailNotif] = useState(false);
  const u = currentUser!;

  const roleLabel = { student: "Student", teacher: "Teacher", admin: "Administrator" }[u.role];

  return (
    <div className="space-y-5">
      <SectionTitle sub="Manage your account & preferences">Profile</SectionTitle>

      <ClayCard tilt={false} className="flex items-center gap-4">
        <div
          className="grid place-items-center w-16 h-16 rounded-3xl font-display text-2xl text-white"
          style={{ background: "var(--role)", boxShadow: "var(--clay-shadow-sm)" }}
        >
          {u.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
        </div>
        <div className="min-w-0">
          <div className="font-display text-lg">{u.name}</div>
          <div className="flex items-center gap-1.5 text-soft text-sm">
            <Mail size={14} /> {u.email}
          </div>
          <span
            className="inline-block mt-1.5 text-xs px-2.5 py-0.5 rounded-full text-white"
            style={{ background: "var(--role)" }}
          >
            {roleLabel}
          </span>
        </div>
      </ClayCard>

      {u.enrolledSubjects && (
        <ClayCard tilt={false}>
          <div className="flex items-center gap-2 mb-3 role-text">
            <BookOpen size={18} /> <span className="font-display text-sm">Enrolled subjects</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {u.enrolledSubjects.map((s) => (
              <span key={s} className="text-sm px-3 py-1.5 rounded-full clay-inset">
                {s}
              </span>
            ))}
          </div>
        </ClayCard>
      )}
      {u.subjectsTaught && (
        <ClayCard tilt={false}>
          <div className="flex items-center gap-2 mb-3 role-text">
            <BookOpen size={18} /> <span className="font-display text-sm">Subjects taught</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {u.subjectsTaught.map((s) => (
              <span key={s} className="text-sm px-3 py-1.5 rounded-full clay-inset">
                {s}
              </span>
            ))}
          </div>
        </ClayCard>
      )}

      <ClayCard tilt={false}>
        <div className="font-display text-sm mb-3">Preferences</div>
        <SettingRow icon={dark ? Moon : Sun} label="Dark mode">
          <ClayToggle checked={dark} onChange={toggleDark} />
        </SettingRow>
        <div className="h-px my-3" style={{ background: "var(--clay-bg-2)" }} />
        <SettingRow icon={Bell} label="Push notifications">
          <ClayToggle checked={notif} onChange={setNotif} />
        </SettingRow>
        <div className="h-px my-3" style={{ background: "var(--clay-bg-2)" }} />
        <SettingRow icon={Mail} label="Email digests">
          <ClayToggle checked={emailNotif} onChange={setEmailNotif} />
        </SettingRow>
      </ClayCard>

      <ClayCard tilt={false}>
        <div className="flex items-center gap-2 text-soft text-sm mb-3">
          <Shield size={16} /> Signed in securely as {roleLabel.toLowerCase()}
        </div>
        <ClayButton
          variant="ghost"
          className="w-full"
          onClick={logout}
        >
          <LogOut size={16} style={{ color: "var(--accent-coral)" }} />
          <span style={{ color: "var(--accent-coral)" }}>Log out</span>
        </ClayButton>
      </ClayCard>
    </div>
  );
}

function SettingRow({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof Moon;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span className="grid place-items-center w-9 h-9 rounded-xl clay-inset role-text">
          <Icon size={17} />
        </span>
        <span className="text-sm">{label}</span>
      </div>
      {children}
    </div>
  );
}
