import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function CustomCursor() {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [hovering, setHovering] = useState(false);

  useEffect(() => {
    const move = (e) => setPos({ x: e.clientX, y: e.clientY });
    const over = (e) => {
      const t = e.target;
      if (t.closest("a, button, [role='button'], input, textarea, select, .cursor-hover")) {
        setHovering(true);
      } else setHovering(false);
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseover", over);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseover", over);
    };
  }, []);

  return (
    <>
      <motion.div
        className="cursor-dot pointer-events-none fixed z-[9999]"
        animate={{ x: pos.x - 3, y: pos.y - 3 }}
        transition={{ type: "spring", stiffness: 800, damping: 40, mass: 0.2 }}
        style={{
          width: 6, height: 6, borderRadius: "50%",
          background: "#00E5FF", boxShadow: "0 0 12px #00E5FF",
        }}
      />
      <motion.div
        className="cursor-ring pointer-events-none fixed z-[9998]"
        animate={{
          x: pos.x - (hovering ? 24 : 16),
          y: pos.y - (hovering ? 24 : 16),
          width: hovering ? 48 : 32,
          height: hovering ? 48 : 32,
        }}
        transition={{ type: "spring", stiffness: 200, damping: 25, mass: 0.5 }}
        style={{
          borderRadius: "50%",
          border: "1px solid rgba(0, 229, 255, 0.6)",
          background: hovering ? "rgba(0, 229, 255, 0.08)" : "transparent",
          boxShadow: hovering ? "0 0 20px rgba(0,229,255,0.4)" : "none",
        }}
      />
    </>
  );
}
