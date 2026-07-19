"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { GISCUS, PEN_NAME } from "@/data/site-config";
import { AinMark } from "../ain-mark";
import { Dust } from "../dust";
import { GiscusThread } from "./giscus-thread";
import { LetterForm } from "./letter-form";

gsap.registerPlugin(ScrollTrigger);

/**
 * المجلس — the salon: readers join with their GitHub usernames to comment,
 * debate, and talk with عين. Public discussion runs on giscus; the letter
 * form writes straight from the reader's own mail client.
 */
export function SalonView() {
  const rootRef = useRef<HTMLDivElement>(null);
  const giscusReady = Boolean(GISCUS.repoId && GISCUS.categoryId);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || !rootRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-salon-head]",
        { opacity: 0, y: 26 },
        { opacity: 1, y: 0, duration: 1.1, ease: "power3.out" }
      );
      gsap.utils.toArray<HTMLElement>("[data-salon-section]").forEach((el) => {
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
      <Dust density={0.4} />
      <div className="relative mx-auto max-w-3xl">
        <header data-salon-head className="text-center">
          <div className="mb-8 flex justify-center" style={{ color: "var(--bronze)" }}>
            <AinMark variant="a" size={64} />
          </div>
          <span className="text-xs tracking-[0.3em] text-bronze">مجلس القرّاء</span>
          <h1 className="font-display mt-3 m-0 text-4xl text-parchment sm:text-5xl">المجلس</h1>
          <p className="font-naskh mx-auto mt-6 mb-0 max-w-xl text-lg leading-[2.2] font-light text-parchment-dim">
            في صدر المكتبة قاعةٌ مضاءة على الدوام: يدخلها القرّاء بأسمائهم، يعلّقون على
            النصوص، يختلفون ويتفقون، ويتحدثون مع {PEN_NAME} نفسه. ولمن أراد كلاماً لا
            يسمعه أحد، في آخر القاعة بريدٌ خاص.
          </p>
        </header>

        {/* section one — public discussion */}
        <section data-salon-section aria-label="النقاش العام" className="mt-24">
          <span className="text-xs tracking-[0.3em] text-bronze">القاعة المفتوحة</span>
          <h2 className="font-display mt-3 mb-8 text-3xl text-parchment">النقاش العام</h2>
          {giscusReady ? (
            <GiscusThread term="salon" />
          ) : (
            <div
              className="rounded-xl border px-6 py-10 text-center"
              style={{ borderColor: "var(--line)", background: "rgba(236,223,199,0.04)" }}
            >
              <p className="font-display m-0 text-2xl text-parchment">المجلس يُفتَح قريباً</p>
              <p
                className="mx-auto mt-4 mb-0 max-w-md text-sm leading-loose font-light"
                style={{ color: "var(--warm-gray)" }}
              >
                فعِّل giscus في site-config لتُضاء هذه القاعة ويبدأ الكلام.
              </p>
              <p className="mt-3 mb-0 text-xs font-light" style={{ color: "var(--bronze)" }}>
                يُدار الحوار عبر GitHub Discussions، ويشارك القرّاء بأسمائهم هناك.
              </p>
            </div>
          )}
        </section>

        {/* section two — private letter */}
        <section data-salon-section aria-label={`رسالة خاصة إلى ${PEN_NAME}`} className="mt-24">
          <span className="text-xs tracking-[0.3em] text-bronze">بريد المكتبة</span>
          <h2 className="font-display mt-3 mb-8 text-3xl text-parchment">
            رسالة خاصة إلى {PEN_NAME}
          </h2>
          <LetterForm />
        </section>

        <div data-salon-section className="mt-20 text-center">
          <Link
            href="/"
            className="inline-block rounded-full border px-8 py-3 text-sm tracking-wider no-underline transition-all duration-300 hover:text-accent"
            style={{ borderColor: "var(--line)", color: "var(--warm-gray)" }}
          >
            ← العودة إلى المكتبة
          </Link>
        </div>
      </div>
    </div>
  );
}
