"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import type { Article } from "@/data/articles";
import type { ShelfBook } from "@/data/shelf";
import { AinMark } from "../ain-mark";
import { useAinVariant } from "../identity-provider";
import { Dust } from "../dust";
import { Arches } from "./arches";
import { BookSpine } from "./book-spine";
import { BookOpening } from "./book-opening";
import styles from "./library.module.css";

const INTRO_KEY = "library-intro-seen";

type LoadedBook = ShelfBook & { articles: Article[] };

export function LibraryScene({ books }: { books: LoadedBook[] }) {
  const router = useRouter();
  const { variant } = useAinVariant();
  const sceneRef = useRef<HTMLDivElement>(null);
  const archesRef = useRef<HTMLDivElement>(null);
  const shaftsRef = useRef<HTMLDivElement>(null);
  const shelfRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const introRef = useRef<HTMLDivElement>(null);

  const [showIntro, setShowIntro] = useState(false);
  const [introDone, setIntroDone] = useState(false);
  const [opening, setOpening] = useState<{ book: LoadedBook; rect: DOMRect } | null>(null);

  /* ---------------------------------------------------------------- */
  /* Cinematic first load: darkness, the ع seal, then the room wakes  */
  /* ---------------------------------------------------------------- */
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const seen = window.sessionStorage.getItem(INTRO_KEY);
    if (reduced || seen) {
      setIntroDone(true);
      return;
    }
    setShowIntro(true);
  }, []);

  useEffect(() => {
    if (!showIntro || !introRef.current) return;
    window.sessionStorage.setItem(INTRO_KEY, "1");

    const tl = gsap.timeline({
      onComplete: () => {
        setShowIntro(false);
        setIntroDone(true);
      }
    });

    tl.fromTo(
      "[data-intro-mark]",
      { opacity: 0, scale: 0.86, y: 14 },
      { opacity: 1, scale: 1, y: 0, duration: 1.1, ease: "power2.out" }
    )
      .fromTo(
        "[data-intro-title]",
        { opacity: 0, y: 18, filter: "blur(6px)" },
        { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.9, ease: "power2.out" },
        "-=0.5"
      )
      .to(introRef.current, { opacity: 0, duration: 0.9, ease: "power2.inOut", delay: 0.7 });

    const skip = () => tl.progress(1);
    window.addEventListener("pointerdown", skip);
    window.addEventListener("keydown", skip);
    return () => {
      tl.kill();
      window.removeEventListener("pointerdown", skip);
      window.removeEventListener("keydown", skip);
    };
  }, [showIntro]);

  /* the room itself settles once the intro lifts */
  useEffect(() => {
    if (!introDone || !sceneRef.current) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        sceneRef.current,
        { scale: 1.06 },
        { scale: 1, duration: 2.4, ease: "power2.out" }
      );
      gsap.fromTo(
        shelfRef.current,
        { y: 46, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.4, ease: "power3.out", delay: 0.15 }
      );
      gsap.fromTo(
        titleRef.current,
        { y: 24, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.3, ease: "power3.out", delay: 0.35 }
      );
    });
    return () => ctx.revert();
  }, [introDone]);

  /* ---------------------------------------------------------------- */
  /* Mouse parallax: each layer drifts at its own depth                */
  /* ---------------------------------------------------------------- */
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = window.matchMedia("(pointer: fine)").matches;
    if (reduced || !fine) return;

    const layers = [
      { el: archesRef.current, depth: 8 },
      { el: shaftsRef.current, depth: 14 },
      { el: shelfRef.current, depth: 22 },
      { el: titleRef.current, depth: -10 }
    ].filter((l): l is { el: HTMLDivElement; depth: number } => Boolean(l.el));

    const movers = layers.map(({ el, depth }) => ({
      x: gsap.quickTo(el, "x", { duration: 0.9, ease: "power3.out" }),
      y: gsap.quickTo(el, "y", { duration: 0.9, ease: "power3.out" }),
      depth
    }));

    function onMove(event: PointerEvent) {
      const nx = event.clientX / window.innerWidth - 0.5;
      const ny = event.clientY / window.innerHeight - 0.5;
      for (const mover of movers) {
        mover.x(nx * mover.depth);
        mover.y(ny * mover.depth * 0.5);
      }
    }

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [introDone]);

  function openBook(book: LoadedBook, element: HTMLButtonElement) {
    setOpening({ book, rect: element.getBoundingClientRect() });
  }

  return (
    <section className={styles.scene} aria-label="رفّ المكتبة">
      <div ref={sceneRef} style={{ position: "absolute", inset: 0, willChange: "transform" }}>
        <div ref={archesRef} className={`${styles.layer} ${styles.arches}`}>
          <Arches />
        </div>
        <div ref={shaftsRef} className={styles.layer}>
          <div className={styles.shaft} style={{ right: "16%" }} />
          <div className={styles.shaft} style={{ right: "46%", animationDelay: "-6s", opacity: 0.7 }} />
          <div className={styles.shaft} style={{ right: "72%", animationDelay: "-3s", opacity: 0.5 }} />
        </div>
        <Dust />

        <div ref={titleRef} className={styles.titleBlock}>
          <span className={styles.kicker}>مَكتبة</span>
          <h1 className={`${styles.title} font-display`}>عَلي هاشمي</h1>
          <p className={styles.subtitle}>
            خمسة كتب تسكن رفاً واحداً؛ في كل كتاب نصوص تُقرأ كما تُفتح الأبواب القديمة: على مهل،
            وبفضول.
          </p>
        </div>

        <div ref={shelfRef} className={styles.shelfArea}>
          <div className={styles.shelfRow} role="list" aria-label="كتب المكتبة">
            {books.map((book) => (
              <div role="listitem" key={book.slug} style={{ display: "contents" }}>
                <BookSpine book={book} onOpen={openBook} />
              </div>
            ))}
          </div>
          <div className={styles.plankFace} aria-hidden />
          <div className={styles.plankShadow} aria-hidden />
        </div>

        <div className={styles.scrollHint} aria-hidden>
          <span>اهبط</span>
        </div>
      </div>

      {showIntro ? (
        <div ref={introRef} className={styles.intro} aria-hidden>
          <span data-intro-mark style={{ color: "var(--accent)" }}>
            <AinMark variant={variant} size={110} eye />
          </span>
          <span data-intro-title className={`${styles.introTitle} font-display`}>
            مكتبة علي هاشمي
          </span>
          <span className={styles.introHint}>اضغط للدخول</span>
        </div>
      ) : null}

      {opening ? (
        <BookOpening
          book={opening.book}
          fromRect={opening.rect}
          onDone={() => {
            window.sessionStorage.setItem("arrived-by-book", opening.book.slug);
            router.push(`/shelf/${opening.book.slug}/`);
          }}
        />
      ) : null}
    </section>
  );
}
