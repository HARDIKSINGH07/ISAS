import {
  IUserRepository,
  IAttendanceRepository,
  IAssignmentRepository,
  IEventRepository,
  IRsvpRepository,
} from "../interfaces";
import {
  User,
  Attendance,
  Assignment,
  EventItem,
  RSVP,
  Role,
} from "../../models";
import { users, attendance, assignments, events, rsvps } from "../../seed";

export class InMemoryUserRepository implements IUserRepository {
  private users: User[] = [...users];

  async findByEmail(email: string): Promise<User | null> {
    return this.users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
  }
  async findById(id: string): Promise<User | null> {
    return this.users.find((u) => u.userID === id) || null;
  }
  async findAll(): Promise<User[]> {
    return this.users;
  }
  async findByRole(role: Role): Promise<User[]> {
    return this.users.filter((u) => u.role === role);
  }
}

export class InMemoryAttendanceRepository implements IAttendanceRepository {
  private attendance: Attendance[] = [...attendance];

  async findByStudent(studentID: string): Promise<Attendance[]> {
    return this.attendance.filter((a) => a.studentID === studentID);
  }
  async findBySubject(subject: string): Promise<Attendance[]> {
    return this.attendance.filter((a) => a.subject === subject);
  }
  async findByStudentAndSubject(studentID: string, subject: string): Promise<Attendance[]> {
    return this.attendance.filter((a) => a.studentID === studentID && a.subject === subject);
  }
  async create(record: Attendance): Promise<Attendance> {
    this.attendance.push(record);
    return record;
  }
  async update(attendanceID: string, updates: Partial<Attendance>): Promise<Attendance | null> {
    const idx = this.attendance.findIndex((a) => a.attendanceID === attendanceID);
    if (idx === -1) return null;
    this.attendance[idx] = { ...this.attendance[idx], ...updates };
    return this.attendance[idx];
  }
  async findAll(): Promise<Attendance[]> {
    return this.attendance;
  }
  async findByStudentSubjectAndDate(studentID: string, subject: string, dateString: string): Promise<Attendance | null> {
    return this.attendance.find(
      (a) =>
        a.studentID === studentID &&
        a.subject === subject &&
        new Date(a.date).toDateString() === new Date(dateString).toDateString()
    ) || null;
  }
}

export class InMemoryAssignmentRepository implements IAssignmentRepository {
  private assignments: Assignment[] = [...assignments];

  async findById(id: string): Promise<Assignment | null> {
    return this.assignments.find((a) => a.assignmentID === id) || null;
  }
  async findByCreator(creatorID: string): Promise<Assignment[]> {
    return this.assignments.filter((a) => a.createdBy === creatorID);
  }
  async findAll(): Promise<Assignment[]> {
    return this.assignments;
  }
  async create(record: Assignment): Promise<Assignment> {
    this.assignments.unshift(record);
    return record;
  }
  async update(id: string, updates: Partial<Assignment>): Promise<Assignment | null> {
    const idx = this.assignments.findIndex((a) => a.assignmentID === id);
    if (idx === -1) return null;
    this.assignments[idx] = { ...this.assignments[idx], ...updates };
    return this.assignments[idx];
  }
  async delete(id: string): Promise<boolean> {
    const idx = this.assignments.findIndex((a) => a.assignmentID === id);
    if (idx === -1) return false;
    this.assignments.splice(idx, 1);
    return true;
  }
}

export class InMemoryEventRepository implements IEventRepository {
  private events: EventItem[] = [...events];

  async findById(id: string): Promise<EventItem | null> {
    return this.events.find((e) => e.eventID === id) || null;
  }
  async findAll(): Promise<EventItem[]> {
    return this.events;
  }
  async findPublished(): Promise<EventItem[]> {
    return this.events.filter((e) => e.published);
  }
  async create(record: EventItem): Promise<EventItem> {
    this.events.unshift(record);
    return record;
  }
  async update(id: string, updates: Partial<EventItem>): Promise<EventItem | null> {
    const idx = this.events.findIndex((e) => e.eventID === id);
    if (idx === -1) return null;
    this.events[idx] = { ...this.events[idx], ...updates };
    return this.events[idx];
  }
  async delete(id: string): Promise<boolean> {
    const idx = this.events.findIndex((e) => e.eventID === id);
    if (idx === -1) return false;
    this.events.splice(idx, 1);
    return true;
  }
}

export class InMemoryRsvpRepository implements IRsvpRepository {
  private rsvps: RSVP[] = [...rsvps];

  async findByUserAndEvent(userID: string, eventID: string): Promise<RSVP | null> {
    return this.rsvps.find((r) => r.userID === userID && r.eventID === eventID) || null;
  }
  async findByUser(userID: string): Promise<RSVP[]> {
    return this.rsvps.filter((r) => r.userID === userID);
  }
  async create(record: RSVP): Promise<RSVP> {
    this.rsvps.push(record);
    return record;
  }
  async update(userID: string, eventID: string, updates: Partial<RSVP>): Promise<RSVP | null> {
    const idx = this.rsvps.findIndex((r) => r.userID === userID && r.eventID === eventID);
    if (idx === -1) return null;
    this.rsvps[idx] = { ...this.rsvps[idx], ...updates };
    return this.rsvps[idx];
  }
}

export const repositories = {
  users: new InMemoryUserRepository(),
  attendance: new InMemoryAttendanceRepository(),
  assignments: new InMemoryAssignmentRepository(),
  events: new InMemoryEventRepository(),
  rsvps: new InMemoryRsvpRepository(),
};
