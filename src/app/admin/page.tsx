import type { Metadata } from "next";
import { AdminStudio } from "@/components/admin/admin-studio";

export const metadata: Metadata = {
  title: "المكتب السري | مكتبة عين",
  robots: { index: false, follow: false }
};

/** The writer's desk — unlisted, reached only by URL. */
export default function AdminPage() {
  return <AdminStudio />;
}
