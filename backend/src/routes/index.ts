import { Router } from "express";
import { login, getMe } from "../controllers/auth.controller";
import {
  getAttendance,
  logAttendance,
  markAttendance,
  getSubjectStats,
  getClassAverage,
  predictClasses,
} from "../controllers/attendance.controller";
import {
  getAssignments,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  toggleChecklist,
  addChecklistItem,
} from "../controllers/assignment.controller";
import {
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  toggleRsvp,
  getRsvp,
} from "../controllers/event.controller";
import { queryAI } from "../controllers/ai.controller";
import { getUsers, getRoster } from "../controllers/user.controller";
import { getSubjects, getSections } from "../controllers/reference.controller";
import { authenticate } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";

const router = Router();

// Auth
router.post("/auth/login", login);
router.get("/auth/me", authenticate, getMe);

// Users
router.get("/users", authenticate, requireRole("admin"), getUsers);
router.get("/users/roster", authenticate, requireRole("teacher", "admin"), getRoster);

// Reference
router.get("/reference/subjects", authenticate, getSubjects);
router.get("/reference/sections", authenticate, getSections);

// Attendance
router.get("/attendance", authenticate, getAttendance);
router.post("/attendance", authenticate, requireRole("student"), logAttendance);
router.put("/attendance/mark", authenticate, requireRole("teacher"), markAttendance);
router.get("/attendance/stats/:studentID", authenticate, requireRole("student", "teacher"), getSubjectStats);
router.get("/attendance/class-average", authenticate, requireRole("teacher"), getClassAverage);
router.get("/attendance/predict/:studentID", authenticate, requireRole("student"), predictClasses);

// Assignments
router.get("/assignments", authenticate, getAssignments);
router.post("/assignments", authenticate, requireRole("student", "teacher"), createAssignment);
router.put("/assignments/:id", authenticate, requireRole("student", "teacher"), updateAssignment);
router.delete("/assignments/:id", authenticate, requireRole("student", "teacher"), deleteAssignment);
router.put("/assignments/:id/checklist/:itemID", authenticate, requireRole("student"), toggleChecklist);
router.post("/assignments/:id/checklist", authenticate, requireRole("student"), addChecklistItem);

// Events
router.get("/events", authenticate, getEvents);
router.post("/events", authenticate, requireRole("admin"), createEvent);
router.put("/events/:id", authenticate, requireRole("admin"), updateEvent);
router.delete("/events/:id", authenticate, requireRole("admin"), deleteEvent);
router.post("/events/:id/rsvp", authenticate, requireRole("student"), toggleRsvp);
router.get("/events/:id/rsvp", authenticate, requireRole("student"), getRsvp);

// AI
router.post("/ai/query", authenticate, requireRole("student"), queryAI);

export default router;
