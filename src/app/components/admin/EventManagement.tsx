import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Plus, Pencil, Trash2, Calendar, MapPin } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { EventItem, EventCategory } from "../../data/mockData";
import { ClayCard, ClayButton, SectionTitle, ClayInput, ClayTextarea, ClayToggle } from "../ui-kit";
import { Modal } from "../Modal";
import { fmtDateTime } from "../../utils/format";

const CATS: EventCategory[] = ["Workshop", "Hackathon", "Seminar"];
const catColor: Record<string, string> = {
  Workshop: "var(--accent-peri)",
  Hackathon: "var(--accent-coral)",
  Seminar: "var(--accent-mint)",
};

export function EventManagement() {
  const { events, addEvent, updateEvent, deleteEvent, pushToast } = useApp();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<EventItem | null>(null);

  const sorted = [...events].sort(
    (a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <SectionTitle sub="Create, edit & publish campus events">Event Management</SectionTitle>
        <ClayButton
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
        >
          <Plus size={17} /> New
        </ClayButton>
      </div>

      <div className="space-y-3">
        {sorted.map((e) => (
          <motion.div key={e.eventID} layout>
            <ClayCard tilt={false}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="text-xs px-2.5 py-0.5 rounded-full text-white"
                      style={{ background: catColor[e.category] }}
                    >
                      {e.category}
                    </span>
                    {!e.published && (
                      <span className="text-xs px-2 py-0.5 rounded-full clay-inset text-soft">Draft</span>
                    )}
                  </div>
                  <div className="font-display">{e.title}</div>
                  <div className="text-soft text-sm mt-1 space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={13} /> {fmtDateTime(e.dateTime)}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin size={13} /> {e.venue}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-soft">Published</span>
                  <ClayToggle
                    checked={e.published}
                    onChange={(v) => {
                      updateEvent(e.eventID, { published: v });
                      pushToast({
                        title: v ? "Event published" : "Event unpublished",
                        message: e.title,
                        tone: v ? "success" : "info",
                      });
                    }}
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditing(e);
                      setOpen(true);
                    }}
                    className="grid place-items-center w-10 h-10 rounded-xl clay-sm focus-clay"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => {
                      deleteEvent(e.eventID);
                      pushToast({ title: "Event deleted", tone: "info" });
                    }}
                    className="grid place-items-center w-10 h-10 rounded-xl clay-sm focus-clay"
                    style={{ color: "var(--accent-coral)" }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </ClayCard>
          </motion.div>
        ))}
      </div>

      <EventModal
        open={open}
        onClose={() => setOpen(false)}
        editing={editing}
        onSave={(data) => {
          if (editing) {
            updateEvent(editing.eventID, data);
            pushToast({ title: "Event updated", tone: "success" });
          } else {
            addEvent({ ...data, createdByAdminID: "a1" });
            pushToast({ title: "Event created 🎉", message: data.title, tone: "success" });
          }
          setOpen(false);
        }}
      />
    </div>
  );
}

function EventModal({
  open,
  onClose,
  editing,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  editing: EventItem | null;
  onSave: (d: Omit<EventItem, "eventID" | "createdByAdminID">) => void;
}) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<EventCategory>("Workshop");
  const [venue, setVenue] = useState("");
  const [description, setDescription] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [published, setPublished] = useState(true);

  useEffect(() => {
    if (open) {
      setTitle(editing?.title ?? "");
      setCategory(editing?.category ?? "Workshop");
      setVenue(editing?.venue ?? "");
      setDescription(editing?.description ?? "");
      setDateTime(editing?.dateTime ? editing.dateTime.slice(0, 16) : "");
      setPublished(editing?.published ?? true);
    }
  }, [open, editing]);

  return (
    <Modal open={open} onClose={onClose} title={editing ? "Edit event" : "New event"}>
      <div className="space-y-3">
        <div>
          <label className="text-sm block mb-1">Title</label>
          <ClayInput value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Event title" />
        </div>
        <div>
          <label className="text-sm block mb-1">Category</label>
          <div className="flex gap-2">
            {CATS.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className="flex-1 py-2 rounded-2xl text-sm focus-clay"
                style={
                  category === c
                    ? { background: catColor[c], color: "#fff", boxShadow: "var(--clay-shadow-sm)" }
                    : { boxShadow: "var(--clay-pressed)", background: "var(--clay-bg)" }
                }
              >
                {c}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-sm block mb-1">Venue</label>
          <ClayInput value={venue} onChange={(e) => setVenue(e.target.value)} placeholder="Location" />
        </div>
        <div>
          <label className="text-sm block mb-1">Date & time</label>
          <ClayInput type="datetime-local" value={dateTime} onChange={(e) => setDateTime(e.target.value)} />
        </div>
        <div>
          <label className="text-sm block mb-1">Description</label>
          <ClayTextarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Details…" />
        </div>
        <div className="flex items-center justify-between px-1">
          <span className="text-sm">Publish immediately</span>
          <ClayToggle checked={published} onChange={setPublished} />
        </div>
        <ClayButton
          className="w-full mt-2"
          disabled={!title || !venue || !dateTime}
          onClick={() => onSave({ title, category, venue, description, dateTime, published })}
        >
          {editing ? "Save changes" : "Create event"}
        </ClayButton>
      </div>
    </Modal>
  );
}
