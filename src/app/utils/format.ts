import { CURRENT_DATE } from "../data/mockData";

export function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function isOverdue(deadline: string, completed: boolean) {
  return !completed && new Date(deadline).getTime() < CURRENT_DATE.getTime();
}

export function daysUntil(iso: string) {
  const diff = new Date(iso).getTime() - CURRENT_DATE.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function relativeDeadline(iso: string) {
  const d = daysUntil(iso);
  if (d < 0) return `${Math.abs(d)}d overdue`;
  if (d === 0) return "Due today";
  if (d === 1) return "Due tomorrow";
  return `Due in ${d}d`;
}
