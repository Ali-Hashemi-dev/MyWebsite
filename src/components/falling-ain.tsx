"use client";

import { useEffect, useRef, useState } from "react";

type Glyph = {
  x: number;
  y: number;
  w: number;
  h: number;
  speed: number;
  swayAmp: number;
  swayFreq: number;
  phase: number;
  rot: number;
  rotSpeed: number;
  alpha: number;
  accent: boolean;
};

/** Overall layer opacity — the glyphs must stay whisper-faint over text. */
const LAYER_ALPHA = 0.09;

const PARCHMENT: Tint = [236, 223, 199];
const ACCENT: Tint = [255, 106, 0];

type Tint = [number, number, number];

/**
 * The ع letterform drifting down the viewport like leaves in still library
 * air. Sits above content (page roots paint opaque backgrounds, so a layer
 * behind them would never show) but faint enough to read as atmosphere.
 * Pauses while the tab is hidden; renders nothing under reduced motion.
 */
export function FallingAin() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setActive(!query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let glyphs: Glyph[] = [];
    let width = 0;
    let height = 0;
    let last = 0;
    let t = 0;
    let disposed = false;
    let parchment: HTMLCanvasElement | null = null;
    let accent: HTMLCanvasElement | null = null;
    const dpr = Math.min(2, window.devicePixelRatio || 1);

    // Recolor the PNG. The source is a black glyph on an opaque white
    // ground, so alpha alone cannot isolate the letter — luminance becomes
    // transparency (black → opaque, white → clear), then the tint is applied.
    function tint(img: HTMLImageElement, [r, g, b]: Tint) {
      const off = document.createElement("canvas");
      off.width = img.naturalWidth;
      off.height = img.naturalHeight;
      const octx = off.getContext("2d")!;
      octx.drawImage(img, 0, 0);
      const image = octx.getImageData(0, 0, off.width, off.height);
      const data = image.data;
      for (let i = 0; i < data.length; i += 4) {
        const lum = (data[i] + data[i + 1] + data[i + 2]) / 3;
        data[i + 3] = Math.round(data[i + 3] * (1 - lum / 255));
        data[i] = r;
        data[i + 1] = g;
        data[i + 2] = b;
      }
      octx.putImageData(image, 0, 0);
      return off;
    }

    function seed(aspect: number) {
      const count = 12 + Math.floor(Math.random() * 5);
      glyphs = Array.from({ length: count }, () => {
        const w = 40 + Math.random() * 130;
        const isAccent = Math.random() < 0.125;
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          w,
          h: w * aspect,
          // bigger reads as closer, so it falls faster
          speed: 10 + ((w - 40) / 130) * 20,
          swayAmp: 10 + Math.random() * 30,
          swayFreq: (Math.PI * 2) / (6 + Math.random() * 8),
          phase: Math.random() * Math.PI * 2,
          rot: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 0.3,
          alpha: (0.35 + Math.random() * 0.65) * (isAccent ? 0.7 : 1),
          accent: isAccent
        };
      });
    }

    function resize() {
      width = canvas!.clientWidth;
      height = canvas!.clientHeight;
      canvas!.width = width * dpr;
      canvas!.height = height * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (parchment) seed(parchment.height / parchment.width);
    }

    function frame(now: number) {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      t += dt;

      ctx!.clearRect(0, 0, width, height);
      for (const g of glyphs) {
        g.y += g.speed * dt;
        g.rot += g.rotSpeed * dt;
        if (g.y > height + g.h) {
          g.y = -g.h;
          g.x = Math.random() * width;
        }

        const sway = Math.sin(t * g.swayFreq + g.phase) * g.swayAmp;
        ctx!.save();
        ctx!.globalAlpha = LAYER_ALPHA * g.alpha;
        ctx!.translate(g.x + sway + g.w / 2, g.y + g.h / 2);
        ctx!.rotate(g.rot);
        ctx!.drawImage(g.accent ? accent! : parchment!, -g.w / 2, -g.h / 2, g.w, g.h);
        ctx!.restore();
      }
      raf = requestAnimationFrame(frame);
    }

    function onVisibility() {
      cancelAnimationFrame(raf);
      if (!document.hidden && parchment) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    }

    const img = new Image();
    img.src = (process.env.NEXT_PUBLIC_BASE_PATH || "") + "/ain.png";
    img.onload = () => {
      if (disposed) return;
      parchment = tint(img, PARCHMENT);
      accent = tint(img, ACCENT);
      seed(img.naturalHeight / img.naturalWidth);
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };

    resize();
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [active]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 40
      }}
    />
  );
}
