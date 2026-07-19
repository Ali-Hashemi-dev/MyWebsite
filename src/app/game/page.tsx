import type { Metadata } from "next";
import { GameHub } from "@/components/game/game-hub";

export const metadata: Metadata = {
  title: "الألعاب | مكتبة عين",
  description: "قاعة ألعاب المكتبة: صيدٌ للعين بين الشرر، ونظمٌ لأبياتٍ تبعثرت، وذاكرةٌ تسترجع الحروف من عتمة الرف."
};

export default function GamesPage() {
  return (
    <div
      className="min-h-svh px-5 pt-28 pb-16 sm:px-8"
      style={{
        background:
          "radial-gradient(ellipse 70% 40% at 50% 0%, rgba(255,140,26,0.07), transparent 60%), #0c0a08"
      }}
    >
      <GameHub />
    </div>
  );
}
