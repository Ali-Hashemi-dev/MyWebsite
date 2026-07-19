import type { Metadata } from "next";
import { LiveReader } from "@/components/reader/live-reader";

export const metadata: Metadata = {
  title: "قراءة | مكتبة عين",
  description: "نصوص وصلت للتو إلى المكتبة، تُقرأ قبل أن تستقر على رفوفها."
};

export default function LiveReadPage() {
  return <LiveReader />;
}
