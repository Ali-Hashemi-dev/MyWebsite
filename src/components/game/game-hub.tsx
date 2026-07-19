"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";

/**
 * قاعة الألعاب — the hub of the library's games wing. Three doors,
 * three small rooms of ink and play.
 */
const ROOMS = [
  {
    href: "/game/hunt/",
    kicker: "القاعة الأولى",
    title: "صيد العين",
    description: "حروفٌ تصعد في العتمة كالشرر، وبينها تختبئ العين — اصطدها وأضئ القناديل السبعة."
  },
  {
    href: "/game/verses/",
    kicker: "القاعة الثانية",
    title: "ترتيب الأبيات",
    description: "أسطرٌ فرّت من قصائدها وتبعثرت على الرف؛ أعد نظمها كما كُتبت أول مرة."
  },
  {
    href: "/game/memory/",
    kicker: "القاعة الثالثة",
    title: "ذاكرة الحروف",
    description: "بطاقاتٌ مختومةٌ بالعين تُخفي كلماتِ المكتبة؛ اقلبها واسترجع كلَّ كلمةٍ إلى توأمها."
  }
];

export function GameHub() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || !rootRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-hub-head]",
        { opacity: 0, y: 26 },
        { opacity: 1, y: 0, duration: 1.1, ease: "power3.out" }
      );
      gsap.fromTo(
        "[data-hub-card]",
        { opacity: 0, y: 32 },
        { opacity: 1, y: 0, duration: 1, ease: "power3.out", stagger: 0.14, delay: 0.2 }
      );
    }, rootRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={rootRef} className="mx-auto max-w-5xl">
      <header data-hub-head className="mb-14 text-center">
        <span className="text-xs tracking-[0.3em] text-bronze">جناح اللهو في المكتبة</span>
        <h1 className="font-display mt-3 m-0 text-4xl text-parchment sm:text-5xl">الألعاب</h1>
        <p className="mx-auto mt-4 mb-0 max-w-xl text-sm leading-loose text-warm-gray">
          بين الرفوف قاعةٌ صغيرة للّهو الجاد — ثلاث لُعبٍ نُسجت من حبر المكتبة وحروفها.
        </p>
      </header>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {ROOMS.map((room) => (
          <Link
            key={room.href}
            href={room.href}
            data-hub-card
            aria-label={`ادخل قاعة ${room.title}`}
            className="group block rounded-2xl border border-[color:var(--line)] p-7 no-underline transition-all duration-300 hover:-translate-y-1 hover:border-[rgba(255,106,0,0.45)]"
            style={{ background: "rgba(236,223,199,0.03)" }}
          >
            <span className="text-[0.65rem] tracking-[0.3em] text-bronze">{room.kicker}</span>
            <h2 className="font-display mt-3 m-0 text-2xl text-parchment transition-colors duration-300 group-hover:text-accent-soft">
              {room.title}
            </h2>
            <p className="mt-3 mb-0 text-sm leading-loose text-warm-gray">{room.description}</p>
            <span
              className="mt-6 block text-xs tracking-wider transition-colors duration-300 group-hover:text-accent"
              style={{ color: "var(--bronze)" }}
            >
              ادخل القاعة ←
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
