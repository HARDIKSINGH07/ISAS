import { useState } from "react";
import { motion } from "motion/react";
import { Search, Bookmark, Check, MapPin, Calendar, Eye } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { EventCategory } from "../../data/mockData";
import { ClayCard, SectionTitle, ClayInput } from "../ui-kit";
import { fmtDateTime } from "../../utils/format";

const CATS: (EventCategory | "All")[] = ["All", "Workshop", "Hackathon", "Seminar"];
const catColor: Record<string, string> = {
  Workshop: "var(--accent-peri)",
  Hackathon: "var(--accent-coral)",
  Seminar: "var(--accent-mint)",
};

export function EventsFeed({ readOnly = false }: { readOnly?: boolean }) {
  const { events, getRsvp, toggleRsvp, pushToast } = useApp();
  const [cat, setCat] = useState<EventCategory | "All">("All");
  const [query, setQuery] = useState("");

  const list = events
    .filter((e) => e.published)
    .filter((e) => cat === "All" || e.category === cat)
    .filter(
      (e) =>
        e.title.toLowerCase().includes(query.toLowerCase()) ||
        e.venue.toLowerCase().includes(query.toLowerCase())
    )
    .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <SectionTitle sub={readOnly ? "Read-only campus feed" : "Discover & RSVP to campus events"}>
          Events
        </SectionTitle>
        {readOnly && (
          <span className="flex items-center gap-1.5 text-xs text-soft clay-sm px-3 py-1.5 rounded-full">
            <Eye size={13} /> View only
          </span>
        )}
      </div>

      {/* search */}
      <div className="relative">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-soft" />
        <ClayInput
          className="pl-11"
          placeholder="Search events…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {/* category filter */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {CATS.map((c) => (
          <motion.button
            key={c}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCat(c)}
            className="whitespace-nowrap px-4 py-2 rounded-full text-sm focus-clay clay-sm"
            style={cat === c ? { background: "var(--role)", color: "#fff", boxShadow: "var(--clay-shadow-sm)" } : undefined}
          >
            {c}
          </motion.button>
        ))}
      </div>

      {list.length === 0 && (
        <ClayCard tilt={false} className="text-center py-10">
          <p className="text-soft">No events match your filters.</p>
        </ClayCard>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        {list.map((e) => {
          const rsvp = getRsvp(e.eventID);
          return (
            <ClayCard key={e.eventID} tilt={!readOnly}>
              <div className="flex items-start justify-between mb-2">
                <span
                  className="text-xs px-2.5 py-1 rounded-full text-white"
                  style={{ background: catColor[e.category] }}
                >
                  {e.category}
                </span>
                {!readOnly && (
                  <button
                    onClick={() => toggleRsvp(e.eventID, "bookmarked")}
                    className="focus-clay rounded-lg"
                  >
                    <Bookmark
                      size={20}
                      style={{ color: rsvp?.bookmarked ? "var(--role)" : "var(--clay-text-soft)" }}
                      fill={rsvp?.bookmarked ? "var(--role)" : "none"}
                    />
                  </button>
                )}
              </div>
              <div className="font-display">{e.title}</div>
              <p className="text-soft text-sm mt-1 mb-3">{e.description}</p>
              <div className="space-y-1 text-sm text-soft">
                <div className="flex items-center gap-2">
                  <Calendar size={14} /> {fmtDateTime(e.dateTime)}
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={14} /> {e.venue}
                </div>
              </div>
              {!readOnly && (
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={() => {
                    toggleRsvp(e.eventID, "attending");
                    pushToast({
                      title: rsvp?.attending ? "RSVP cancelled" : "You're going! 🎉",
                      message: e.title,
                      tone: rsvp?.attending ? "info" : "success",
                    });
                  }}
                  className="w-full mt-4 py-2.5 rounded-2xl focus-clay flex items-center justify-center gap-2"
                  style={
                    rsvp?.attending
                      ? { background: "var(--role)", color: "#fff", boxShadow: "var(--clay-shadow-sm)" }
                      : { boxShadow: "var(--clay-shadow-sm)", background: "var(--clay-surface)" }
                  }
                >
                  {rsvp?.attending ? (
                    <>
                      <Check size={16} /> Attending
                    </>
                  ) : (
                    "RSVP"
                  )}
                </motion.button>
              )}
            </ClayCard>
          );
        })}
      </div>
    </div>
  );
}
