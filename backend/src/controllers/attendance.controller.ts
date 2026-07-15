import { Request, Response, NextFunction } from "express";
import { attendanceService } from "../services/attendance.service";
import { AuthRequest } from "../middleware/auth.middleware";
import { repositories } from "../repositories";

export const getAttendance = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const studentID = req.query.studentID as string;
    const subject = req.query.subject as string;
    
    let records = await repositories.attendance.findAll();
    
    if (studentID) {
      records = records.filter((r) => r.studentID === studentID);
    }
    
    if (subject) {
      records = records.filter((r) => r.subject === subject);
    }
    
    // For students, they can only see their own attendance
    if (req.user!.role === "student") {
      records = records.filter((r) => r.studentID === req.user!.userID);
    }
    
    res.json(records);
  } catch (error) {
    next(error);
  }
};

export const logAttendance = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { subject, status } = req.body;
    const studentID = req.user!.userID; // self-log
    
    const record = await attendanceService.logAttendance(studentID, subject, status, studentID);
    res.status(201).json(record);
  } catch (error) {
    next(error);
  }
};

export const markAttendance = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { studentID, subject, status } = req.body;
    const teacherID = req.user!.userID;
    
    const record = await attendanceService.setStudentStatus(studentID, subject, status, teacherID);
    res.json(record);
  } catch (error) {
    next(error);
  }
};

export const getSubjectStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const studentID = req.params.studentID as string;
    
    // Auth check: students can only see their own stats
    if (req.user!.role === "student" && req.user!.userID !== studentID) {
      return res.status(403).json({ error: "Access denied" });
    }
    
    const stats = await attendanceService.getSubjectStats(studentID);
    res.json(stats);
  } catch (error) {
    next(error);
  }
};

export const getClassAverage = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const subject = req.query.subject as string;
    const section = req.query.section as string | undefined;
    
    if (!subject) return res.status(400).json({ error: "subject query parameter is required" });
    
    const average = await attendanceService.getClassAverage(subject, section);
    res.json({ average });
  } catch (error) {
    next(error);
  }
};

export const predictClasses = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const studentID = req.params.studentID as string;
    const subject = req.query.subject as string;
    
    if (!subject) return res.status(400).json({ error: "subject query parameter is required" });
    
    if (req.user!.role === "student" && req.user!.userID !== studentID) {
      return res.status(403).json({ error: "Access denied" });
    }
    
    const needed = await attendanceService.predictClassesNeeded(studentID, subject);
    res.json({ needed });
  } catch (error) {
    next(error);
  }
};
