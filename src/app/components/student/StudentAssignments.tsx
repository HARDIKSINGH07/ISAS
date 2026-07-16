import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { List, CalendarDays, Plus, Trash2, Pencil, Check, Bell } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { SUBJECTS, Assignment } from "../../data/mockData";
import { ClayCard, ClayButton, StatusPill, SectionTitle, ClayInput, ClayTextarea, ClayToggle } from "../ui-kit";
import { Modal } from "../Modal";
import { relativeDeadline, isOverdue, daysUntil, fmtDate } from "../../utils/format";

export function StudentAssignments() {
  const {
    assignments,
    addAssignment,
    updateAssignment,
    deleteAssignment,
    toggleChecklist,
    addChecklistItem,
    pushToast,
  } = useApp();
  const [view, setView] = useState<"list" | "calendar">("list");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Assignment | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const mine = assignments
    .filter((a) => a.createdBy === "s1" || a.createdBy === "t1")
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());

  function openCreate() {
    setEditing(null);
    setModalOpen(true);
  }
  function openEdit(a: Assignment) {
    setEditing(a);
    setModalOpen(true);
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <SectionTitle sub="Assignments from you and your teachers">Tasks</SectionTitle>
        <div className="flex items-center gap-2">
          <div className="clay-sm flex p-1 rounded-2xl">
            {(["list", "calendar"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className="grid place-items-center w-9 h-9 rounded-xl focus-clay"
                style={view === v ? { boxShadow: "var(--clay-pressed)", color: "var(--role)" } : undefined}
              >
                {v === "list" ? <List size={17} /> : <CalendarDays size={17} />}
              </button>
            ))}
          </div>
          <ClayButton onClick={openCreate}>
            <Plus size={17} /> New
          </ClayButton>
        </div>
      </div>

      {mine.length === 0 && (
        <ClayCard tilt={false} className="text-center py-10">
          <p className="text-soft">No tasks yet. Create your first one!</p>
        </ClayCard>
      )}

      {view === "list" ? (
        <div className="space-y-3">
          {mine.map((a) => {
            const overdue = isOverdue(a.deadline, a.completed);
            const soon = !a.completed && daysUntil(a.deadline) >= 0 && daysUntil(a.deadline) <= 3;
            const doneCount = a.checklist.filter((c) => c.done).length;
            return (
              <motion.div key={a.assignmentID} layout>
                <ClayCard
                  tilt={false}
                  className={overdue ? "ring-2" : ""}
                  onClick={() => setExpanded(expanded === a.assignmentID ? null : a.assignmentID)}
                >
                  <div
                    style={overdue ? { boxShadow: "inset 0 0 0 2px var(--accent-coral)", borderRadius: 20, margin: -20, padding: 20 } : undefined}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`font-display ${a.completed ? "line-through opacity-60" : ""}`}>
                            {a.title}
                          </span>
                          {a.createdBy === "t1" && (
                            <span className="text-xs px-2 py-0.5 rounded-full clay-inset text-soft">
                              from teacher
                            </span>
                          )}
                        </div>
                        <div className="text-soft text-sm">{a.subject}</div>
                      </div>
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <StatusPill status={a.completed ? "done" : overdue ? "overdue" : "pending"} />
                        {soon && (
                          <span className="flex items-center gap-1 text-xs" style={{ color: "var(--accent-amber)" }}>
                            <Bell size={12} /> {relativeDeadline(a.deadline)}
                          </span>
                        )}
                        {!soon && (
                          <span className="text-soft text-xs">{relativeDeadline(a.deadline)}</span>
                        )}
                      </div>
                    </div>

                    <AnimatePresence>
                      {expanded === a.assignmentID && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <p className="text-sm mt-3 text-soft">{a.description}</p>

                          {/* checklist */}
                          <div className="mt-3 space-y-1.5">
                            {a.checklist.map((c) => (
                              <button
                                key={c.itemID}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleChecklist(a.assignmentID, c.itemID);
                                }}
                                className="flex items-center gap-2 w-full text-left focus-clay rounded-lg"
                              >
                                <span
                                  className="grid place-items-center w-5 h-5 rounded-md"
                                  style={{
                                    background: c.done ? "var(--accent-mint)" : "var(--clay-bg-2)",
                                    boxShadow: "var(--clay-shadow-sm)",
                                  }}
                                >
                                  {c.done && <Check size={13} className="text-white" />}
                                </span>
                                <span className={`text-sm ${c.done ? "line-through opacity-60" : ""}`}>
                                  {c.label}
                                </span>
                              </button>
                            ))}
                            <AddChecklist onAdd={(l) => addChecklistItem(a.assignmentID, l)} />
                          </div>

                          {a.checklist.length > 0 && (
                            <div className="text-soft text-xs mt-2">
                              {doneCount}/{a.checklist.length} subtasks done
                            </div>
                          )}

                          <div className="flex items-center gap-2 mt-4">
                            <ClayButton
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                updateAssignment(a.assignmentID, { completed: !a.completed });
                                pushToast({
                                  title: a.completed ? "Marked pending" : "Completed! 🎉",
                                  tone: a.completed ? "info" : "success",
                                });
                              }}
                            >
                              <Check size={16} /> {a.completed ? "Reopen" : "Complete"}
                            </ClayButton>
                            {a.createdBy === "s1" && (
                              <>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openEdit(a);
                                  }}
                                  className="grid place-items-center w-10 h-10 rounded-xl clay-sm focus-clay"
                                >
                                  <Pencil size={16} />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteAssignment(a.assignmentID);
                                    pushToast({ title: "Task deleted", tone: "info" });
                                  }}
                                  className="grid place-items-center w-10 h-10 rounded-xl clay-sm focus-clay"
                                  style={{ color: "var(--accent-coral)" }}
                                >
                                  <Trash2 size={16} />
                                </button>
                              </>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </ClayCard>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <CalendarView assignments={mine} />
      )}

      <AssignmentModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        editing={editing}
        onSave={(data) => {
          if (editing) {
            updateAssignment(editing.assignmentID, data);
            pushToast({ title: "Task updated", tone: "success" });
          } else {
            addAssignment({ ...data, completed: false, createdBy: "s1", checklist: [] });
            pushToast({ title: "Task created", tone: "success" });
          }
          setModalOpen(false);
        }}
      />
    </div>
  );
}

function AddChecklist({ onAdd }: { onAdd: (label: string) => void }) {
  const [val, setVal] = useState("");
  return (
    <div className="flex items-center gap-2 pt-1" onClick={(e) => e.stopPropagation()}>
      <input
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && val.trim()) {
            onAdd(val.trim());
            setVal("");
          }
        }}
        placeholder="Add subtask…"
        className="flex-1 text-sm px-3 py-1.5 rounded-lg clay-inset bg-transparent outline-none focus-clay"
      />
    </div>
  );
}

function CalendarView({ assignments }: { assignments: Assignment[] }) {
  // group by date
  const byDate: Record<string, Assignment[]> = {};
  assignments.forEach((a) => {
    const k = fmtDate(a.deadline);
    (byDate[k] ??= []).push(a);
  });
  return (
    <div className="space-y-3">
      {Object.entries(byDate).map(([date, items]) => (
        <ClayCard key={date} tilt={false}>
          <div className="font-display role-text text-sm mb-2">{date}</div>
          <div className="space-y-2">
            {items.map((a) => (
              <div key={a.assignmentID} className="flex items-center justify-between clay-inset px-3 py-2 rounded-xl">
                <div className="min-w-0">
                  <div className={`text-sm ${a.completed ? "line-through opacity-60" : ""}`}>{a.title}</div>
                  <div className="text-soft text-xs">{a.subject}</div>
                </div>
                <StatusPill status={a.completed ? "done" : isOverdue(a.deadline, false) ? "overdue" : "pending"} />
              </div>
            ))}
          </div>
        </ClayCard>
      ))}
    </div>
  );
}

function AssignmentModal({
  open,
  onClose,
  editing,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  editing: Assignment | null;
  onSave: (data: { title: string; subject: string; description: string; deadline: string }) => void;
}) {
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");

  // sync when opening
  useSyncModal(open, editing, { setTitle, setSubject, setDescription, setDeadline });

  return (
    <Modal open={open} onClose={onClose} title={editing ? "Edit task" : "New task"}>
      <div className="space-y-3">
        <div>
          <label className="text-sm block mb-1">Title</label>
          <ClayInput value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Lab report" />
        </div>
        <div>
          <label className="text-sm block mb-1">Subject</label>
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl clay-inset bg-transparent outline-none focus-clay"
            style={{ color: "var(--clay-text)" }}
          >
            {SUBJECTS.map((s) => (
              <option key={s} value={s} style={{ color: "#000" }}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm block mb-1">Description</label>
          <ClayTextarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Details…" />
        </div>
        <div>
          <label className="text-sm block mb-1">Deadline</label>
          <ClayInput type="datetime-local" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
        </div>
        <ClayButton
          className="w-full mt-2"
          disabled={!title || !deadline}
          onClick={() => onSave({ title, subject, description, deadline })}
        >
          {editing ? "Save changes" : "Create task"}
        </ClayButton>
      </div>
    </Modal>
  );
}

// helper to reset modal fields when it opens
import { useEffect } from "react";
function useSyncModal(
  open: boolean,
  editing: Assignment | null,
  setters: {
    setTitle: (v: string) => void;
    setSubject: (v: string) => void;
    setDescription: (v: string) => void;
    setDeadline: (v: string) => void;
  }
) {
  useEffect(() => {
    if (open) {
      setters.setTitle(editing?.title ?? "");
      setters.setSubject(editing?.subject ?? SUBJECTS[0]);
      setters.setDescription(editing?.description ?? "");
      setters.setDeadline(editing?.deadline ? editing.deadline.slice(0, 16) : "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editing]);
}
