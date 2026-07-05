import { motion, AnimatePresence } from "framer-motion";

export default function LoadingScreen({ show }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#050510]"
        >
          <div className="relative flex flex-col items-center gap-8">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="relative w-24 h-24"
            >
              <div className="absolute inset-0 rounded-full border-2 border-[#00E5FF]/20" />
              <div className="absolute inset-0 rounded-full border-t-2 border-[#00E5FF] shadow-[0_0_30px_rgba(0,229,255,0.6)]" />
              <div className="absolute inset-3 rounded-full border-2 border-[#7C3AED]/40" />
              <div className="absolute inset-3 rounded-full border-b-2 border-[#7C3AED]" />
            </motion.div>
            <div className="font-heading text-2xl font-black tracking-[0.3em] gradient-text">LAZR HUB</div>
            <div className="text-xs tracking-[0.4em] text-[#B8C2CC]/60">INITIALIZING</div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
