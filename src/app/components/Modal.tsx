import { AnimatePresence, motion } from "motion/react";
import { ReactNode } from "react";
import { X } from "lucide-react";

export function Modal({
  open,
  onClose,
  title,
  children,
  maxWidth = 460,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  maxWidth?: number;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 grid place-items-center p-4"
          initial={{ backdropFilter: "blur(0px)", background: "rgba(20,22,30,0)" }}
          animate={{ backdropFilter: "blur(6px)", background: "rgba(20,22,30,0.35)" }}
          exit={{ backdropFilter: "blur(0px)", background: "rgba(20,22,30,0)" }}
          onClick={onClose}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.85, opacity: 0, y: 20, filter: "blur(8px)" }}
            animate={{ scale: 1, opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ scale: 0.85, opacity: 0, y: 20, filter: "blur(8px)" }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
            className="glass p-6 w-full relative"
            style={{ maxWidth }}
          >
            {title && <h2 className="font-display mb-4 pr-8">{title}</h2>}
            <button
              onClick={onClose}
              className="absolute top-5 right-5 grid place-items-center w-9 h-9 rounded-xl clay-sm focus-clay"
            >
              <X size={16} />
            </button>
            <div className="max-h-[70vh] overflow-y-auto no-scrollbar">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
