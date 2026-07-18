"use client";

import { useEffect, useRef } from "react";
import { AIN, type AinVariant } from "@/lib/ain";

type AinMarkProps = {
  variant?: AinVariant;
  /** Rendered height in px (width follows the letter's proportions). */
  size?: number;
  className?: string;
  /** Turn the letter's counter into a living eye: pupil tracks the pointer, lid blinks. */
  eye?: boolean;
  /** Eye pupil color; defaults to the accent orange. */
  eyeColor?: string;
  title?: string;
};

/**
 * The ع mark. Pure SVG, colored via `currentColor` so it inherits text color.
 */
export function AinMark({
  variant = "a",
  size = 48,
  className,
  eye = false,
  eyeColor = "var(--accent)",
  title
}: AinMarkProps) {
  const shape = AIN[variant];
  const pupilRef = useRef<SVGCircleElement>(null);
  const lidRef = useRef<SVGEllipseElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!eye) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const pupil = pupilRef.current;
    const lid = lidRef.current;
    const svg = svgRef.current;
    if (!pupil || !svg) return;

    let raf = 0;
    let targetX = 0;
    let targetY = 0;
    let x = 0;
    let y = 0;

    const maxShift = shape.eye.rx * 0.42;

    function onPointerMove(event: PointerEvent) {
      const rect = svg!.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const dx = event.clientX - centerX;
      const dy = event.clientY - centerY;
      const distance = Math.hypot(dx, dy) || 1;
      const strength = Math.min(1, distance / 320);
      targetX = (dx / distance) * maxShift * strength;
      targetY = (dy / distance) * maxShift * strength * 0.6;
    }

    function tick() {
      x += (targetX - x) * 0.09;
      y += (targetY - y) * 0.09;
      pupil!.setAttribute("transform", `translate(${x.toFixed(2)} ${y.toFixed(2)})`);
      raf = requestAnimationFrame(tick);
    }

    let blinkTimer: ReturnType<typeof setTimeout>;
    function scheduleBlink() {
      blinkTimer = setTimeout(() => {
        if (lid) {
          lid.style.transition = "transform 90ms ease-in";
          lid.style.transform = "scaleY(1)";
          setTimeout(() => {
            lid.style.transition = "transform 160ms ease-out";
            lid.style.transform = "scaleY(0)";
          }, 120);
        }
        scheduleBlink();
      }, 2600 + Math.random() * 3400);
    }

    if (!reduced) {
      window.addEventListener("pointermove", onPointerMove, { passive: true });
      raf = requestAnimationFrame(tick);
      scheduleBlink();
    }

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      cancelAnimationFrame(raf);
      clearTimeout(blinkTimer);
    };
  }, [eye, shape.eye.rx]);

  const width = (shape.width / shape.height) * size;
  const clipId = `ain-eye-${variant}-${eye ? "live" : "flat"}`;
  const { cx, cy, rx, ry, rotate } = shape.eye;

  return (
    <svg
      ref={svgRef}
      viewBox={shape.viewBox}
      width={width}
      height={size}
      className={className}
      role={title ? "img" : "presentation"}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <path d={shape.path} fill="currentColor" fillRule="evenodd" />
      {eye ? (
        <g transform={`rotate(${rotate} ${cx} ${cy})`}>
          <clipPath id={clipId}>
            <ellipse cx={cx} cy={cy} rx={rx} ry={ry} />
          </clipPath>
          <g clipPath={`url(#${clipId})`}>
            <circle ref={pupilRef} cx={cx} cy={cy} r={ry * 0.62} fill={eyeColor} />
            <circle cx={cx + ry * 0.2} cy={cy - ry * 0.22} r={ry * 0.14} fill="#fff" opacity={0.85} />
            <ellipse
              ref={lidRef}
              cx={cx}
              cy={cy}
              rx={rx}
              ry={ry}
              fill="currentColor"
              style={{ transform: "scaleY(0)", transformOrigin: `${cx}px ${cy - ry}px` }}
            />
          </g>
        </g>
      ) : null}
    </svg>
  );
}
