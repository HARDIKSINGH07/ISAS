import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Plus, Pencil, Trash2, Users } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { Assignment } from "../../data/mockData";
import { ClayCard, ClayButton, SectionTitle, StatusPill, ClayInput, ClayTextarea } from "../ui-kit";
import { Modal } from "../Modal";
import { relativeDeadline, isOverdue } from "../../utils/format";

export function TeacherAssignments() {
  const { currentUser, assignments, addAssignment, updateAssignment, deleteAssignment, pushToast } = useApp();
  const subjects = currentUser!.subjectsTaught ?? [];
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Assignment | null>(null);

  const mine = assignments
    .filter((a) => a.createdBy === "t1")
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <SectionTitle sub="Posted assignments appear on students' screens">Manage Assignments</SectionTitle>
        <ClayButton
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
        >
          <Plus size={17} /> Post
        </ClayButton>
      </div>

      {mine.length === 0 && (
        <ClayCard tilt={false} className="text-center py-10">
          <p className="text-soft">No assignments posted yet.</p>
        </ClayCard>
      )}

      <div className="space-y-3">
        {mine.map((a) => (
          <motion.div key={a.assignmentID} layout>
            <ClayCard tilt={false}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-display">{a.title}</div>
                  <div className="text-soft text-sm">{a.subject}</div>
                  <p className="text-soft text-sm mt-2">{a.description}</p>
                  <div className="flex items-center gap-1.5 text-soft text-xs mt-2">
                    <Users size={13} /> Visible to all enrolled students
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <StatusPill status={isOverdue(a.deadline, a.completed) ? "overdue" : "pending"} />
                  <span className="text-soft text-xs">{relativeDeadline(a.deadline)}</span>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => {
                    setEditing(a);
                    setOpen(true);
                  }}
                  className="grid place-items-center w-10 h-10 rounded-xl clay-sm focus-clay"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => {
                    deleteAssignment(a.assignmentID);
                    pushToast({ title: "Assignment removed", tone: "info" });
                  }}
                  className="grid place-items-center w-10 h-10 rounded-xl clay-sm focus-clay"
                  style={{ color: "var(--accent-coral)" }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </ClayCard>
          </motion.div>
        ))}
      </div>

      <AssignmentModal
        open={open}
        onClose={() => setOpen(false)}
        editing={editing}
        subjects={subjects}
        onSave={(data) => {
          if (editing) {
            updateAssignment(editing.assignmentID, data);
            pushToast({ title: "Assignment updated", tone: "success" });
          } else {
            addAssignment({ ...data, completed: false, createdBy: "t1", checklist: [] });
            pushToast({ title: "Posted to students 📢", message: data.title, tone: "success" });
          }
          setOpen(false);
        }}
      />
    </div>
  );
}

function AssignmentModal({
  open,
  onClose,
  editing,
  subjects,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  editing: Assignment | null;
  subjects: string[];
  onSave: (d: { title: string; subject: string; description: string; deadline: string }) => void;
}) {
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState(subjects[0]);
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");

  useEffect(() => {
    if (open) {
      setTitle(editing?.title ?? "");
      setSubject(editing?.subject ?? subjects[0]);
      setDescription(editing?.description ?? "");
      setDeadline(editing?.deadline ? editing.deadline.slice(0, 16) : "");
    }
  }, [open, editing, subjects]);

  return (
    <Modal open={open} onClose={onClose} title={editing ? "Edit assignment" : "Post assignment"}>
      <div className="space-y-3">
        <div>
          <label className="text-sm block mb-1">Title</label>
          <ClayInput value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Assignment title" />
        </div>
        <div>
          <label className="text-sm block mb-1">Subject</label>
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl clay-inset bg-transparent outline-none focus-clay"
            style={{ color: "var(--clay-text)" }}
          >
            {subjects.map((s) => (
              <option key={s} value={s} style={{ color: "#000" }}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm block mb-1">Description</label>
          <ClayTextarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Instructions…" />
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
          {editing ? "Save changes" : "Post to students"}
        </ClayButton>
      </div>
    </Modal>
  );
}
