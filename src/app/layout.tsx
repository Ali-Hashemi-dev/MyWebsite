import type { Metadata } from "next";
import { Geist, Noto_Sans_Arabic } from "next/font/google";
import type { ReactNode } from "react";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap"
});

const notoArabic = Noto_Sans_Arabic({
  variable: "--font-noto-arabic",
  subsets: ["arabic"],
  display: "swap"
});

export const metadata: Metadata = {
  title: "علي هاشمي | مزيج أدبي",
  description:
    "الموقع الشخصي للكاتب اللبناني علي هاشمي: نصوص، مقالات، رسائل، وتجارب أدبية عربية محولة من PDF إلى HTML.",
  keywords: ["علي هاشمي", "كاتب لبناني", "مزيج أدبي", "نصوص عربية", "مقالات أدبية"],
  authors: [{ name: "علي هاشمي" }],
  creator: "علي هاشمي",
  openGraph: {
    title: "علي هاشمي | مزيج أدبي",
    description: "أرشيف أدبي عربي بتصميم تفاعلي وحركة سينمائية.",
    type: "website",
    locale: "ar_LB"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className={`${geist.variable} ${notoArabic.variable}`}>
      <body>
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
