import type { Metadata } from "next";
import { Lab } from "@/components/lab/lab";

export const metadata: Metadata = {
  title: "المِرسم | مكتبة علي هاشمي",
  description: "معمل هوية الحرف ع: قارن بين الصيغتين كأيقونة، ومؤشر، وعين حيّة."
};

export default function LabPage() {
  return <Lab />;
}
