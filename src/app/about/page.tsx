import type { Metadata } from "next";
import { AboutView } from "@/components/about-view";

export const metadata: Metadata = {
  title: "عن الكاتب | مكتبة عين",
  description: "عين: كاتبٌ يوقّع بحرفٍ واحد، نسج عالمه الخاص بين القصة والمقال والشعر الحر."
};

export default function AboutPage() {
  return <AboutView />;
}
