import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, Mic, Bot, Sparkles, Square } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { SectionTitle } from "../ui-kit";
import { relativeDeadline } from "../../utils/format";

interface Msg {
  id: string;
  from: "user" | "ai";
  text: string;
}

const QUICK_REPLIES = [
  "What's my lowest attendance?",
  "What's due next?",
  "Any events this week?",
  "Am I at risk anywhere?",
];

export function AIAssistant() {
  const { attendancePercent, subjectStats, assignments, events, predictClassesNeeded } = useApp();
  const [messages, setMessages] = useState<Msg[]>([
    {
      id: "welcome",
      from: "ai",
      text: "Hi! I'm Campus Copilot 🤖 Ask me about your attendance, deadlines, or campus events.",
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [recording, setRecording] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  function answer(q: string): string {
    const low = q.toLowerCase();
    const stats = subjectStats("s1");
    if (low.includes("lowest") || low.includes("risk") || low.includes("below")) {
      const worst = [...stats].sort((a, b) => a.percent - b.percent)[0];
      const risk = stats.filter((s) => s.percent < 75);
      if (risk.length === 0)
        return `Good news — you're above 75% in every subject. Your lowest is ${worst.subject} at ${worst.percent}%.`;
      const needed = predictClassesNeeded("s1", worst.subject);
      return `⚠ ${worst.subject} is your lowest at ${worst.percent}%. Attend the next ${needed} class${needed > 1 ? "es" : ""} to get back to 75%.`;
    }
    if (low.includes("due") || low.includes("deadline") || low.includes("assignment") || low.includes("task")) {
      const pending = assignments
        .filter((a) => (a.createdBy === "s1" || a.createdBy === "t1") && !a.completed)
        .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
      if (!pending.length) return "You're all caught up — no pending tasks! 🎉";
      const n = pending[0];
      return `Your next deadline is "${n.title}" (${n.subject}) — ${relativeDeadline(n.deadline)}. You have ${pending.length} pending task${pending.length > 1 ? "s" : ""} total.`;
    }
    if (low.includes("event") || low.includes("workshop") || low.includes("hackathon")) {
      const upcoming = events
        .filter((e) => e.published)
        .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime())
        .slice(0, 2);
      if (!upcoming.length) return "No upcoming events on the calendar right now.";
      return `Upcoming: ${upcoming.map((e) => `${e.title} (${e.category})`).join(" and ")}. Head to the Events tab to RSVP!`;
    }
    if (low.includes("attendance") || low.includes("overall") || low.includes("percent")) {
      return `Your overall attendance is ${attendancePercent("s1")}%. ${attendancePercent("s1") >= 75 ? "You're eligible for exams. ✅" : "That's below the 75% threshold ⚠"
        }`;
    }
    return "I can help with attendance, deadlines, and events. Try one of the quick replies below 👇";
  }

  function send(text: string) {
    if (!text.trim()) return;
    const userMsg: Msg = { id: `u${Date.now()}`, from: "user", text };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages((m) => [...m, { id: `a${Date.now()}`, from: "ai", text: answer(text) }]);
    }, 900);
  }

  function toggleRecording() {
    if (recording) {
      setRecording(false);
      send("What's my lowest attendance?");
    } else {
      setRecording(true);
      setTimeout(() => {
        setRecording(false);
        send("What's my lowest attendance?");
      }, 2500);
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] md:h-[calc(100vh-4rem)]">
      <div className="flex items-center gap-3 mb-4">
        <div className="grid place-items-center w-11 h-11 rounded-2xl role-bg">
          <Bot className="text-white" size={22} />
        </div>
        <SectionTitle sub="Answers use your live data">Campus Copilot</SectionTitle>
      </div>

      {/* chat panel — glass floating over dashboard */}
      <div className="glass flex-1 flex flex-col p-4 min-h-0">
        <div className="flex-1 overflow-y-auto no-scrollbar space-y-3 pr-1">
          {messages.map((m) => (
            <motion.div
              key={m.id}
              initial={{ scale: 0.9, opacity: 0, y: 8 }}
              animate={{ scale: [0.9, 1.04, 1], opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] px-4 py-2.5 text-sm ${m.from === "user" ? "text-white rounded-3xl rounded-br-lg" : "clay-sm rounded-3xl rounded-bl-lg"
                  }`}
                style={m.from === "user" ? { background: "var(--role)" } : undefined}
              >
                {m.text}
              </div>
            </motion.div>
          ))}

          <AnimatePresence>
            {typing && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex justify-start"
              >
                <div className="clay-sm rounded-3xl rounded-bl-lg px-4 py-3 flex items-center gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="typing-dot w-2 h-2 rounded-full"
                      style={{ background: "var(--role)", animationDelay: `${i * 0.16}s` }}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={endRef} />
        </div>

        {/* quick reply chips */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar py-3">
          {QUICK_REPLIES.map((q) => (
            <motion.button
              key={q}
              whileTap={{ scale: 0.94 }}
              onClick={() => send(q)}
              className="whitespace-nowrap text-xs px-3 py-2 rounded-full clay-sm focus-clay flex items-center gap-1"
            >
              <Sparkles size={12} className="role-text" /> {q}
            </motion.button>
          ))}
        </div>

        {/* input row */}
        <div className="flex items-center gap-2">
          <div className="flex-1 clay-inset rounded-2xl flex items-center px-3">
            {recording ? (
              <div className="flex items-center gap-2 py-3 flex-1" style={{ color: "var(--accent-coral)" }}>
                <span className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ background: "var(--accent-coral)" }} />
                <span className="text-sm">Listening…</span>
              </div>
            ) : (
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send(input)}
                placeholder="Ask anything…"
                className="flex-1 bg-transparent outline-none py-3 text-sm"
              />
            )}
          </div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={toggleRecording}
            className="grid place-items-center w-11 h-11 rounded-2xl clay-sm focus-clay"
            style={recording ? { background: "var(--accent-coral)", color: "#fff" } : undefined}
          >
            {recording ? <Square size={18} /> : <Mic size={18} />}
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => send(input)}
            className="grid place-items-center w-11 h-11 rounded-2xl role-bg focus-clay"
          >
            <Send size={18} className="text-white" />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
