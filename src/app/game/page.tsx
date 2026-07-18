import type { Metadata } from "next";
import { AinHunt } from "@/components/game/ain-hunt";

export const metadata: Metadata = {
  title: "صيد العين | مكتبة علي هاشمي",
  description: "لعبة المكتبة: اصطد حرف العين بين الحروف الصاعدة وأضئ القناديل السبعة."
};

export default function GamePage() {
  return (
    <div
      className="min-h-svh px-5 pt-28 pb-16 sm:px-8"
      style={{
        background:
          "radial-gradient(ellipse 70% 40% at 50% 0%, rgba(255,140,26,0.07), transparent 60%), #0c0a08"
      }}
    >
      <header className="mb-10 text-center">
        <span className="text-xs tracking-[0.3em] text-bronze">لعبة المكتبة</span>
        <h1 className="font-display mt-3 m-0 text-4xl text-parchment sm:text-5xl">صيد العين</h1>
      </header>
      <AinHunt />
    </div>
  );
}
