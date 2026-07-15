import {
  User,
  Attendance,
  Assignment,
  EventItem,
  RSVP,
  Role,
} from "../../models";

export interface IUserRepository {
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  findAll(): Promise<User[]>;
  findByRole(role: Role): Promise<User[]>;
}

export interface IAttendanceRepository {
  findByStudent(studentID: string): Promise<Attendance[]>;
  findBySubject(subject: string): Promise<Attendance[]>;
  findByStudentAndSubject(studentID: string, subject: string): Promise<Attendance[]>;
  create(attendance: Attendance): Promise<Attendance>;
  update(attendanceID: string, updates: Partial<Attendance>): Promise<Attendance | null>;
  findAll(): Promise<Attendance[]>;
  findByStudentSubjectAndDate(studentID: string, subject: string, date: string): Promise<Attendance | null>;
}

export interface IAssignmentRepository {
  findById(id: string): Promise<Assignment | null>;
  findByCreator(creatorID: string): Promise<Assignment[]>;
  findAll(): Promise<Assignment[]>;
  create(assignment: Assignment): Promise<Assignment>;
  update(id: string, updates: Partial<Assignment>): Promise<Assignment | null>;
  delete(id: string): Promise<boolean>;
}

export interface IEventRepository {
  findById(id: string): Promise<EventItem | null>;
  findAll(): Promise<EventItem[]>;
  findPublished(): Promise<EventItem[]>;
  create(event: EventItem): Promise<EventItem>;
  update(id: string, updates: Partial<EventItem>): Promise<EventItem | null>;
  delete(id: string): Promise<boolean>;
}

export interface IRsvpRepository {
  findByUserAndEvent(userID: string, eventID: string): Promise<RSVP | null>;
  findByUser(userID: string): Promise<RSVP[]>;
  create(rsvp: RSVP): Promise<RSVP>;
  update(userID: string, eventID: string, updates: Partial<RSVP>): Promise<RSVP | null>;
}
