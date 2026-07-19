"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ambience } from "@/lib/ambience";
import { AinMark } from "@/components/ain-mark";

/* eight literary words of the library — each hides twice in the dark */
const WORDS = ["حبر", "سراج", "صدى", "غيمة", "ظلّ", "مرآة", "رفّ", "حكاية"];
const PAIRS = WORDS.length;

type Card = { key: number; word: string };

function makeDeck(): Card[] {
  const deck = WORDS.flatMap((word, i) => [
    { key: i * 2, word },
    { key: i * 2 + 1, word }
  ]);
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

/**
 * ذاكرة الحروف — a 4x4 memory game. Card backs are dark wax seals
 * stamped with the ع; fronts are parchment slips carrying a word.
 * Find each word's twin among the sixteen sealed cards.
 */
export function LetterMemory() {
  const [deck, setDeck] = useState<Card[] | null>(null);
  const [faceUp, setFaceUp] = useState<number[]>([]);
  const [matched, setMatched] = useState<Set<number>>(new Set());
  const [moves, setMoves] = useState(0);
  const [locked, setLocked] = useState(false);
  const [reduced, setReduced] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* the deck is shuffled, so it is dealt on the client only */
  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    setDeck(makeDeck());
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const reset = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setDeck(makeDeck());
    setFaceUp([]);
    setMatched(new Set());
    setMoves(0);
    setLocked(false);
  }, []);

  const won = matched.size === PAIRS * 2;

  function flip(index: number) {
    if (!deck || locked || won) return;
    if (faceUp.includes(index) || matched.has(index)) return;

    const next = [...faceUp, index];
    setFaceUp(next);
    if (next.length < 2) return;

    /* two cards face up: the table locks while they are read */
    setMoves((m) => m + 1);
    setLocked(true);
    const [a, b] = next;
    const isMatch = deck[a].word === deck[b].word;

    timerRef.current = setTimeout(
      () => {
        if (isMatch) {
          setMatched((prev) => new Set([...prev, a, b]));
          ambience.playChime();
        }
        setFaceUp([]);
        setLocked(false);
      },
      isMatch ? 450 : 900
    );
  }

  if (!deck) return <div className="mx-auto min-h-[24rem] max-w-md" aria-hidden />;

  return (
    <div className="mx-auto max-w-md">
      <p className="mb-6 text-center text-sm leading-loose text-warm-gray">
        اقلب بطاقتين في كل محاولة؛ إن تطابقت الكلمتان بقيتا مضاءتين على الرف.
      </p>

      <div
        className="mb-5 flex items-center justify-center gap-6 text-sm text-warm-gray"
        aria-live="polite"
      >
        <span>المحاولات: {moves}</span>
        <span>الأزواج: {matched.size / 2} من {PAIRS}</span>
      </div>

      <div className="relative">
        <div className="grid grid-cols-4 gap-2.5 sm:gap-3" role="group" aria-label="بطاقات ذاكرة الحروف">
          {deck.map((card, index) => {
            const isMatched = matched.has(index);
            const up = isMatched || faceUp.includes(index);
            return (
              <button
                key={card.key}
                type="button"
                onClick={() => flip(index)}
                disabled={locked || up || won}
                aria-label={up ? `بطاقة مكشوفة: ${card.word}` : "بطاقة مختومة مقلوبة"}
                className="relative aspect-square w-full border-0 bg-transparent p-0"
                style={{ perspective: "600px", cursor: up || locked ? "default" : "pointer" }}
              >
                <div
                  className="absolute inset-0"
                  style={{
                    transformStyle: "preserve-3d",
                    transform: up ? "rotateY(180deg)" : "rotateY(0deg)",
                    transition: reduced ? "none" : "transform 0.55s cubic-bezier(0.4, 0.1, 0.2, 1)"
                  }}
                >
                  {/* back: a dark wax seal bearing the ع */}
                  <div
                    className="absolute inset-0 flex items-center justify-center rounded-xl border"
                    style={{
                      backfaceVisibility: "hidden",
                      WebkitBackfaceVisibility: "hidden",
                      borderColor: "var(--line)",
                      background: "linear-gradient(160deg, #16110b, #0a0806)"
                    }}
                  >
                    <span
                      className="flex h-11 w-11 items-center justify-center rounded-full sm:h-12 sm:w-12"
                      style={{
                        background: "radial-gradient(circle at 38% 32%, #2a1e10, #140e07 70%)",
                        boxShadow: "inset 0 0 0 1px rgba(201,168,106,0.22)",
                        color: "var(--bronze)"
                      }}
                    >
                      <AinMark variant="c" size={22} />
                    </span>
                  </div>

                  {/* front: a parchment slip with the word */}
                  <div
                    className="absolute inset-0 flex items-center justify-center rounded-xl border"
                    style={{
                      backfaceVisibility: "hidden",
                      WebkitBackfaceVisibility: "hidden",
                      transform: "rotateY(180deg)",
                      borderColor: isMatched ? "var(--gold)" : "rgba(201,168,106,0.35)",
                      background: "linear-gradient(165deg, var(--parchment), #d9c8a8)",
                      boxShadow: isMatched ? "0 0 16px rgba(201,168,106,0.35)" : "none",
                      transition: "box-shadow 0.4s ease, border-color 0.4s ease"
                    }}
                  >
                    <span className="font-naskh text-base sm:text-lg" style={{ color: "var(--ink)" }}>
                      {card.word}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* win panel */}
        {won ? (
          <div
            className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 rounded-2xl p-6 text-center"
            style={{ background: "rgba(10, 8, 6, 0.85)", backdropFilter: "blur(6px)" }}
          >
            <span style={{ color: "var(--accent)" }}>
              <AinMark variant="c" size={56} />
            </span>
            <p className="font-display m-0 text-3xl text-parchment">اكتملت الذاكرة</p>
            <p className="m-0 text-sm text-warm-gray">
              عاد كل زوجٍ إلى توأمه في {moves} محاولة.
            </p>
            <button
              type="button"
              onClick={reset}
              className="rounded-full px-8 py-3 font-bold transition-transform duration-300 hover:scale-105"
              style={{ background: "var(--accent)", color: "var(--ink)", border: 0, font: "inherit" }}
            >
              مجدداً
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
