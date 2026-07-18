"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { AIN, type AinVariant } from "@/lib/ain";
import { AinMark } from "../ain-mark";
import { useAinVariant } from "../identity-provider";

const VARIANTS: Array<{ id: AinVariant; name: string; note: string }> = [
  {
    id: "a",
    name: "الصيغة الأولى — المتوسّطة",
    note: "جسم مضغوط وعين مركزية؛ يقرأ بوضوح حتى في ١٦ بكسل، ويتوازن كمؤشر."
  },
  {
    id: "b",
    name: "الصيغة الثانية — النهائية",
    note: "بذيل نازل يمنح حضوراً خطّياً أقوى؛ يتألق كشعار كبير وعلى الأغلفة."
  }
];

/**
 * المِرسم — the identity lab. Both letterforms side by side, tried on as
 * icon, cursor, and living eye. Choosing one applies it across the site
 * (cursor + seals) and remembers the choice.
 */
export function Lab() {
  const { variant, setVariant } = useAinVariant();
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || !rootRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-lab-reveal]",
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.9, stagger: 0.12, ease: "power3.out" }
      );
    }, rootRef);
    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={rootRef}
      className="min-h-svh px-5 pt-28 pb-20 sm:px-8"
      style={{
        background:
          "radial-gradient(ellipse 70% 40% at 50% 0%, rgba(255,140,26,0.07), transparent 60%), #0c0a08"
      }}
    >
      <div className="mx-auto max-w-5xl">
        <header data-lab-reveal className="mb-14 text-center">
          <span className="text-xs tracking-[0.3em] text-bronze">مختبر الهوية</span>
          <h1 className="font-display mt-3 mb-4 text-4xl text-parchment sm:text-5xl">المِرسم</h1>
          <p className="mx-auto max-w-xl leading-loose font-light text-warm-gray">
            حرف العين من اسم عليّ، مقصوصٌ بصيغتين. جرّب كلاً منهما كأيقونة، وكمؤشرٍ للفأرة،
            وكعينٍ حيّة ترمش وتتبع نظرك — ثم اختر أيّهما يسكن المكتبة.
          </p>
        </header>

        <div className="grid gap-8 md:grid-cols-2">
          {VARIANTS.map((entry) => {
            const active = variant === entry.id;
            const shape = AIN[entry.id];
            return (
              <section
                key={entry.id}
                data-lab-reveal
                aria-labelledby={`variant-${entry.id}`}
                className="relative overflow-hidden rounded-2xl border p-8 transition-shadow duration-500"
                style={{
                  borderColor: active ? "var(--accent)" : "var(--line)",
                  background: "rgba(236,223,199,0.03)",
                  boxShadow: active ? "0 0 60px rgba(255,106,0,0.12)" : "none"
                }}
              >
                {active ? (
                  <span
                    className="absolute top-4 left-4 rounded-full px-3 py-1 text-xs font-bold"
                    style={{ background: "var(--accent)", color: "var(--ink)" }}
                  >
                    المعتمدة الآن
                  </span>
                ) : null}

                <h2 id={`variant-${entry.id}`} className="font-display m-0 text-2xl text-parchment">
                  {entry.name}
                </h2>
                <p className="mt-2 mb-8 text-sm leading-relaxed font-light text-warm-gray">{entry.note}</p>

                {/* the living eye, large */}
                <div
                  className="flex justify-center rounded-xl py-10"
                  style={{ background: "rgba(12,10,8,0.6)", color: "var(--parchment)" }}
                >
                  <AinMark variant={entry.id} size={190} eye title={`الحرف ع — ${entry.name}`} />
                </div>

                {/* icon scale ladder */}
                <div className="mt-8">
                  <span className="mb-3 block text-xs tracking-widest text-bronze">كأيقونة — تدرّج الأحجام</span>
                  <div
                    className="flex items-end justify-center gap-6 rounded-xl px-4 py-6"
                    style={{ background: "rgba(12,10,8,0.6)", color: "var(--parchment)" }}
                  >
                    {[64, 40, 28, 20, 14].map((size) => (
                      <span key={size} className="flex flex-col items-center gap-2">
                        <AinMark variant={entry.id} size={size} />
                        <span className="text-[0.6rem] text-warm-gray">{size}px</span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* accent treatment */}
                <div className="mt-6 flex items-center justify-center gap-8 rounded-xl px-4 py-6" style={{ background: "rgba(12,10,8,0.6)" }}>
                  <span style={{ color: "var(--accent)", filter: "drop-shadow(0 0 12px var(--accent-glow))" }}>
                    <AinMark variant={entry.id} size={44} />
                  </span>
                  <span style={{ color: "var(--gold)" }}>
                    <AinMark variant={entry.id} size={44} />
                  </span>
                  <span style={{ color: "var(--parchment)" }}>
                    <AinMark variant={entry.id} size={44} eye />
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setVariant(entry.id)}
                  disabled={active}
                  className="mt-8 w-full rounded-full border px-6 py-3 font-bold transition-all duration-300"
                  style={{
                    borderColor: active ? "var(--accent)" : "var(--line)",
                    background: active ? "var(--accent)" : "transparent",
                    color: active ? "var(--ink)" : "var(--parchment)",
                    font: "inherit",
                    cursor: active ? "default" : undefined
                  }}
                >
                  {active ? "هذه هي هوية الموقع الحالية" : "اعتمد هذه الصيغة كمؤشر وهوية"}
                </button>

                <p className="mt-3 mb-0 text-center text-xs text-warm-gray">
                  نسبة العرض إلى الارتفاع: {(shape.width / shape.height).toFixed(2)}
                </p>
              </section>
            );
          })}
        </div>

        <p data-lab-reveal className="mt-12 text-center text-sm leading-loose font-light text-warm-gray">
          اختيارك يُحفظ في متصفحك ويطبَّق فوراً على مؤشر الفأرة وأختام الموقع.
          حرّك المؤشر فوق أي رابط لترى المؤشر يشتعل بالبرتقالي، وراقب العين — إنها ترمش.
        </p>
      </div>
    </div>
  );
}
