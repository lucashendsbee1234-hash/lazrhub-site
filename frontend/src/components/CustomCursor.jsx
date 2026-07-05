import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

export default function CustomCursor() {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [hovering, setHovering] = useState(false);
  const [clicking, setClicking] = useState(false);
  const trailRef = useRef([]);
  const canvasRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    const move = (e) => {
      setPos({ x: e.clientX, y: e.clientY });
      trailRef.current.push({ x: e.clientX, y: e.clientY, life: 1 });
      if (trailRef.current.length > 20) trailRef.current.shift();
    };
    const over = (e) => {
      const t = e.target;
      setHovering(!!t.closest("a, button, [role='button'], input, textarea, select, .cursor-hover"));
    };
    const down = () => setClicking(true);
    const up = () => setClicking(false);
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseover", over);
    window.addEventListener("mousedown", down);
    window.addEventListener("mouseup", up);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseover", over);
      window.removeEventListener("mousedown", down);
      window.removeEventListener("mouseup", up);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);
    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const trail = trailRef.current;
      for (let i = 0; i < trail.length; i++) {
        const p = trail[i];
        p.life *= 0.88;
        const alpha = p.life * 0.5;
        const radius = (i / trail.length) * 8 + 2;
        ctx.beginPath();
        ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 229, 255, ${alpha})`;
        ctx.shadowBlur = 20;
        ctx.shadowColor = "rgba(0, 229, 255, 0.7)";
        ctx.fill();
      }
      trailRef.current = trail.filter((p) => p.life > 0.05);
      rafRef.current = requestAnimationFrame(loop);
    };
    loop();
    return () => { cancelAnimationFrame(rafRef.current); window.removeEventListener("resize", resize); };
  }, []);

  return (
    <>
      <canvas ref={canvasRef} className="pointer-events-none fixed inset-0" style={{ zIndex: 2147483645 }} />
      <motion.div
        className="cursor-dot pointer-events-none fixed"
        style={{ zIndex: 2147483646, width: 6, height: 6, borderRadius: "50%", background: "#00E5FF", boxShadow: "0 0 14px #00E5FF" }}
        animate={{ x: pos.x - 3, y: pos.y - 3, scale: clicking ? 0.5 : 1 }}
        transition={{ type: "spring", stiffness: 900, damping: 45, mass: 0.15 }}
      />
      <motion.div
        className="cursor-ring pointer-events-none fixed"
        style={{
          zIndex: 2147483647, borderRadius: "50%",
          border: `1px solid rgba(0, 229, 255, ${hovering ? 0.9 : 0.5})`,
          background: hovering ? "rgba(0, 229, 255, 0.12)" : "transparent",
          boxShadow: hovering ? "0 0 28px rgba(0,229,255,0.5)" : "0 0 8px rgba(0,229,255,0.15)",
        }}
        animate={{
          x: pos.x - (hovering ? 26 : 18),
          y: pos.y - (hovering ? 26 : 18),
          width: hovering ? 52 : 36,
          height: hovering ? 52 : 36,
          scale: clicking ? 0.85 : 1,
        }}
        transition={{ type: "spring", stiffness: 180, damping: 22, mass: 0.6 }}
      />
    </>
  );
}
