"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Article, ArticleBlock } from "@/data/articles";
import type { ShelfBook } from "@/data/shelf";
import { AinMark } from "../ain-mark";

gsap.registerPlugin(ScrollTrigger);

type ReaderProps = {
  article: Article;
  book?: ShelfBook;
  previous?: Article;
  next?: Article;
};

function Block({ block }: { block: ArticleBlock }) {
  switch (block.type) {
    case "h2":
      return <h2 className="font-display mt-14 mb-6 text-3xl" style={{ color: "#2a1b10" }}>{block.text}</h2>;
    case "h3":
      return <h3 className="font-display mt-10 mb-4 text-2xl" style={{ color: "#3b2716" }}>{block.text}</h3>;
    case "quote":
      return (
        <blockquote
          className="my-10 border-r-2 pr-6 text-lg leading-loose"
          style={{ borderColor: "var(--accent)", color: "#5a4326", marginRight: 0 }}
        >
          {block.lines.map((line, i) => (
            <p key={i} className="m-0 mb-2" style={{ textAlign: "right" }}>
              {line}
            </p>
          ))}
        </blockquote>
      );
    case "poem":
      return (
        <div className="my-12 text-center">
          <div
            aria-hidden
            className="mx-auto mb-6 h-px w-16"
            style={{ background: "linear-gradient(90deg, transparent, var(--accent), transparent)" }}
          />
          {block.lines.map((line, i) => (
            <p key={i} className="font-naskh m-0 mb-3 text-xl leading-loose" style={{ color: "#3b2716" }}>
              {line}
            </p>
          ))}
          <div
            aria-hidden
            className="mx-auto mt-6 h-px w-16"
            style={{ background: "linear-gradient(90deg, transparent, var(--accent), transparent)" }}
          />
        </div>
      );
    default:
      return <p>{block.text}</p>;
  }
}

/**
 * Reading mode: the room dims, motion slows, and a single lamplit manuscript
 * column holds the text. Paragraphs surface as the reader descends.
 */
export function Reader({ article, book, previous, next }: ReaderProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [large, setLarge] = useState(false);

  useEffect(() => {
    document.body.classList.toggle("reader-large", large);
    return () => document.body.classList.remove("reader-large");
  }, [large]);

  useEffect(() => {
    function onScroll() {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const amount = scrollable > 0 ? window.scrollY / scrollable : 0;
      if (progressRef.current) {
        progressRef.current.style.transform = `scaleX(${amount})`;
      }
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || !rootRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-reader-head]",
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 1.2, ease: "power3.out" }
      );
      gsap.set("[data-reader-block]", { opacity: 0 });
      ScrollTrigger.batch("[data-reader-block]", {
        start: "top 92%",
        once: true,
        onEnter: (batch) =>
          gsap.fromTo(
            batch,
            { opacity: 0, y: 26 },
            { opacity: 1, y: 0, duration: 0.9, stagger: 0.08, ease: "power2.out" }
          )
      });
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={rootRef}
      className="relative min-h-svh"
      style={{
        background:
          "radial-gradient(ellipse 70% 40% at 50% 0%, rgba(255,140,26,0.06), transparent 60%), #0c0a08"
      }}
    >
      {/* reading progress */}
      <div
        aria-hidden
        className="fixed inset-x-0 top-0 z-[95] h-[3px]"
        style={{ background: "rgba(255,255,255,0.04)" }}
      >
        <div
          ref={progressRef}
          className="h-full origin-right"
          style={{
            transform: "scaleX(0)",
            background: "linear-gradient(90deg, var(--accent-soft), var(--accent))"
          }}
        />
      </div>

      <div className="mx-auto max-w-3xl px-4 pt-28 pb-20 sm:px-8">
        {/* manuscript header */}
        <header data-reader-head className="mb-4 text-center">
          <div className="mb-6 flex items-center justify-center gap-4 text-xs tracking-[0.25em] text-bronze">
            {book ? (
              <Link href={`/shelf/${book.slug}/`} className="no-underline transition-colors hover:text-accent" style={{ color: "var(--bronze)" }}>
                {book.title}
              </Link>
            ) : null}
            <span aria-hidden>·</span>
            <span>{article.date}</span>
            <span aria-hidden>·</span>
            <span>{article.readingTime}</span>
          </div>
          <h1 className="font-display text-balance m-0 text-4xl leading-snug text-parchment sm:text-5xl">
            {article.title}
          </h1>
          <p className="mt-4 mb-0 text-lg font-light" style={{ color: "var(--accent-soft)" }}>
            {article.subtitle}
          </p>
          <div className="mt-8 flex justify-center" style={{ color: "var(--bronze)" }}>
            <AinMark variant="a" size={42} />
          </div>
        </header>

        {/* the manuscript */}
        <article
          className="paper reader-body font-naskh relative mt-10 rounded-lg px-6 py-12 sm:px-14 sm:py-16"
          style={{
            color: "#241610",
            boxShadow:
              "0 40px 100px rgba(0,0,0,0.6), inset 0 0 60px rgba(138,107,69,0.12), 0 0 60px rgba(255,106,0,0.05)"
          }}
          dir="rtl"
        >
          {article.body.map((block, index) => (
            <div key={index} data-reader-block>
              <Block block={block} />
            </div>
          ))}

          <div className="mt-14 flex items-center justify-center gap-3" style={{ color: "var(--bronze)" }}>
            <span aria-hidden className="h-px w-12" style={{ background: "currentColor", opacity: 0.5 }} />
            <AinMark variant="a" size={28} />
            <span aria-hidden className="h-px w-12" style={{ background: "currentColor", opacity: 0.5 }} />
          </div>
        </article>

        {/* reader controls */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 text-sm">
          <button
            type="button"
            onClick={() => setLarge((v) => !v)}
            className="rounded-full border px-4 py-2 transition-colors hover:text-accent"
            style={{ borderColor: "var(--line)", background: "none", color: "var(--warm-gray)", font: "inherit" }}
          >
            {large ? "تصغير الخط" : "تكبير الخط"}
          </button>
          <a
            href={article.pdf}
            className="rounded-full border px-4 py-2 no-underline transition-colors hover:text-accent"
            style={{ borderColor: "var(--line)", color: "var(--warm-gray)" }}
          >
            النسخة الأصلية PDF
          </a>
        </div>

        {/* prev / next */}
        <nav aria-label="التنقل بين النصوص" className="mt-14 grid gap-4 sm:grid-cols-2">
          {previous ? (
            <Link
              href={previous.href}
              className="group rounded-xl border p-5 no-underline transition-transform duration-500 hover:-translate-y-1"
              style={{ borderColor: "var(--line)" }}
            >
              <span className="block text-xs text-bronze">النص السابق</span>
              <span className="font-display mt-2 block text-xl text-parchment transition-colors group-hover:text-accent">
                {previous.title}
              </span>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link
              href={next.href}
              className="group rounded-xl border p-5 text-left no-underline transition-transform duration-500 hover:-translate-y-1"
              style={{ borderColor: "var(--line)" }}
            >
              <span className="block text-xs text-bronze">النص التالي</span>
              <span className="font-display mt-2 block text-xl text-parchment transition-colors group-hover:text-accent">
                {next.title}
              </span>
            </Link>
          ) : (
            <span />
          )}
        </nav>

        <div className="mt-10 text-center">
          <Link
            href={book ? `/shelf/${book.slug}/` : "/"}
            className="text-sm tracking-wider no-underline transition-colors hover:text-accent"
            style={{ color: "var(--warm-gray)" }}
          >
            ← العودة إلى {book ? `كتاب ${book.title}` : "المكتبة"}
          </Link>
        </div>
      </div>
    </div>
  );
}
