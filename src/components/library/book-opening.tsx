"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import type { Article } from "@/data/articles";
import type { ShelfBook } from "@/data/shelf";
import { AinMark } from "../ain-mark";

type BookOpeningProps = {
  book: ShelfBook & { articles: Article[] };
  /** Bounding rect of the clicked spine, so the book flies from its place. */
  fromRect: DOMRect;
  onDone: () => void;
};

/**
 * The transition that carries a reader from shelf to book: the volume leaves
 * its place, floats to the center, turns to face the reader, its cover opens
 * onto lamplit paper, and the camera leans in. Reduced motion gets a plain
 * cross-fade.
 */
export function BookOpening({ book, fromRect, onDone }: BookOpeningProps) {
  const backdropRef = useRef<HTMLDivElement>(null);
  const bookRef = useRef<HTMLDivElement>(null);
  const coverRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const cameraRef = useRef<HTMLDivElement>(null);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      const t = setTimeout(() => doneRef.current(), 350);
      if (backdropRef.current) backdropRef.current.style.opacity = "1";
      return () => clearTimeout(t);
    }

    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const startX = fromRect.left + fromRect.width / 2;
    const startY = fromRect.top + fromRect.height / 2;

    const tl = gsap.timeline({
      defaults: { ease: "power3.inOut" },
      onComplete: () => doneRef.current()
    });

    tl.fromTo(backdropRef.current, { opacity: 0 }, { opacity: 1, duration: 0.5 }, 0)
      /* the book leaves the shelf and drifts to the center of the room */
      .fromTo(
        bookRef.current,
        {
          x: startX - centerX,
          y: startY - centerY,
          scale: Math.max(0.3, fromRect.height / 320),
          rotateY: 68,
          rotateZ: -2
        },
        { x: 0, y: 0, scale: 1, rotateY: 0, rotateZ: 0, duration: 1.05, ease: "power2.inOut" },
        0.05
      )
      /* the cover swings open */
      .to(coverRef.current, { rotateY: 130, duration: 0.9, ease: "power2.inOut" }, ">-0.15")
      .fromTo(pageRef.current, { opacity: 0.4 }, { opacity: 1, duration: 0.5 }, "<0.2")
      /* the camera leans into the page */
      .to(cameraRef.current, { scale: 2.1, y: 40, duration: 0.8, ease: "power2.in" }, ">0.25")
      .to(backdropRef.current, { opacity: 0, duration: 0.35, ease: "none" }, ">-0.3");

    return () => {
      tl.kill();
    };
  }, [fromRect]);

  return (
    <div
      ref={backdropRef}
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 110,
        opacity: 0,
        background: "radial-gradient(ellipse at 50% 45%, rgba(36, 22, 16, 0.96), rgba(8, 6, 4, 0.99))",
        overflow: "hidden"
      }}
    >
      <div
        ref={cameraRef}
        style={{
          position: "absolute",
          inset: 0,
          display: "grid",
          placeItems: "center",
          perspective: "1600px"
        }}
      >
        <div
          ref={bookRef}
          style={{
            position: "relative",
            width: "min(64vw, 21rem)",
            height: "min(86vh, 30rem)",
            transformStyle: "preserve-3d",
            filter: "drop-shadow(0 40px 80px rgba(0,0,0,0.7))"
          }}
        >
          {/* open page beneath the cover */}
          <div
            ref={pageRef}
            className="paper"
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "6px 10px 10px 6px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "1rem",
              padding: "2rem",
              color: "var(--wood-deep)",
              boxShadow: "inset -18px 0 30px rgba(138,107,69,0.25)"
            }}
          >
            <AinMark variant="a" size={66} />
            <div className="font-display" style={{ fontSize: "1.6rem", textAlign: "center" }}>
              {book.title}
            </div>
            <div
              style={{
                fontSize: "0.85rem",
                color: "var(--bronze)",
                textAlign: "center",
                lineHeight: 1.9
              }}
            >
              {book.tagline}
            </div>
          </div>
          {/* the cover: hinged on the right edge (RTL book) */}
          <div
            ref={coverRef}
            style={{
              position: "absolute",
              inset: 0,
              transformOrigin: "right center",
              transformStyle: "preserve-3d",
              borderRadius: "6px 10px 10px 6px",
              background: `linear-gradient(150deg, ${book.binding.from}, ${book.binding.to})`,
              boxShadow: "inset 0 0 0 1px rgba(255,214,150,0.12), inset 0 0 60px rgba(0,0,0,0.5)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "1.2rem",
              backfaceVisibility: "hidden"
            }}
          >
            <AinMark variant="a" size={82} className="text-gold" />
            <div className="font-display" style={{ color: "var(--gold)", fontSize: "1.8rem" }}>
              {book.title}
            </div>
            <div
              aria-hidden
              style={{
                position: "absolute",
                inset: "0.8rem",
                border: "1px solid rgba(201,168,106,0.35)",
                borderRadius: "4px",
                pointerEvents: "none"
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
