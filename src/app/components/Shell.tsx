import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  LayoutDashboard,
  CalendarCheck,
  ClipboardList,
  CalendarDays,
  Bot,
  User as UserIcon,
  Table2,
  ShieldAlert,
  Lock,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { Role } from "../data/mockData";
import { IconButton } from "./ui-kit";

import { StudentDashboard } from "./student/StudentDashboard";
import { StudentAttendance } from "./student/StudentAttendance";
import { StudentAssignments } from "./student/StudentAssignments";
import { AIAssistant } from "./student/AIAssistant";
import { EventsFeed } from "./shared/EventsFeed";
import { ProfileScreen } from "./shared/ProfileScreen";
import { TeacherDashboard } from "./teacher/TeacherDashboard";
import { ClassAttendance } from "./teacher/ClassAttendance";
import { TeacherAssignments } from "./teacher/TeacherAssignments";
import { AdminDashboard } from "./admin/AdminDashboard";
import { EventManagement } from "./admin/EventManagement";
import { UsersDirectory } from "./admin/UsersDirectory";

type Tab = {
  key: string;
  label: string;
  icon: typeof LayoutDashboard;
  render: () => JSX.Element;
  roles: Role[];
};

const ALL_TABS: Tab[] = [
  // student
  { key: "s-dash", label: "Home", icon: LayoutDashboard, render: () => <StudentDashboard />, roles: ["student"] },
  { key: "s-att", label: "Attendance", icon: CalendarCheck, render: () => <StudentAttendance />, roles: ["student"] },
  { key: "s-asg", label: "Tasks", icon: ClipboardList, render: () => <StudentAssignments />, roles: ["student"] },
  { key: "s-evt", label: "Events", icon: CalendarDays, render: () => <EventsFeed />, roles: ["student"] },
  { key: "s-ai", label: "Copilot", icon: Bot, render: () => <AIAssistant />, roles: ["student"] },
  // teacher
  { key: "t-dash", label: "Home", icon: LayoutDashboard, render: () => <TeacherDashboard />, roles: ["teacher"] },
  { key: "t-att", label: "Roster", icon: Table2, render: () => <ClassAttendance />, roles: ["teacher"] },
  { key: "t-asg", label: "Tasks", icon: ClipboardList, render: () => <TeacherAssignments />, roles: ["teacher"] },
  { key: "t-evt", label: "Events", icon: CalendarDays, render: () => <EventsFeed readOnly />, roles: ["teacher"] },
  // admin
  { key: "a-dash", label: "Home", icon: LayoutDashboard, render: () => <AdminDashboard />, roles: ["admin"] },
  { key: "a-evt", label: "Events", icon: CalendarDays, render: () => <EventManagement />, roles: ["admin"] },
  { key: "a-usr", label: "Users", icon: UserIcon, render: () => <UsersDirectory />, roles: ["admin"] },
  // shared profile
  { key: "profile", label: "Profile", icon: UserIcon, render: () => <ProfileScreen />, roles: ["student", "teacher", "admin"] },
];

function AccessRestricted({ onBack }: { onBack: () => void }) {
  return (
    <div className="min-h-[70vh] grid place-items-center p-6">
      <motion.div
        initial={{ scale: 0.85, opacity: 0, filter: "blur(8px)" }}
        animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
        className="glass p-8 max-w-sm text-center"
      >
        <div
          className="grid place-items-center w-16 h-16 rounded-3xl mx-auto mb-4"
          style={{ background: "var(--accent-coral)" }}
        >
          <ShieldAlert size={30} className="text-white" />
        </div>
        <h2 className="font-display mb-2">Access Restricted</h2>
        <p className="text-soft text-sm mb-5">
          You don't have permission to view this screen with your current role.
        </p>
        <button onClick={onBack} className="role-bg text-white px-5 py-2.5 rounded-2xl focus-clay">
          Back to my dashboard
        </button>
      </motion.div>
    </div>
  );
}

export function Shell() {
  const { currentUser } = useApp();
  const role = currentUser!.role;
  const navTabs = ALL_TABS.filter((t) => t.roles.includes(role) && t.key !== "profile");
  const homeKey = navTabs[0].key;
  const [active, setActive] = useState(homeKey);

  const activeTab = ALL_TABS.find((t) => t.key === active);
  const allowed = activeTab && activeTab.roles.includes(role);

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row">
      {/* Desktop side dock */}
      <aside className="hidden md:flex flex-col items-center gap-2 p-4 sticky top-0 h-screen">
        <div className="glass flex flex-col items-center gap-2 p-3 mt-2">
          <div className="grid place-items-center w-11 h-11 rounded-2xl role-bg text-white font-display mb-1">
            IS
          </div>
          {navTabs.map((t) => (
            <NavItem key={t.key} tab={t} active={active === t.key} onClick={() => setActive(t.key)} />
          ))}
          <div className="w-8 h-px my-1" style={{ background: "var(--clay-bg-2)" }} />
          <NavItem
            tab={ALL_TABS.find((t) => t.key === "profile")!}
            active={active === "profile"}
            onClick={() => setActive("profile")}
          />
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0 px-4 md:px-8 py-6 pb-28 md:pb-6 max-w-3xl mx-auto w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 24, z: -40, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, z: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -16, filter: "blur(6px)" }}
            transition={{ type: "spring", stiffness: 220, damping: 26 }}
            style={{ transformPerspective: 1000 }}
          >
            {allowed ? activeTab!.render() : <AccessRestricted onBack={() => setActive(homeKey)} />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile bottom dock */}
      <nav className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-40">
        <div className="glass flex items-center gap-1 px-3 py-2">
          {navTabs.map((t) => (
            <NavItem key={t.key} tab={t} active={active === t.key} onClick={() => setActive(t.key)} compact />
          ))}
          <NavItem
            tab={ALL_TABS.find((t) => t.key === "profile")!}
            active={active === "profile"}
            onClick={() => setActive("profile")}
            compact
          />
        </div>
      </nav>
    </div>
  );
}

function NavItem({
  tab,
  active,
  onClick,
  compact,
}: {
  tab: Tab;
  active: boolean;
  onClick: () => void;
  compact?: boolean;
}) {
  const Icon = tab.icon;
  return (
    <button
      onClick={onClick}
      className="relative grid place-items-center rounded-2xl focus-clay"
      style={{ width: compact ? 52 : 48, height: 48 }}
    >
      {active && (
        <motion.div
          layoutId="nav-active"
          className="absolute inset-0 rounded-2xl"
          style={{ background: "var(--role-soft)", boxShadow: "var(--clay-pressed)" }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        />
      )}
      <motion.div
        animate={active ? { scale: 1.15, y: -1 } : { scale: 1, y: 0 }}
        className="relative flex flex-col items-center"
        style={{ color: active ? "var(--role)" : "var(--clay-text-soft)" }}
      >
        <Icon size={20} strokeWidth={active ? 2.4 : 2} />
        {compact && <span style={{ fontSize: 9, marginTop: 1 }}>{tab.label}</span>}
      </motion.div>
    </button>
  );
}
