import { AnimatePresence, motion } from "motion/react";
import { CheckCircle2, AlertTriangle, XCircle, Info } from "lucide-react";
import { useApp } from "../context/AppContext";

const toneMap = {
  success: { icon: CheckCircle2, color: "var(--accent-mint)" },
  warn: { icon: AlertTriangle, color: "var(--accent-amber)" },
  error: { icon: XCircle, color: "var(--accent-coral)" },
  info: { icon: Info, color: "var(--accent-peri)" },
};

export function Toasts() {
  const { toasts, dismissToast } = useApp();
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[60] flex flex-col gap-2 w-[calc(100%-2rem)] max-w-sm">
      <AnimatePresence>
        {toasts.map((t) => {
          const { icon: Icon, color } = toneMap[t.tone];
          return (
            <motion.div
              key={t.id}
              layout
              initial={{ y: -40, opacity: 0, scale: 0.9 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85, y: -10 }}
              transition={{ type: "spring", stiffness: 400, damping: 22 }}
              onClick={() => dismissToast(t.id)}
              className="glass px-4 py-3 flex items-start gap-3 cursor-pointer"
            >
              <Icon size={20} style={{ color }} className="shrink-0 mt-0.5" />
              <div className="min-w-0">
                <div className="font-display text-sm">{t.title}</div>
                {t.message && <div className="text-soft text-xs mt-0.5">{t.message}</div>}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
