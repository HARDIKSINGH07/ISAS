import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
  ReactNode,
} from "react";
import {
  roster,
  SUBJECTS,
  uid,
  User,
  Role,
  Attendance,
  AttendanceStatus,
  Assignment,
  ChecklistItem,
  EventItem,
  RSVP,
  CURRENT_DATE,
} from "../data/mockData";

export type Toast = {
  id: string;
  title: string;
  message?: string;
  tone: "success" | "warn" | "error" | "info";
};

interface AppState {
  // auth
  currentUser: User | null;
  login: (email: string, password: string, role: Role) => Promise<boolean>;
  logout: () => void;

  // theme
  dark: boolean;
  toggleDark: () => void;

  // data
  attendance: Attendance[];
  assignments: Assignment[];
  events: EventItem[];
  rsvps: RSVP[];

  // attendance actions
  logAttendance: (subject: string, status: AttendanceStatus, studentID?: string) => void;
  setStudentStatus: (studentID: string, subject: string, status: AttendanceStatus) => void;
  attendancePercent: (studentID: string, subject?: string) => number;
  subjectStats: (studentID: string) => { subject: string; percent: number; present: number; total: number }[];
  classAverage: (subject: string, section?: string) => number;
  predictClassesNeeded: (studentID: string, subject: string, target?: number) => number;

  // assignment actions
  addAssignment: (a: Omit<Assignment, "assignmentID">) => void;
  updateAssignment: (id: string, patch: Partial<Assignment>) => void;
  deleteAssignment: (id: string) => void;
  toggleChecklist: (assignmentID: string, itemID: string) => void;
  addChecklistItem: (assignmentID: string, label: string) => void;

  // event actions
  addEvent: (e: Omit<EventItem, "eventID">) => void;
  updateEvent: (id: string, patch: Partial<EventItem>) => void;
  deleteEvent: (id: string) => void;
  toggleRsvp: (eventID: string, field: "attending" | "bookmarked") => void;
  getRsvp: (eventID: string) => RSVP | undefined;

  // toasts
  toasts: Toast[];
  pushToast: (t: Omit<Toast, "id">) => void;
  dismissToast: (id: string) => void;
}

const Ctx = createContext<AppState | null>(null);
export const useApp = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("useApp must be used within AppProvider");
  return c;
};

const API_BASE = "http://localhost:5000/api";

const getHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
});

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [dark, setDark] = useState(false);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [rsvps, setRsvps] = useState<RSVP[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  useEffect(() => {
    document.documentElement.setAttribute("data-role", currentUser?.role ?? "student");
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      Promise.all([
        fetch(`${API_BASE}/attendance`, { headers: getHeaders() }).then((r) => r.ok ? r.json() : []),
        fetch(`${API_BASE}/assignments`, { headers: getHeaders() }).then((r) => r.ok ? r.json() : []),
        fetch(`${API_BASE}/events`, { headers: getHeaders() }).then((r) => r.ok ? r.json() : []),
        fetch(`${API_BASE}/rsvps`, { headers: getHeaders() }).then((r) => r.ok ? r.json() : []),
      ])
        .then(([att, ass, ev, rs]) => {
          setAttendance(att);
          setAssignments(ass);
          setEvents(ev);
          setRsvps(rs);
        })
        .catch(console.error);
    }
  }, [currentUser]);

  const pushToast = useCallback((t: Omit<Toast, "id">) => {
    const id = uid("toast");
    setToasts((p) => [...p, { ...t, id }]);
    setTimeout(() => {
      setToasts((p) => p.filter((x) => x.id !== id));
    }, 3800);
  }, []);
  const dismissToast = useCallback((id: string) => {
    setToasts((p) => p.filter((x) => x.id !== id));
  }, []);

  const login = useCallback(
    async (email: string, password: string, role: Role) => {
      try {
        const res = await fetch(`${API_BASE}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, role }),
        });
        if (res.ok) {
          const data = await res.json();
          setCurrentUser(data.user);
          localStorage.setItem("token", data.token);
          return true;
        }
      } catch (err) {
        console.error(err);
      }
      return false;
    },
    []
  );

  const logout = useCallback(() => {
    setCurrentUser(null);
    localStorage.removeItem("token");
    setAttendance([]);
    setAssignments([]);
    setEvents([]);
    setRsvps([]);
  }, []);

  const toggleDark = useCallback(() => setDark((d) => !d), []);

  // ---------- attendance ----------
  const logAttendance = useCallback(
    async (subject: string, status: AttendanceStatus, studentID = "s1") => {
      try {
        const res = await fetch(`${API_BASE}/attendance`, {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify({ subject, status, studentID, date: CURRENT_DATE.toISOString() }),
        });
        if (res.ok) {
          const record = await res.json();
          setAttendance((p) => [...p, record]);
        }
      } catch (err) {
        console.error(err);
      }
    },
    []
  );

  const setStudentStatus = useCallback(
    async (studentID: string, subject: string, status: AttendanceStatus) => {
      try {
        const res = await fetch(`${API_BASE}/attendance/bulk`, {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify({ studentID, subject, status, date: CURRENT_DATE.toISOString() }),
        });
        if (res.ok) {
          const updated = await res.json();
          setAttendance((p) => {
            const copy = [...p];
            const idx = copy.findIndex((a) => a.attendanceID === updated.attendanceID);
            if (idx >= 0) copy[idx] = updated;
            else copy.push(updated);
            return copy;
          });
        }
      } catch (err) {
        console.error(err);
      }
    },
    []
  );

  const attendancePercent = useCallback(
    (studentID: string, subject?: string) => {
      const recs = attendance.filter(
        (a) => a.studentID === studentID && (!subject || a.subject === subject)
      );
      if (!recs.length) return 100;
      const attended = recs.filter((a) => a.status !== "Absent").length;
      return Math.round((attended / recs.length) * 100);
    },
    [attendance]
  );

  const subjectStats = useCallback(
    (studentID: string) =>
      SUBJECTS.map((subject) => {
        const recs = attendance.filter(
          (a) => a.studentID === studentID && a.subject === subject
        );
        const present = recs.filter((a) => a.status !== "Absent").length;
        return {
          subject,
          total: recs.length,
          present,
          percent: recs.length ? Math.round((present / recs.length) * 100) : 100,
        };
      }),
    [attendance]
  );

  const classAverage = useCallback(
    (subject: string, section?: string) => {
      const ids = roster
        .filter((r) => !section || r.section === section)
        .map((r) => r.studentID);
      const percents = ids.map((id) => {
        const recs = attendance.filter(
          (a) => a.studentID === id && a.subject === subject
        );
        if (!recs.length) return 100;
        const present = recs.filter((a) => a.status !== "Absent").length;
        return (present / recs.length) * 100;
      });
      if (!percents.length) return 0;
      return Math.round(percents.reduce((s, x) => s + x, 0) / percents.length);
    },
    [attendance]
  );

  const predictClassesNeeded = useCallback(
    (studentID: string, subject: string, target = 75) => {
      const recs = attendance.filter(
        (a) => a.studentID === studentID && a.subject === subject
      );
      const total = recs.length;
      const present = recs.filter((a) => a.status !== "Absent").length;
      if (total === 0) return 0;
      if ((present / total) * 100 >= target) return 0;
      let x = 0;
      while (((present + x) / (total + x)) * 100 < target && x < 200) x++;
      return x;
    },
    [attendance]
  );

  // ---------- assignments ----------
  const addAssignment = useCallback(async (a: Omit<Assignment, "assignmentID">) => {
    try {
      const res = await fetch(`${API_BASE}/assignments`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(a),
      });
      if (res.ok) {
        const record = await res.json();
        setAssignments((p) => [record, ...p]);
      }
    } catch (err) { console.error(err); }
  }, []);

  const updateAssignment = useCallback(async (id: string, patch: Partial<Assignment>) => {
    try {
      const res = await fetch(`${API_BASE}/assignments/${id}`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(patch),
      });
      if (res.ok) {
        const record = await res.json();
        setAssignments((p) => p.map((a) => (a.assignmentID === id ? record : a)));
      }
    } catch (err) { console.error(err); }
  }, []);

  const deleteAssignment = useCallback(async (id: string) => {
    try {
      const res = await fetch(`${API_BASE}/assignments/${id}`, {
        method: "DELETE",
        headers: getHeaders(),
      });
      if (res.ok) {
        setAssignments((p) => p.filter((a) => a.assignmentID !== id));
      }
    } catch (err) { console.error(err); }
  }, []);

  const toggleChecklist = useCallback(async (assignmentID: string, itemID: string) => {
    const target = assignments.find((a) => a.assignmentID === assignmentID);
    if (!target) return;
    const checklist = target.checklist.map((c) => (c.itemID === itemID ? { ...c, done: !c.done } : c));
    await updateAssignment(assignmentID, { checklist });
  }, [assignments, updateAssignment]);

  const addChecklistItem = useCallback(async (assignmentID: string, label: string) => {
    const target = assignments.find((a) => a.assignmentID === assignmentID);
    if (!target) return;
    const checklist = [...target.checklist, { itemID: uid("c"), label, done: false }];
    await updateAssignment(assignmentID, { checklist });
  }, [assignments, updateAssignment]);

  // ---------- events ----------
  const addEvent = useCallback(async (e: Omit<EventItem, "eventID">) => {
    try {
      const res = await fetch(`${API_BASE}/events`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(e),
      });
      if (res.ok) {
        const record = await res.json();
        setEvents((p) => [record, ...p]);
      }
    } catch (err) { console.error(err); }
  }, []);

  const updateEvent = useCallback(async (id: string, patch: Partial<EventItem>) => {
    try {
      const res = await fetch(`${API_BASE}/events/${id}`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(patch),
      });
      if (res.ok) {
        const record = await res.json();
        setEvents((p) => p.map((e) => (e.eventID === id ? record : e)));
      }
    } catch (err) { console.error(err); }
  }, []);

  const deleteEvent = useCallback(async (id: string) => {
    try {
      const res = await fetch(`${API_BASE}/events/${id}`, {
        method: "DELETE",
        headers: getHeaders(),
      });
      if (res.ok) {
        setEvents((p) => p.filter((e) => e.eventID !== id));
      }
    } catch (err) { console.error(err); }
  }, []);

  const toggleRsvp = useCallback(async (eventID: string, field: "attending" | "bookmarked") => {
    try {
      const existing = rsvps.find((r) => r.eventID === eventID && r.userID === currentUser?.userID);
      const updates = existing ? { [field]: !existing[field] } : { [field]: true };
      const res = await fetch(`${API_BASE}/rsvps`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ eventID, ...updates }),
      });
      if (res.ok) {
        const record = await res.json();
        setRsvps((p) => {
          const idx = p.findIndex((r) => r.eventID === record.eventID && r.userID === record.userID);
          if (idx >= 0) {
            const copy = [...p];
            copy[idx] = record;
            return copy;
          }
          return [...p, record];
        });
      }
    } catch (err) { console.error(err); }
  }, [rsvps, currentUser]);

  const getRsvp = useCallback(
    (eventID: string) => rsvps.find((r) => r.eventID === eventID && r.userID === currentUser?.userID),
    [rsvps, currentUser]
  );

  const value = useMemo<AppState>(
    () => ({
      currentUser,
      login,
      logout,
      dark,
      toggleDark,
      attendance,
      assignments,
      events,
      rsvps,
      logAttendance,
      setStudentStatus,
      attendancePercent,
      subjectStats,
      classAverage,
      predictClassesNeeded,
      addAssignment,
      updateAssignment,
      deleteAssignment,
      toggleChecklist,
      addChecklistItem,
      addEvent,
      updateEvent,
      deleteEvent,
      toggleRsvp,
      getRsvp,
      toasts,
      pushToast,
      dismissToast,
    }),
    [
      currentUser, login, logout, dark, toggleDark, attendance, assignments,
      events, rsvps, logAttendance, setStudentStatus, attendancePercent,
      subjectStats, classAverage, predictClassesNeeded, addAssignment,
      updateAssignment, deleteAssignment, toggleChecklist, addChecklistItem,
      addEvent, updateEvent, deleteEvent, toggleRsvp, getRsvp, toasts,
      pushToast, dismissToast,
    ]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
