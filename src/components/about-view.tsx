"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { aboutParagraphs } from "@/data/articles";
import { AinMark } from "./ain-mark";
import { useAinVariant } from "./identity-provider";
import { Dust } from "./dust";

gsap.registerPlugin(ScrollTrigger);

/**
 * The writer's room: a single portrait-lit page about Ali, told slowly.
 */
export function AboutView() {
  const rootRef = useRef<HTMLDivElement>(null);
  const { variant } = useAinVariant();

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || !rootRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-about-head]",
        { opacity: 0, y: 26 },
        { opacity: 1, y: 0, duration: 1.1, ease: "power3.out" }
      );
      gsap.utils.toArray<HTMLElement>("[data-about-p]").forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 32 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 86%" }
          }
        );
      });
    }, rootRef);
    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={rootRef}
      className="relative min-h-svh overflow-hidden px-5 pt-28 pb-24 sm:px-8"
      style={{
        background:
          "radial-gradient(ellipse 70% 45% at 50% 0%, rgba(255,140,26,0.08), transparent 60%), linear-gradient(180deg, #0c0a08, #171008 70%, #0c0a08)"
      }}
    >
      <Dust density={0.5} />
      <div className="relative mx-auto max-w-2xl">
        <header data-about-head className="mb-16 text-center">
          <div className="mb-8 flex justify-center" style={{ color: "var(--bronze)" }}>
            <AinMark variant={variant} size={130} eye title="الحرف ع — ختم علي هاشمي" />
          </div>
          <span className="text-xs tracking-[0.3em] text-bronze">صاحب المكتبة</span>
          <h1 className="font-display mt-3 m-0 text-4xl text-parchment sm:text-5xl">علي هاشمي</h1>
          <p className="mt-4 mb-0 font-light" style={{ color: "var(--accent-soft)" }}>
            كاتب لبناني — قصة، مقال، شعر حر
          </p>
        </header>

        <div className="space-y-10">
          {aboutParagraphs.map((paragraph, index) => (
            <p
              key={index}
              data-about-p
              className="font-naskh m-0 text-lg leading-[2.4] font-light text-parchment-dim"
            >
              {paragraph}
            </p>
          ))}
        </div>

        <div data-about-p className="mt-16 text-center">
          <Link
            href="/"
            className="inline-block rounded-full border px-8 py-3 text-sm tracking-wider no-underline transition-all duration-300 hover:text-accent"
            style={{ borderColor: "var(--line)", color: "var(--warm-gray)" }}
          >
            ادخل المكتبة
          </Link>
        </div>
      </div>
    </div>
  );
}
