import type { Metadata } from "next";
import { Aref_Ruqaa, IBM_Plex_Sans_Arabic, Noto_Naskh_Arabic } from "next/font/google";
import type { ReactNode } from "react";
import { AinCursor } from "@/components/ain-cursor";
import { AudioControl } from "@/components/audio-control";
import { FallingAin } from "@/components/falling-ain";
import { SmoothScroll } from "@/components/smooth-scroll";
import { SiteNav } from "@/components/site-nav";
import "./globals.css";

const plexArabic = IBM_Plex_Sans_Arabic({
  variable: "--font-plex-arabic",
  subsets: ["arabic"],
  weight: ["300", "400", "500", "700"],
  display: "swap"
});

const arefRuqaa = Aref_Ruqaa({
  variable: "--font-ruqaa",
  subsets: ["arabic"],
  weight: ["400", "700"],
  display: "swap"
});

const notoNaskh = Noto_Naskh_Arabic({
  variable: "--font-naskh",
  subsets: ["arabic"],
  weight: ["400", "500", "600"],
  display: "swap"
});

export const metadata: Metadata = {
  title: "مكتبة عين",
  description:
    "مكتبة عربية غامرة: قصص، مقالات، وشعر حر بتوقيع عين. تجربة قراءة سينمائية تُشبه دخول مكتبة قديمة تسكنها المعرفة.",
  keywords: ["عين", "مكتبة عربية", "نصوص عربية", "قصص", "مقالات", "شعر حر"],
  authors: [{ name: "عين" }],
  creator: "عين",
  openGraph: {
    title: "مكتبة عين",
    description: "مكتبة عربية غامرة تُروى كتبها بالضوء والغبار والحبر.",
    type: "website",
    locale: "ar"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${plexArabic.variable} ${arefRuqaa.variable} ${notoNaskh.variable}`}
    >
      <body className="grain vignette">
        <a href="#main" className="skip-link">
          تخطَّ إلى المحتوى
        </a>
        <SmoothScroll>
          <SiteNav />
          <main id="main">{children}</main>
        </SmoothScroll>
        <FallingAin />
        <AinCursor />
        <AudioControl />
      </body>
    </html>
  );
}
