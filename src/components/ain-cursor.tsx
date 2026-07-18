"use client";

import { useEffect, useRef, useState } from "react";
import { AIN } from "@/lib/ain";
import { useAinVariant } from "./identity-provider";

const INTERACTIVE = "a, button, [role='button'], input, textarea, select, summary, [data-cursor='pointer']";

/**
 * Site-wide custom cursor: the ع mark trails the pointer with a touch of
 * inertia, leans into its own velocity, and warms to orange over anything
 * interactive. Only active on fine pointers; disabled for reduced motion.
 */
export function AinCursor() {
  const { variant } = useAinVariant();
  const wrapRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced) return;

    setEnabled(true);
    document.documentElement.classList.add("ain-cursor-active");

    const wrap = wrapRef.current;
    let raf = 0;
    let mouseX = -100;
    let mouseY = -100;
    let x = -100;
    let y = -100;
    let lastX = -100;
    let hot = false;
    let pressed = false;

    function onMove(event: PointerEvent) {
      mouseX = event.clientX;
      mouseY = event.clientY;
      if (wrap && wrap.style.opacity !== "1") {
        x = mouseX;
        y = mouseY;
        lastX = mouseX;
        wrap.style.opacity = "1";
      }
      const target = event.target as Element | null;
      hot = Boolean(target?.closest?.(INTERACTIVE));
    }

    function onDown() {
      pressed = true;
    }
    function onUp() {
      pressed = false;
    }

    function tick() {
      x += (mouseX - x) * 0.22;
      y += (mouseY - y) * 0.22;
      const velocity = x - lastX;
      lastX = x;
      const lean = Math.max(-14, Math.min(14, velocity * 1.1));
      const scale = pressed ? 0.82 : hot ? 1.35 : 1;
      if (wrap) {
        wrap.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%) rotate(${lean}deg) scale(${scale})`;
        wrap.style.color = hot ? "var(--accent)" : "var(--parchment)";
        wrap.style.filter = hot ? "drop-shadow(0 0 8px var(--accent-glow))" : "none";
      }
      raf = requestAnimationFrame(tick);
    }

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    raf = requestAnimationFrame(tick);

    return () => {
      document.documentElement.classList.remove("ain-cursor-active");
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      cancelAnimationFrame(raf);
    };
  }, []);

  if (!enabled) return null;

  const shape = AIN[variant];
  const height = 30;
  const width = (shape.width / shape.height) * height;

  return (
    <div
      ref={wrapRef}
      aria-hidden
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 120,
        opacity: 0,
        pointerEvents: "none",
        willChange: "transform",
        transition: "color 0.25s, filter 0.25s"
      }}
    >
      <svg viewBox={shape.viewBox} width={width} height={height}>
        <path d={shape.path} fill="currentColor" fillRule="evenodd" />
      </svg>
    </div>
  );
}
