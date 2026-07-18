import type { Metadata } from "next";
import { AboutView } from "@/components/about-view";

export const metadata: Metadata = {
  title: "عن الكاتب | مكتبة علي هاشمي",
  description: "علي هاشمي: كاتب لبناني نسج عالمه الخاص بين القصة والمقال والشعر الحر."
};

export default function AboutPage() {
  return <AboutView />;
}
