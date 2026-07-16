import bcrypt from "bcryptjs";
import { User, Attendance, Assignment, EventItem, RSVP, RosterStudent, AttendanceStatus } from "../models";

export const SUBJECTS = [
  "Data Structures",
  "Operating Systems",
  "Database Systems",
  "Computer Networks",
  "Web Engineering",
];

export const SECTIONS = ["CS-3A", "CS-3B"];
export const CURRENT_DATE = new Date("2026-07-13T09:00:00");

let counter = 1000;
export const uid = (prefix = "id") => `${prefix}${counter++}`;

const hash = (pass: string) => bcrypt.hashSync(pass, 10);

export const users: User[] = [
  {
    userID: "s1",
    name: "Aarav Mehta",
    email: "aarav@student.isas.edu",
    passwordHash: hash("student123"),
    role: "student",
    section: "CS-3A",
    enrolledSubjects: SUBJECTS,
  },
  {
    userID: "t1",
    name: "Dr. Neha Kapoor",
    email: "neha@faculty.isas.edu",
    passwordHash: hash("teacher123"),
    role: "teacher",
    subjectsTaught: ["Data Structures", "Operating Systems"],
  },
  {
    userID: "a1",
    name: "Rohan Verma",
    email: "rohan@admin.isas.edu",
    passwordHash: hash("admin123"),
    role: "admin",
  },
];

export const roster: RosterStudent[] = [
  { studentID: "s1", name: "Aarav Mehta", section: "CS-3A" },
  { studentID: "s2", name: "Diya Sharma", section: "CS-3A" },
  { studentID: "s3", name: "Kabir Singh", section: "CS-3A" },
  { studentID: "s4", name: "Isha Nair", section: "CS-3B" },
  { studentID: "s5", name: "Vivaan Rao", section: "CS-3B" },
  { studentID: "s6", name: "Anaya Gupta", section: "CS-3B" },
];

function seedAttendance(): Attendance[] {
  const out: Attendance[] = [];
  let id = 0;
  const today = new Date("2026-07-13");
  // student s1 own record
  SUBJECTS.forEach((subject, sIdx) => {
    const total = 20;
    // vary attendance so Data Structures dips below 75%
    const absentEvery = sIdx === 0 ? 3 : sIdx === 1 ? 6 : 8;
    for (let i = total; i > 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i * 2);
      let status: AttendanceStatus = "Present";
      if (i % absentEvery === 0) status = "Absent";
      else if (i % 5 === 0) status = "Late";
      out.push({
        attendanceID: `att${id++}`,
        studentID: "s1",
        subject,
        date: d.toISOString(),
        status,
        markedBy: "s1",
      });
    }
  });
  // roster students for Data Structures & Operating Systems (teacher subjects)
  ["Data Structures", "Operating Systems"].forEach((subject) => {
    roster.forEach((r, ri) => {
      if (r.studentID === "s1") return;
      const total = 20;
      const absentEvery = 2 + (ri % 4);
      for (let i = total; i > 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i * 2);
        let status: AttendanceStatus = "Present";
        if (i % absentEvery === 0) status = "Absent";
        else if (i % 6 === 0) status = "Late";
        out.push({
          attendanceID: `att${id++}`,
          studentID: r.studentID,
          subject,
          date: d.toISOString(),
          status,
          markedBy: "t1",
        });
      }
    });
  });
  return out;
}

export const attendance: Attendance[] = seedAttendance();

export const assignments: Assignment[] = [
  {
    assignmentID: "as1",
    title: "AVL Tree Rotations",
    subject: "Data Structures",
    description: "Implement insert with balancing and write test cases.",
    deadline: "2026-07-16T23:59:00",
    completed: false,
    createdBy: "t1",
    checklist: [
      { itemID: "c1", label: "Read chapter 6", done: true },
      { itemID: "c2", label: "Code rotations", done: false },
      { itemID: "c3", label: "Write tests", done: false },
    ],
  },
  {
    assignmentID: "as2",
    title: "CPU Scheduling Report",
    subject: "Operating Systems",
    description: "Compare FCFS, SJF and Round Robin with Gantt charts.",
    deadline: "2026-07-11T23:59:00",
    completed: false,
    createdBy: "t1",
    checklist: [
      { itemID: "c4", label: "Draw Gantt charts", done: true },
      { itemID: "c5", label: "Compute averages", done: false },
    ],
  },
  {
    assignmentID: "as3",
    title: "Normalization Exercise",
    subject: "Database Systems",
    description: "Normalize the given schema to 3NF.",
    deadline: "2026-07-20T23:59:00",
    completed: true,
    createdBy: "s1",
    checklist: [{ itemID: "c6", label: "Identify FDs", done: true }],
  },
  {
    assignmentID: "as4",
    title: "Portfolio Website",
    subject: "Web Engineering",
    description: "Personal responsive portfolio using React.",
    deadline: "2026-07-25T23:59:00",
    completed: false,
    createdBy: "s1",
    checklist: [],
  },
];

export const events: EventItem[] = [
  {
    eventID: "e1",
    title: "AI & ML Bootcamp",
    dateTime: "2026-07-18T10:00:00",
    venue: "Innovation Lab, Block C",
    category: "Workshop",
    description: "Hands-on intro to model building with real datasets.",
    createdByAdminID: "a1",
    published: true,
  },
  {
    eventID: "e2",
    title: "HackTheCampus 24h",
    dateTime: "2026-07-22T09:00:00",
    venue: "Central Auditorium",
    category: "Hackathon",
    description: "Overnight hackathon with mentors and prizes.",
    createdByAdminID: "a1",
    published: true,
  },
  {
    eventID: "e3",
    title: "Careers in Cloud",
    dateTime: "2026-07-15T14:00:00",
    venue: "Seminar Hall 2",
    category: "Seminar",
    description: "Industry panel on cloud engineering careers.",
    createdByAdminID: "a1",
    published: true,
  },
  {
    eventID: "e4",
    title: "UI/UX Design Sprint",
    dateTime: "2026-07-28T11:00:00",
    venue: "Design Studio",
    category: "Workshop",
    description: "Rapid prototyping and usability testing sprint.",
    createdByAdminID: "a1",
    published: true,
  },
];

export const rsvps: RSVP[] = [
  { userID: "s1", eventID: "e1", bookmarked: true, attending: false },
];
