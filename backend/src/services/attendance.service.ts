import { repositories } from "../repositories";
import { generateId } from "../utils";
import { AttendanceStatus } from "../models";
import { SUBJECTS, roster } from "../seed";

export class AttendanceService {
  private attRepo = repositories.attendance;

  async logAttendance(studentID: string, subject: string, status: AttendanceStatus, markedBy: string) {
    return await this.attRepo.create({
      attendanceID: generateId("att"),
      studentID,
      subject,
      date: new Date().toISOString(),
      status,
      markedBy,
    });
  }

  async setStudentStatus(studentID: string, subject: string, status: AttendanceStatus, markedBy: string) {
    const today = new Date().toISOString();
    const existing = await this.attRepo.findByStudentSubjectAndDate(studentID, subject, today);
    if (existing) {
      return await this.attRepo.update(existing.attendanceID, { status, markedBy });
    }
    return await this.attRepo.create({
      attendanceID: generateId("att"),
      studentID,
      subject,
      date: today,
      status,
      markedBy,
    });
  }

  async getAttendancePercent(studentID: string, subject?: string) {
    let recs = await this.attRepo.findByStudent(studentID);
    if (subject) {
      recs = recs.filter((a) => a.subject === subject);
    }
    if (!recs.length) return 100;
    const attended = recs.filter((a) => a.status !== "Absent").length;
    return Math.round((attended / recs.length) * 100);
  }

  async getSubjectStats(studentID: string) {
    const recs = await this.attRepo.findByStudent(studentID);
    return SUBJECTS.map((subject) => {
      const subjectRecs = recs.filter((a) => a.subject === subject);
      const present = subjectRecs.filter((a) => a.status !== "Absent").length;
      return {
        subject,
        total: subjectRecs.length,
        present,
        percent: subjectRecs.length ? Math.round((present / subjectRecs.length) * 100) : 100,
      };
    });
  }

  async getClassAverage(subject: string, section?: string) {
    const ids = roster
      .filter((r) => !section || r.section === section)
      .map((r) => r.studentID);
    
    const allRecs = await this.attRepo.findBySubject(subject);
    const percents = ids.map((id) => {
      const recs = allRecs.filter((a) => a.studentID === id);
      if (!recs.length) return 100;
      const present = recs.filter((a) => a.status !== "Absent").length;
      return (present / recs.length) * 100;
    });

    if (!percents.length) return 0;
    return Math.round(percents.reduce((s, x) => s + x, 0) / percents.length);
  }

  async predictClassesNeeded(studentID: string, subject: string, target = 75) {
    const recs = await this.attRepo.findByStudentAndSubject(studentID, subject);
    const total = recs.length;
    const present = recs.filter((a) => a.status !== "Absent").length;
    
    if (total === 0) return 0;
    if ((present / total) * 100 >= target) return 0;
    
    let x = 0;
    while (((present + x) / (total + x)) * 100 < target && x < 200) x++;
    return x;
  }
}

export const attendanceService = new AttendanceService();
