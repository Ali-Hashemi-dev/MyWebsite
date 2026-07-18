"use client";

import { useEffect, useRef } from "react";

type Mote = {
  x: number;
  y: number;
  r: number;
  vx: number;
  vy: number;
  phase: number;
  speed: number;
  depth: number;
};

/**
 * Floating dust motes on a full-viewport canvas. Density scales with area,
 * drawing pauses when the tab is hidden, and the whole layer is skipped
 * under reduced motion. Motes drift, twinkle, and lean gently away from the
 * pointer so the air feels inhabited.
 */
export function Dust({ density = 1, className }: { density?: number; className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let motes: Mote[] = [];
    let width = 0;
    let height = 0;
    let pointerX = -1e4;
    let pointerY = -1e4;
    const dpr = Math.min(2, window.devicePixelRatio || 1);

    function seed() {
      const count = Math.round(((width * height) / 22000) * density);
      motes = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: 0.5 + Math.random() * 1.7,
        vx: (Math.random() - 0.5) * 0.12,
        vy: -0.03 - Math.random() * 0.1,
        phase: Math.random() * Math.PI * 2,
        speed: 0.4 + Math.random() * 0.8,
        depth: 0.35 + Math.random() * 0.65
      }));
    }

    function resize() {
      width = canvas!.clientWidth;
      height = canvas!.clientHeight;
      canvas!.width = width * dpr;
      canvas!.height = height * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    }

    function onPointer(event: PointerEvent) {
      const rect = canvas!.getBoundingClientRect();
      pointerX = event.clientX - rect.left;
      pointerY = event.clientY - rect.top;
    }

    let t = 0;
    function frame() {
      t += 0.016;
      ctx!.clearRect(0, 0, width, height);
      for (const mote of motes) {
        const dx = mote.x - pointerX;
        const dy = mote.y - pointerY;
        const dist = Math.hypot(dx, dy);
        if (dist < 110 && dist > 0) {
          const push = ((110 - dist) / 110) * 0.35 * mote.depth;
          mote.x += (dx / dist) * push;
          mote.y += (dy / dist) * push;
        }

        mote.x += mote.vx * mote.depth + Math.sin(t * mote.speed + mote.phase) * 0.08;
        mote.y += mote.vy * mote.depth;

        if (mote.y < -6) {
          mote.y = height + 6;
          mote.x = Math.random() * width;
        }
        if (mote.x < -6) mote.x = width + 6;
        if (mote.x > width + 6) mote.x = -6;

        const twinkle = 0.35 + 0.3 * Math.sin(t * mote.speed * 1.4 + mote.phase);
        ctx!.beginPath();
        ctx!.arc(mote.x, mote.y, mote.r * mote.depth, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(236, 216, 178, ${(twinkle * mote.depth * 0.5).toFixed(3)})`;
        ctx!.fill();
      }
      raf = requestAnimationFrame(frame);
    }

    function onVisibility() {
      cancelAnimationFrame(raf);
      if (!document.hidden) raf = requestAnimationFrame(frame);
    }

    resize();
    raf = requestAnimationFrame(frame);
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onPointer, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [density]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      aria-hidden
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
    />
  );
}
