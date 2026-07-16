import { AnimatePresence, motion } from "motion/react";
import { AppProvider, useApp } from "./context/AppContext";
import { AuthScreen } from "./components/AuthScreen";
import { Shell } from "./components/Shell";
import { Toasts } from "./components/Toasts";

function Root() {
  const { currentUser } = useApp();
  return (
    <div className="min-h-screen w-full">
      <Toasts />
      <AnimatePresence mode="wait">
        {currentUser ? (
          <motion.div
            key="app"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
          >
            <Shell />
          </motion.div>
        ) : (
          <motion.div
            key="auth"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
          >
            <AuthScreen />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Root />
    </AppProvider>
  );
}
