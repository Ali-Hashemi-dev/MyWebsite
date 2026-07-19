"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Article } from "@/data/articles";
import { useLiveArticles } from "@/lib/live-articles";
import { AinMark } from "./ain-mark";
import { useAinVariant } from "./identity-provider";

gsap.registerPlugin(ScrollTrigger);

/**
 * The quiet rooms beneath the shelf: a word about the writer, the latest
 * manuscripts, and the colophon. Everything reveals itself gradually.
 */
export function HomeSections({ recent, aboutExcerpt }: { recent: Article[]; aboutExcerpt: string }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const { variant } = useAinVariant();

  /* freshly published texts join the latest manuscripts before the rebuild */
  const { live } = useLiveArticles();

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || !rootRef.current) return;

    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 42 },
          {
            opacity: 1,
            y: 0,
            duration: 1.1,
            ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 82%" }
          }
        );
      });
      gsap.utils.toArray<HTMLElement>("[data-reveal-stagger]").forEach((group) => {
        gsap.fromTo(
          group.children,
          { opacity: 0, y: 34 },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            stagger: 0.14,
            ease: "power3.out",
            scrollTrigger: { trigger: group, start: "top 80%" }
          }
        );
      });
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={rootRef}>
      {/* ------------------------------------------------ about teaser */}
      <section
        aria-labelledby="about-heading"
        className="relative flex min-h-[70svh] items-center justify-center px-6 py-24"
        style={{ background: "linear-gradient(180deg, #120c07, #0c0a08)" }}
      >
        <div data-reveal className="max-w-2xl text-center">
          <div className="mb-6 flex justify-center text-bronze">
            <AinMark variant={variant} size={60} eye />
          </div>
          <h2 id="about-heading" className="font-display mb-6 text-3xl text-parchment sm:text-4xl">
            صاحب المكتبة
          </h2>
          <p className="text-balance leading-loose font-light text-warm-gray">{aboutExcerpt}</p>
          <Link
            href="/about/"
            className="mt-8 inline-block border-b border-accent pb-1 text-sm tracking-wider text-accent no-underline transition-opacity hover:opacity-70"
          >
            اقرأ الحكاية كاملة
          </Link>
        </div>
      </section>

      {/* ------------------------------------------------ latest texts */}
      <section aria-labelledby="recent-heading" className="px-6 pt-8 pb-28">
        <div className="mx-auto max-w-4xl">
          <h2
            id="recent-heading"
            data-reveal
            className="font-display mb-12 text-center text-3xl text-parchment sm:text-4xl"
          >
            أحدث المخطوطات
          </h2>
          <div data-reveal-stagger className="grid gap-5 sm:grid-cols-3">
            {recent.map((article) => (
              <Link
                key={article.id}
                href={article.href}
                className="group relative overflow-hidden rounded-xl border p-6 no-underline transition-transform duration-500 hover:-translate-y-1.5"
                style={{ borderColor: "var(--line)", background: "rgba(236, 223, 199, 0.03)" }}
              >
                <span className="block text-xs tracking-widest text-bronze">{article.genre}</span>
                <span className="font-display mt-3 block text-xl text-parchment transition-colors duration-300 group-hover:text-accent">
                  {article.title}
                </span>
                <span className="mt-3 block text-sm leading-relaxed font-light text-warm-gray">
                  {article.summary}
                </span>
                <span className="mt-5 block text-xs text-bronze">{article.readingTime}</span>
                <span
                  aria-hidden
                  className="absolute inset-x-0 bottom-0 h-px scale-x-0 bg-accent transition-transform duration-500 group-hover:scale-x-100"
                />
              </Link>
            ))}
            {/* committed but not baked yet — straight from the repo */}
            {live.map((article) => (
              <Link
                key={`live-${article.file}`}
                href={article.href}
                className="group relative overflow-hidden rounded-xl border p-6 no-underline transition-transform duration-500 hover:-translate-y-1.5"
                style={{ borderColor: "rgba(255,106,0,0.35)", background: "rgba(236, 223, 199, 0.03)" }}
              >
                <span className="block text-xs tracking-widest text-bronze">
                  {article.genre}
                  <span
                    className="mr-2 inline-block rounded-full border px-2 py-0.5 text-[0.55rem] tracking-widest"
                    style={{ borderColor: "rgba(255,106,0,0.5)", color: "var(--accent)" }}
                  >
                    جديد
                  </span>
                </span>
                <span className="font-display mt-3 block text-xl text-parchment transition-colors duration-300 group-hover:text-accent">
                  {article.title}
                </span>
                <span className="mt-3 block text-sm leading-relaxed font-light text-warm-gray">
                  {article.summary}
                </span>
                <span className="mt-5 block text-xs text-bronze">{article.readingTime}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------ colophon */}
      <footer
        className="border-t px-6 py-12 text-center text-sm text-warm-gray"
        style={{ borderColor: "var(--line)" }}
      >
        <div className="mb-4 flex justify-center text-bronze">
          <AinMark variant={variant} size={36} />
        </div>
        <p className="m-0 font-light">
          مكتبة عين — نصوص عربية تُكتب على مهل. جميع الحقوق محفوظة © 2026
        </p>
        <p className="m-0 mt-3 text-xs">
          <Link
            href="/admin/"
            className="no-underline transition-colors hover:text-accent"
            style={{ color: "var(--bronze)", opacity: 0.75 }}
          >
            باب المكتب
          </Link>
        </p>
      </footer>
    </div>
  );
}
