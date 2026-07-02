"use client";

import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { useEffect } from "react";

const particles = [
  { x: "8%", y: "18%", size: 5, delay: 0 },
  { x: "18%", y: "72%", size: 3, delay: 0.4 },
  { x: "34%", y: "28%", size: 4, delay: 0.8 },
  { x: "48%", y: "82%", size: 6, delay: 0.2 },
  { x: "64%", y: "16%", size: 3, delay: 1.1 },
  { x: "76%", y: "66%", size: 5, delay: 0.6 },
  { x: "88%", y: "34%", size: 4, delay: 1.4 },
  { x: "94%", y: "84%", size: 3, delay: 0.9 }
];

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 160, damping: 28, mass: 0.2 });

  return (
    <motion.div
      aria-hidden="true"
      className="fixed inset-x-0 top-0 z-50 h-[3px] origin-right bg-gradient-to-l from-ember-400 via-white to-ember-700"
      style={{ scaleX }}
    />
  );
}

export function AmbientBackground() {
  const reducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const yOne = useTransform(scrollYProgress, [0, 1], ["0%", reducedMotion ? "0%" : "18%"]);
  const yTwo = useTransform(scrollYProgress, [0, 1], ["0%", reducedMotion ? "0%" : "-12%"]);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-night">
      <motion.div
        className="absolute inset-[-18%] bg-mesh-radial opacity-90 blur-3xl"
        style={{ y: yOne }}
        animate={
          reducedMotion
            ? undefined
            : {
                scale: [1, 1.06, 0.98, 1],
                rotate: [0, 3, -2, 0]
              }
        }
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -left-28 top-24 h-[34rem] w-[34rem] rounded-full bg-ember-600/20 blur-3xl"
        style={{ y: yTwo }}
        animate={reducedMotion ? undefined : { borderRadius: ["42%", "58%", "48%", "42%"], x: [0, 48, -24, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: [0.4, 0, 0.2, 1] }}
      />
      <motion.div
        className="absolute -right-20 bottom-10 h-[28rem] w-[28rem] rounded-full bg-white/10 blur-3xl"
        style={{ y: yOne }}
        animate={reducedMotion ? undefined : { borderRadius: ["50%", "38%", "62%", "50%"], x: [0, -36, 28, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: [0.4, 0, 0.2, 1] }}
      />
      {particles.map((particle) => (
        <motion.span
          key={`${particle.x}-${particle.y}`}
          className="absolute rounded-full bg-ember-300/70 shadow-[0_0_34px_rgba(249,115,22,.65)]"
          style={{
            right: particle.x,
            top: particle.y,
            width: particle.size,
            height: particle.size
          }}
          animate={reducedMotion ? undefined : { y: [-10, 18, -10], opacity: [0.35, 0.9, 0.35] }}
          transition={{ duration: 5.6, repeat: Infinity, delay: particle.delay, ease: "easeInOut" }}
        />
      ))}
      <div className="noise" />
    </div>
  );
}

export function CursorGlow() {
  const x = useSpring(0, { stiffness: 140, damping: 24, mass: 0.25 });
  const y = useSpring(0, { stiffness: 140, damping: 24, mass: 0.25 });

  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      x.set(event.clientX - 160);
      y.set(event.clientY - 160);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [x, y]);

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed z-10 hidden h-80 w-80 rounded-full bg-ember-500/15 blur-3xl md:block"
      style={{ x, y }}
    />
  );
}
