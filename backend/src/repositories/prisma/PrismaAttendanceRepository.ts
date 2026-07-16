import { prisma } from "./prismaClient";
import { IAttendanceRepository } from "../interfaces";
import { Attendance } from "../../models";

export class PrismaAttendanceRepository implements IAttendanceRepository {
  async findByStudent(studentID: string): Promise<Attendance[]> {
    const records = await prisma.attendance.findMany({
      where: { studentID, isDeleted: false },
    });
    return records as Attendance[];
  }

  async findBySubject(subject: string): Promise<Attendance[]> {
    const records = await prisma.attendance.findMany({
      where: { subject, isDeleted: false },
    });
    return records as Attendance[];
  }

  async findByStudentAndSubject(studentID: string, subject: string): Promise<Attendance[]> {
    const records = await prisma.attendance.findMany({
      where: { studentID, subject, isDeleted: false },
    });
    return records as Attendance[];
  }

  async create(attendance: Attendance): Promise<Attendance> {
    const record = await prisma.attendance.create({
      data: attendance,
    });
    return record as Attendance;
  }

  async update(attendanceID: string, updates: Partial<Attendance>): Promise<Attendance | null> {
    try {
      const record = await prisma.attendance.update({
        where: { attendanceID },
        data: updates,
      });
      return record as Attendance;
    } catch {
      return null;
    }
  }

  async findAll(): Promise<Attendance[]> {
    const records = await prisma.attendance.findMany({
      where: { isDeleted: false },
    });
    return records as Attendance[];
  }

  async findByStudentSubjectAndDate(studentID: string, subject: string, dateStr: string): Promise<Attendance | null> {
    const records = await prisma.attendance.findMany({
      where: { studentID, subject, isDeleted: false },
    });
    
    const dStr = new Date(dateStr).toDateString();
    const match = records.find((r: Attendance) => new Date(r.date).toDateString() === dStr);
    
    return match ? (match as Attendance) : null;
  }
}
