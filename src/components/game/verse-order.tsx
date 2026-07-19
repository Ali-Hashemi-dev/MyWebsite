"use client";

import { useCallback, useEffect, useState } from "react";
import { articles, type ArticleBlock } from "@/data/articles";
import { ambience } from "@/lib/ambience";

const MAX_LINES = 6;

type Poem = { title: string; lines: string[] };
type Strip = { id: number; text: string };
type Round = { title: string; original: string[]; shuffled: Strip[] };

/* every poem block of 4+ lines in the library, remembering its source */
const POEMS: Poem[] = articles.flatMap((article) =>
  article.body
    .filter((block): block is Extract<ArticleBlock, { type: "poem" }> => block.type === "poem")
    .filter((block) => block.lines.length >= 4)
    .map((block) => ({ title: article.title, lines: block.lines }))
);

/* the library never leaves the player empty-handed */
const FALLBACK: Poem = {
  title: "دفتر المكتبة",
  lines: [
    "في العتمةِ رفٌّ يتنفّسُ حبراً قديماً",
    "والقناديلُ تَعُدُّ خُطى الغائبين",
    "أفتحُ باباً من ورقٍ أصفرَ",
    "فيسقطُ من جيبِ الحكايةِ ظلّي",
    "وتبقى العينُ ساهرةً على السطرِ الأخير"
  ]
};

const SOURCE_POEMS = POEMS.length > 0 ? POEMS : [FALLBACK];

function shuffle<T>(items: T[]): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

function makeRound(): Round {
  const poem = SOURCE_POEMS[Math.floor(Math.random() * SOURCE_POEMS.length)];
  let lines = poem.lines;
  if (lines.length > MAX_LINES) {
    const start = Math.floor(Math.random() * (lines.length - MAX_LINES + 1));
    lines = lines.slice(start, start + MAX_LINES);
  }
  const strips = lines.map((text, id) => ({ id, text }));

  /* shuffle until the order actually differs from the original */
  let shuffled = shuffle(strips);
  let attempts = 0;
  while (attempts < 24 && shuffled.every((strip, i) => strip.text === lines[i])) {
    shuffled = shuffle(strips);
    attempts++;
  }
  if (shuffled.every((strip, i) => strip.text === lines[i])) {
    shuffled = [...shuffled.slice(1), shuffled[0]];
  }

  return { title: poem.title, original: lines, shuffled };
}

/**
 * ترتيب الأبيات — scattered poem lines rendered as parchment strips.
 * The player taps lines in the order they believe is right; each tapped
 * line climbs into the manuscript. No dragging — gentle on small screens.
 */
export function VerseOrder() {
  const [round, setRound] = useState<Round | null>(null);
  const [placedIds, setPlacedIds] = useState<number[]>([]);
  const [results, setResults] = useState<boolean[] | null>(null);

  /* the round is random, so it is born on the client only */
  useEffect(() => {
    setRound(makeRound());
  }, []);

  const newRound = useCallback(() => {
    setRound(makeRound());
    setPlacedIds([]);
    setResults(null);
  }, []);

  const retry = useCallback(() => {
    setPlacedIds([]);
    setResults(null);
  }, []);

  if (!round) return <div className="mx-auto min-h-[24rem] max-w-2xl" aria-hidden />;

  const total = round.original.length;
  const allPlaced = placedIds.length === total;
  const checked = results !== null;
  const score = results ? results.filter(Boolean).length : 0;
  const perfect = checked && score === total;
  const poolStrips = round.shuffled.filter((strip) => !placedIds.includes(strip.id));
  const textOf = (id: number) => round.original[id];

  function place(id: number) {
    if (checked) return;
    setPlacedIds((ids) => (ids.includes(id) ? ids : [...ids, id]));
  }

  function unplace(id: number) {
    if (checked) return;
    setPlacedIds((ids) => ids.filter((placed) => placed !== id));
  }

  function check() {
    if (!allPlaced || checked || !round) return;
    const verdict = placedIds.map((id, i) => textOf(id) === round.original[i]);
    setResults(verdict);
    if (verdict.every(Boolean)) ambience.playChime();
  }

  return (
    <div className="mx-auto max-w-2xl">
      <p className="mb-8 text-center text-sm leading-loose text-warm-gray">
        انقر الأسطر المبعثرة بالترتيب الذي تظنّه صحيحاً؛ يصعد كل سطرٍ إلى المخطوطة، وانقر سطراً في
        المخطوطة لتعيده.
      </p>

      {/* the manuscript: ordered slots the player fills */}
      <section aria-label="المخطوطة" className="mb-8">
        <h2 className="m-0 mb-3 text-xs tracking-[0.25em] text-bronze">المخطوطة</h2>
        <ol className="m-0 flex list-none flex-col gap-2 p-0">
          {Array.from({ length: total }, (_, i) => {
            const id = placedIds[i];
            if (id === undefined) {
              return (
                <li
                  key={`empty-${i}`}
                  className="rounded-xl border border-dashed px-4 py-3 text-sm"
                  style={{ borderColor: "var(--line)", color: "rgba(168,154,135,0.45)" }}
                >
                  السطر {i + 1}
                </li>
              );
            }
            const state = results?.[i];
            return (
              <li key={id}>
                <button
                  type="button"
                  onClick={() => unplace(id)}
                  disabled={checked}
                  aria-label={checked ? undefined : `أعد السطر إلى المبعثر: ${textOf(id)}`}
                  className="font-naskh block w-full rounded-xl border px-4 py-3 text-right text-base leading-loose transition-all duration-300"
                  style={{
                    background: "rgba(236,223,199,0.05)",
                    borderColor:
                      state === undefined ? "var(--line)" : state ? "var(--gold)" : "var(--accent)",
                    color: state === false ? "var(--accent-soft)" : "var(--parchment-dim)",
                    boxShadow:
                      state === true
                        ? "0 0 18px rgba(201,168,106,0.25)"
                        : state === false
                          ? "0 0 18px rgba(255,106,0,0.18)"
                          : "none",
                    cursor: checked ? "default" : "pointer",
                    font: "inherit"
                  }}
                >
                  {textOf(id)}
                </button>
              </li>
            );
          })}
        </ol>
      </section>

      {/* the scattered strips */}
      {poolStrips.length > 0 ? (
        <section aria-label="الأسطر المبعثرة">
          <h2 className="m-0 mb-3 text-xs tracking-[0.25em] text-bronze">الأسطر المبعثرة</h2>
          <div className="flex flex-col gap-2">
            {poolStrips.map((strip) => (
              <button
                key={strip.id}
                type="button"
                onClick={() => place(strip.id)}
                aria-label={`ضع السطر في المخطوطة: ${strip.text}`}
                className="font-naskh block w-full rounded-xl border px-4 py-3 text-right text-base leading-loose text-parchment-dim transition-all duration-300 hover:-translate-y-0.5"
                style={{
                  background: "rgba(236,223,199,0.04)",
                  borderColor: "var(--line)",
                  cursor: "pointer",
                  font: "inherit"
                }}
              >
                {strip.text}
              </button>
            ))}
          </div>
        </section>
      ) : null}

      <div className="mt-10 text-center">
        {allPlaced && !checked ? (
          <button
            type="button"
            onClick={check}
            className="rounded-full px-8 py-3 font-bold transition-transform duration-300 hover:scale-105"
            style={{ background: "var(--accent)", color: "var(--ink)", border: 0, font: "inherit" }}
          >
            تحقّق
          </button>
        ) : null}

        {checked ? (
          <div
            className="rounded-2xl border p-6"
            style={{ borderColor: "var(--line)", background: "rgba(236,223,199,0.03)" }}
          >
            <p className="font-display m-0 text-2xl text-parchment">
              {perfect ? "اكتمل النظم" : `أصبت ${score} من ${total}`}
            </p>
            <p className="mt-3 mb-0 text-sm leading-loose text-warm-gray">
              {perfect ? "عادت الأبيات إلى بيتها كما كُتبت أول مرة." : "بعض الأسطر ما زالت تحنّ إلى مكانها."}
              {" — "}من «{round.title}»
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              {!perfect ? (
                <button
                  type="button"
                  onClick={retry}
                  className="rounded-full px-6 py-2.5 font-bold transition-transform duration-300 hover:scale-105"
                  style={{ background: "var(--accent)", color: "var(--ink)", border: 0, font: "inherit" }}
                >
                  إعادة المحاولة
                </button>
              ) : null}
              <button
                type="button"
                onClick={newRound}
                className="rounded-full border px-6 py-2.5 transition-colors duration-300 hover:text-accent"
                style={{
                  borderColor: "var(--line)",
                  background: "transparent",
                  color: "var(--warm-gray)",
                  font: "inherit",
                  cursor: "pointer"
                }}
              >
                قصيدة أخرى
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
