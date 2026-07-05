import { motion, AnimatePresence } from "framer-motion";

export default function LoadingScreen({ show }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#050510]"
        >
          <div className="absolute inset-0 grid-bg opacity-40" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-gradient-to-r from-[#00E5FF]/20 to-[#7C3AED]/20 blur-3xl animate-pulse-slow" />
          <div className="relative flex flex-col items-center gap-6">
            <motion.img
              src="/lazr-logo.png"
              alt="LazR Hub"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: [0.95, 1.05, 0.95], opacity: 1 }}
              transition={{ scale: { duration: 2.5, repeat: Infinity, ease: "easeInOut" }, opacity: { duration: 0.5 } }}
              className="w-40 h-40 object-contain drop-shadow-[0_0_40px_rgba(0,229,255,0.6)]"
            />
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
              className="font-heading text-sm tracking-[0.3em] text-[#B8C2CC]"
            >
              LOADING LAZR HUB<span className="text-[#00E5FF]">...</span>
            </motion.div>
            <div className="w-48 h-[2px] bg-white/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                className="h-full w-1/2 bg-gradient-to-r from-transparent via-[#00E5FF] to-transparent"
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
