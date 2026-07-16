export type Role = "student" | "teacher" | "admin";
export type AttendanceStatus = "Present" | "Absent" | "Late";
export type EventCategory = "Workshop" | "Hackathon" | "Seminar";

export interface User {
  userID: string;
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
  enrolledSubjects?: string[];
  subjectsTaught?: string[];
  section?: string;
}

export interface Attendance {
  attendanceID: string;
  studentID: string;
  subject: string;
  date: string;
  status: AttendanceStatus;
  markedBy: string;
}

export interface ChecklistItem {
  itemID: string;
  label: string;
  done: boolean;
}

export interface Assignment {
  assignmentID: string;
  title: string;
  subject: string;
  description: string;
  deadline: string;
  completed: boolean;
  createdBy: string;
  checklist: ChecklistItem[];
}

export interface EventItem {
  eventID: string;
  title: string;
  dateTime: string;
  venue: string;
  category: EventCategory;
  description: string;
  createdByAdminID: string;
  published: boolean;
}

export interface RSVP {
  userID: string;
  eventID: string;
  bookmarked: boolean;
  attending: boolean;
}

export interface AIQuery {
  queryID: string;
  userID: string;
  inputText: string;
  inputType: "text" | "voice";
  responseText: string;
  timestamp: string;
}

export interface RosterStudent {
  studentID: string;
  name: string;
  section: string;
}
