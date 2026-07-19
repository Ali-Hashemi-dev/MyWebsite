"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { articleByFile, type Article } from "@/data/articles";
import { bookOfArticle } from "@/data/shelf";
import { fetchLiveArticleByFile } from "@/lib/live-articles";
import { AinMark } from "../ain-mark";
import { Reader } from "./reader";

const roomBackground =
  "radial-gradient(ellipse 70% 40% at 50% 0%, rgba(255,140,26,0.06), transparent 60%), #0c0a08";

/**
 * Reader for freshly published texts that have no baked page yet.
 * The file comes from ?f= (read off window.location — useSearchParams
 * complicates static export); baked files bounce to their real page.
 */
export function LiveReader() {
  const router = useRouter();
  const [article, setArticle] = useState<Article | null>(null);
  const [status, setStatus] = useState<"loading" | "missing" | "ready">("loading");

  useEffect(() => {
    const raw = new URLSearchParams(window.location.search).get("f") ?? "";
    const file = /^[a-zA-Z0-9_-]+$/.test(raw) ? raw : "";
    if (!file) {
      setStatus("missing");
      return;
    }
    if (articleByFile(file)) {
      /* already baked — its static page is the canonical reader */
      router.replace(`/read/${file}/`);
      return;
    }

    let active = true;
    fetchLiveArticleByFile(file).then((result) => {
      if (!active) return;
      if (result) {
        setArticle(result);
        setStatus("ready");
      } else {
        setStatus("missing");
      }
    });
    return () => {
      active = false;
    };
  }, [router]);

  if (status === "ready" && article) {
    return <Reader article={article} book={bookOfArticle(article)} />;
  }

  if (status === "missing") {
    return (
      <div
        className="flex min-h-svh items-center justify-center px-4"
        style={{ background: roomBackground }}
      >
        <div
          className="w-full max-w-md rounded-xl border p-10 text-center"
          style={{ borderColor: "var(--line)", background: "rgba(255,255,255,0.02)" }}
        >
          <div className="mb-6 flex justify-center" style={{ color: "var(--bronze)" }}>
            <AinMark variant="c" size={56} />
          </div>
          <p className="m-0 text-lg text-parchment">النص غير موجود أو لم يصل بعد</p>
          <p className="mt-3 mb-8 text-sm leading-relaxed" style={{ color: "var(--warm-gray)" }}>
            ربما لا يزال في طريقه إلى الرفوف — عُد إليه بعد قليل.
          </p>
          <Link
            href="/"
            className="text-sm tracking-wider no-underline transition-colors hover:text-accent"
            style={{ color: "var(--bronze)" }}
          >
            ← العودة إلى المكتبة
          </Link>
        </div>
      </div>
    );
  }

  /* loading (or redirecting to the baked page) */
  return (
    <div
      className="flex min-h-svh items-center justify-center"
      style={{ background: roomBackground }}
      role="status"
      aria-label="جاري إحضار النص"
    >
      <div className="motion-safe:animate-pulse" style={{ color: "var(--bronze)" }}>
        <AinMark variant="c" size={72} />
      </div>
    </div>
  );
}
