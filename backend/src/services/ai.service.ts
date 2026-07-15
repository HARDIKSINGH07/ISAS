import { attendanceService } from "./attendance.service";
import { assignmentService } from "./assignment.service";
import { eventService } from "./event.service";

export class AIService {
  async processQuery(userID: string, inputText: string) {
    const low = inputText.toLowerCase();
    const stats = await attendanceService.getSubjectStats(userID);
    
    // Attendance risk query
    if (low.includes("lowest") || low.includes("risk") || low.includes("below")) {
      const worst = [...stats].sort((a, b) => a.percent - b.percent)[0];
      const risk = stats.filter((s) => s.percent < 75);
      
      if (risk.length === 0) {
        return `Good news — you're above 75% in every subject. Your lowest is ${worst.subject} at ${worst.percent}%.`;
      }
      
      const needed = await attendanceService.predictClassesNeeded(userID, worst.subject);
      return `⚠ ${worst.subject} is your lowest at ${worst.percent}%. Attend the next ${needed} class${needed > 1 ? "es" : ""} to get back to 75%.`;
    }
    
    // Deadlines query
    if (low.includes("due") || low.includes("deadline") || low.includes("assignment") || low.includes("task")) {
      const allAssignments = await assignmentService.getAssignments();
      const pending = allAssignments
        .filter((a) => (a.createdBy === userID || a.createdBy === "t1") && !a.completed)
        .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
        
      if (!pending.length) return "You're all caught up — no pending tasks! 🎉";
      
      const n = pending[0];
      const d = Math.ceil((new Date(n.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      
      let relStr = `in ${d}d`;
      if (d < 0) relStr = `${Math.abs(d)}d overdue`;
      else if (d === 0) relStr = "today";
      else if (d === 1) relStr = "tomorrow";
      
      return `Your next deadline is "${n.title}" (${n.subject}) — due ${relStr}. You have ${pending.length} pending task${pending.length > 1 ? "s" : ""} total.`;
    }
    
    // Events query
    if (low.includes("event") || low.includes("workshop") || low.includes("hackathon")) {
      const events = await eventService.getEvents(true);
      const upcoming = events
        .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime())
        .slice(0, 2);
        
      if (!upcoming.length) return "No upcoming events on the calendar right now.";
      
      return `Upcoming: ${upcoming.map((e) => `${e.title} (${e.category})`).join(" and ")}. Head to the Events tab to RSVP!`;
    }
    
    // General attendance query
    if (low.includes("attendance") || low.includes("overall") || low.includes("percent")) {
      const pct = await attendanceService.getAttendancePercent(userID);
      return `Your overall attendance is ${pct}%. ${
        pct >= 75 ? "You're eligible for exams. ✅" : "That's below the 75% threshold ⚠"
      }`;
    }
    
    // Fallback
    return "I can help with attendance, deadlines, and events. Try one of the quick replies below 👇";
  }
}

export const aiService = new AIService();
