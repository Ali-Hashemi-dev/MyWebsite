"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import type { Article } from "@/data/articles";
import type { ShelfBook } from "@/data/shelf";
import { AinMark } from "../ain-mark";
import { Dust } from "../dust";

type CategoryViewProps = {
  book: ShelfBook & { articles: Article[] };
};

function arabicNumeral(value: number) {
  return String(value)
    .replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[Number(d)])
    .padStart(2, "٠");
}

/**
 * The inside of a book: a parchment spread. The right page carries the
 * index of texts; the left page carries the book's character. On small
 * screens the spread folds into a single page.
 */
export function CategoryView({ book }: { book: CategoryViewProps["book"] }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const spreadRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || !rootRef.current) return;

    const arrived = window.sessionStorage.getItem("arrived-by-book") === book.slug;
    window.sessionStorage.removeItem("arrived-by-book");

    const ctx = gsap.context(() => {
      const tl = gsap.timeline();
      if (arrived) {
        /* continue the opening: the spread settles from the book animation */
        tl.fromTo(
          spreadRef.current,
          { scale: 1.12, opacity: 0, rotateX: 8 },
          { scale: 1, opacity: 1, rotateX: 0, duration: 1.1, ease: "power3.out" }
        );
      } else {
        tl.fromTo(
          spreadRef.current,
          { y: 40, opacity: 0 },
          { y: 0, opacity: 1, duration: 1, ease: "power3.out" }
        );
      }
      tl.fromTo(
        "[data-index-entry]",
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.7, stagger: 0.09, ease: "power2.out" },
        "-=0.4"
      );
    }, rootRef);

    return () => ctx.revert();
  }, [book.slug]);

  return (
    <div
      ref={rootRef}
      className="relative min-h-svh overflow-hidden px-4 pt-24 pb-16 sm:px-8"
      style={{
        background:
          "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(255,140,26,0.08), transparent 65%), linear-gradient(180deg, #0c0a08, #171008 60%, #0c0a08)"
      }}
    >
      <Dust density={0.5} />

      <div className="relative mx-auto max-w-5xl" style={{ perspective: "1800px" }}>
        <div
          ref={spreadRef}
          className="paper relative grid overflow-hidden rounded-lg md:grid-cols-2"
          style={{
            color: "var(--wood-deep)",
            boxShadow: "0 50px 120px rgba(0,0,0,0.65), 0 0 80px rgba(255,106,0,0.07)"
          }}
        >
          {/* gutter shadow between the two pages */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-1/2 hidden w-16 -translate-x-1/2 md:block"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(80,58,34,0.28) 48%, rgba(80,58,34,0.34) 52%, transparent)"
            }}
          />

          {/* right page (first in RTL): the index */}
          <section
            aria-labelledby="book-title"
            className="relative p-8 sm:p-12"
            style={{ borderLeft: "1px solid rgba(138,107,69,0.15)" }}
          >
            <span className="text-xs tracking-[0.3em]" style={{ color: "var(--bronze)" }}>
              فهرس الكتاب
            </span>
            <h1 id="book-title" className="font-display mt-3 mb-8 text-4xl" style={{ color: "#2a1b10" }}>
              {book.title}
            </h1>

            {book.articles.length === 0 ? (
              <p className="leading-loose" style={{ color: "var(--bronze)" }}>
                هذا الكتاب لم يُكتب بعد. صفحاته تنتظر حبرها الأول — عُد إليه قريباً.
              </p>
            ) : (
              <ol className="m-0 list-none p-0">
                {book.articles.map((article, index) => (
                  <li key={article.id} data-index-entry>
                    <Link
                      href={article.href}
                      className="group flex items-baseline gap-4 border-b py-5 no-underline transition-colors"
                      style={{ borderColor: "rgba(138,107,69,0.2)" }}
                    >
                      <span
                        className="font-display text-lg transition-colors group-hover:text-accent"
                        style={{ color: "var(--bronze)", minWidth: "1.6rem" }}
                      >
                        {arabicNumeral(index + 1)}
                      </span>
                      <span className="flex-1">
                        <span
                          className="font-display block text-2xl transition-colors duration-300 group-hover:text-accent"
                          style={{ color: "#241610" }}
                        >
                          {article.title}
                        </span>
                        <span className="mt-1 block text-sm" style={{ color: "#6d5636" }}>
                          {article.subtitle} · {article.readingTime}
                        </span>
                      </span>
                      <span
                        aria-hidden
                        className="translate-x-2 text-accent opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100"
                      >
                        ↞
                      </span>
                    </Link>
                  </li>
                ))}
              </ol>
            )}
          </section>

          {/* left page: the book's character */}
          <aside className="relative hidden flex-col justify-between p-12 md:flex">
            <div className="flex justify-center pt-6" style={{ color: "rgba(138,107,69,0.5)" }}>
              <AinMark variant="a" size={160} eye eyeColor="var(--accent)" />
            </div>
            <div>
              <p className="font-naskh text-lg leading-loose" style={{ color: "#4a3822" }}>
                {book.tagline}
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {[...new Set(book.articles.flatMap((a) => a.themes))].map((theme) => (
                  <span
                    key={theme}
                    className="rounded-full border px-3 py-1 text-xs"
                    style={{ borderColor: "rgba(138,107,69,0.4)", color: "var(--bronze)" }}
                  >
                    {theme}
                  </span>
                ))}
              </div>
            </div>
            <p className="text-xs tracking-widest" style={{ color: "rgba(138,107,69,0.7)" }}>
              من رفوف مكتبة علي هاشمي
            </p>
          </aside>
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/"
            className="text-sm tracking-wider no-underline transition-colors hover:text-accent"
            style={{ color: "var(--warm-gray)" }}
          >
            ← أعد الكتاب إلى الرف
          </Link>
        </div>
      </div>
    </div>
  );
}
