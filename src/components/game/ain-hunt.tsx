"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ambience } from "@/lib/ambience";
import { AinMark } from "../ain-mark";

const GOAL = 7;
const DECOYS = "ميكتبهنرسقلدجحخصضطظغفثشوزذأإء".split("");
const BEST_KEY = "ain-hunt-best";

type Glyph = {
  char: string;
  isAin: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  phase: number;
  caught: boolean;
};

type Spark = { x: number; y: number; vx: number; vy: number; life: number };

/**
 * صيد العين — the library's little game. Letters rise through the dark like
 * embers; among them hides the ع. Catch it seven times to light the seven
 * lanterns. Gentle by design: wrong letters simply sigh and drift on.
 */
export function AinHunt() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [best, setBest] = useState<number | null>(null);
  const [won, setWon] = useState(false);
  const scoreRef = useRef(0);

  useEffect(() => {
    const stored = window.localStorage.getItem(BEST_KEY);
    if (stored) setBest(Number(stored));
  }, []);

  /* elapsed clock */
  useEffect(() => {
    if (!running || won) return;
    const startedAt = performance.now() - elapsed * 1000;
    const id = setInterval(() => setElapsed((performance.now() - startedAt) / 1000), 100);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, won]);

  /* the field itself */
  useEffect(() => {
    if (!running) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    let width = 0;
    let height = 0;
    let raf = 0;
    let t = 0;
    const glyphs: Glyph[] = [];
    const sparks: Spark[] = [];
    const fontFamily = getComputedStyle(document.body).fontFamily;

    function resize() {
      width = canvas!.clientWidth;
      height = canvas!.clientHeight;
      canvas!.width = width * dpr;
      canvas!.height = height * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function spawn(forceAin = false): Glyph {
      const mustAin = forceAin || !glyphs.some((g) => g.isAin && !g.caught);
      const isAin = mustAin || Math.random() < 0.16;
      return {
        char: isAin ? "ع" : DECOYS[Math.floor(Math.random() * DECOYS.length)],
        isAin,
        x: 30 + Math.random() * Math.max(1, width - 60),
        y: reduced ? 40 + Math.random() * Math.max(1, height - 80) : height + 30 + Math.random() * 120,
        vx: (Math.random() - 0.5) * 0.35,
        vy: reduced ? 0 : -(0.35 + Math.random() * 0.55),
        size: 30 + Math.random() * 20,
        phase: Math.random() * Math.PI * 2,
        caught: false
      };
    }

    resize();
    for (let i = 0; i < 15; i++) glyphs.push(spawn());
    /* stagger initial ember heights so the field is already alive */
    if (!reduced) glyphs.forEach((g) => (g.y = Math.random() * (height + 150)));

    function frame() {
      t += 0.016;
      ctx!.clearRect(0, 0, width, height);

      for (let i = glyphs.length - 1; i >= 0; i--) {
        const g = glyphs[i];
        if (g.caught) continue;
        g.x += g.vx + Math.sin(t * 0.8 + g.phase) * 0.18;
        g.y += g.vy;
        if (g.y < -40) {
          glyphs[i] = spawn();
          continue;
        }

        const flicker = 0.55 + 0.25 * Math.sin(t * 1.6 + g.phase);
        ctx!.font = `${g.size}px ${fontFamily}`;
        ctx!.textAlign = "center";
        ctx!.textBaseline = "middle";
        if (g.isAin) {
          const pulse = 0.5 + 0.3 * Math.sin(t * 2.2 + g.phase);
          ctx!.shadowColor = `rgba(255, 106, 0, ${pulse * 0.7})`;
          ctx!.shadowBlur = 16;
          ctx!.fillStyle = `rgba(255, 158, 82, ${Math.min(1, flicker + 0.25)})`;
        } else {
          ctx!.shadowBlur = 0;
          ctx!.fillStyle = `rgba(216, 201, 172, ${flicker * 0.6})`;
        }
        ctx!.fillText(g.char, g.x, g.y);
        ctx!.shadowBlur = 0;
      }

      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.x += s.vx;
        s.y += s.vy;
        s.vy += 0.04;
        s.life -= 0.02;
        if (s.life <= 0) {
          sparks.splice(i, 1);
          continue;
        }
        ctx!.beginPath();
        ctx!.arc(s.x, s.y, 2 * s.life, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(255, 140, 26, ${s.life})`;
        ctx!.fill();
      }

      raf = requestAnimationFrame(frame);
    }

    function burst(x: number, y: number) {
      for (let i = 0; i < 18; i++) {
        const angle = (i / 18) * Math.PI * 2;
        const speed = 1 + Math.random() * 2.2;
        sparks.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - 0.6, life: 1 });
      }
    }

    function onPointer(event: PointerEvent) {
      const rect = canvas!.getBoundingClientRect();
      const px = event.clientX - rect.left;
      const py = event.clientY - rect.top;

      let nearest: Glyph | null = null;
      let nearestDist = 44;
      for (const g of glyphs) {
        if (g.caught) continue;
        const d = Math.hypot(g.x - px, g.y - py);
        if (d < nearestDist) {
          nearest = g;
          nearestDist = d;
        }
      }
      if (!nearest) return;

      if (nearest.isAin) {
        nearest.caught = true;
        burst(nearest.x, nearest.y);
        const index = glyphs.indexOf(nearest);
        glyphs[index] = spawn();
        if (ambience.playing) ambience.playChime(392 + scoreRef.current * 32);
        scoreRef.current += 1;
        setScore(scoreRef.current);
      }
    }

    canvas.addEventListener("pointerdown", onPointer);
    window.addEventListener("resize", resize);
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      canvas.removeEventListener("pointerdown", onPointer);
      window.removeEventListener("resize", resize);
    };
  }, [running]);

  /* win condition */
  useEffect(() => {
    if (score < GOAL || won) return;
    setWon(true);
    const time = elapsed;
    setBest((current) => {
      const next = current === null ? time : Math.min(current, time);
      window.localStorage.setItem(BEST_KEY, String(next));
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [score]);

  function start() {
    scoreRef.current = 0;
    setScore(0);
    setElapsed(0);
    setWon(false);
    setRunning(true);
  }

  const format = (s: number) => `${s.toFixed(1)} ث`;

  return (
    <div className="relative mx-auto max-w-4xl">
      {/* the seven lanterns */}
      <div className="mb-5 flex items-center justify-center gap-4" aria-label={`أضأت ${score} من ${GOAL} قناديل`}>
        {Array.from({ length: GOAL }, (_, i) => {
          const lit = i < score;
          return (
            <svg key={i} viewBox="0 0 24 32" width="22" height="30" aria-hidden>
              <path
                d="M5 10 C5 6 8 3 12 3 C16 3 19 6 19 10 L19 22 C19 26 16 29 12 29 C8 29 5 26 5 22 Z"
                fill={lit ? "rgba(255,106,0,0.18)" : "rgba(236,223,199,0.04)"}
                stroke={lit ? "var(--accent)" : "var(--line)"}
                strokeWidth="1.4"
              />
              <circle cx="12" cy="17" r={lit ? 3.4 : 1.6} fill={lit ? "var(--accent)" : "rgba(236,223,199,0.2)"}>
                {lit ? <animate attributeName="r" values="3.4;4;3.4" dur="1.8s" repeatCount="indefinite" /> : null}
              </circle>
            </svg>
          );
        })}
      </div>

      <div
        className="relative overflow-hidden rounded-2xl border"
        style={{
          borderColor: "var(--line)",
          background:
            "radial-gradient(ellipse 70% 60% at 50% 100%, rgba(255,106,0,0.06), transparent 70%), linear-gradient(180deg, #0a0806, #14100a)",
          height: "min(62vh, 34rem)"
        }}
      >
        <canvas ref={canvasRef} className="h-full w-full" style={{ touchAction: "manipulation" }} />

        {!running || won ? (
          <div
            className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-5 p-6 text-center"
            style={{ background: "rgba(10, 8, 6, 0.82)", backdropFilter: "blur(6px)" }}
          >
            {won ? (
              <>
                <span style={{ color: "var(--accent)" }}>
                  <AinMark variant="a" size={72} eye />
                </span>
                <p className="font-display m-0 text-3xl text-parchment">أضأتَ المكتبة</p>
                <p className="m-0 text-sm text-warm-gray">
                  زمنك: {format(elapsed)}
                  {best !== null ? ` · أفضل زمن: ${format(best)}` : ""}
                </p>
              </>
            ) : (
              <>
                <span style={{ color: "var(--bronze)" }}>
                  <AinMark variant="a" size={72} eye />
                </span>
                <p className="font-display m-0 text-3xl text-parchment">صيد العين</p>
                <p className="m-0 max-w-md text-sm leading-loose text-warm-gray">
                  حروفٌ تصعد في العتمة كالشرر. بينها تختبئ العين — اصطدها بنقرة، وأضئ القناديل
                  السبعة بأسرع ما تستطيع.
                </p>
              </>
            )}
            <button
              type="button"
              onClick={start}
              className="rounded-full px-8 py-3 font-bold transition-transform duration-300 hover:scale-105"
              style={{ background: "var(--accent)", color: "var(--ink)", border: 0, font: "inherit" }}
            >
              {won ? "أعد الصيد" : "ابدأ الصيد"}
            </button>
            {best !== null && !won ? (
              <p className="m-0 text-xs text-bronze">أفضل زمن: {format(best)}</p>
            ) : null}
          </div>
        ) : (
          <div className="pointer-events-none absolute top-4 left-5 z-10 text-sm text-warm-gray" dir="ltr">
            {format(elapsed)}
          </div>
        )}
      </div>

      <p className="mt-6 text-center text-xs leading-relaxed text-warm-gray">
        شغّل صوت المكتبة من القنديل أسفل الصفحة لتسمع رنين كل اصطياد.
      </p>

      <div className="mt-8 text-center">
        <Link
          href="/"
          className="text-sm tracking-wider no-underline transition-colors hover:text-accent"
          style={{ color: "var(--warm-gray)" }}
        >
          ← عودة إلى الرف
        </Link>
      </div>
    </div>
  );
}
