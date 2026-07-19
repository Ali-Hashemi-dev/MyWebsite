import type { Metadata } from "next";
import { SalonView } from "@/components/salon/salon-view";

export const metadata: Metadata = {
  title: "المجلس | مكتبة عين",
  description:
    "قاعة القرّاء في مكتبة عين: نقاشٌ مفتوح حول النصوص، وبريدٌ خاص يصل إلى عين مباشرة."
};

export default function SalonPage() {
  return <SalonView />;
}
