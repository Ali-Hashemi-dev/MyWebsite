"use client";

import { useCallback, useEffect, useState } from "react";
import { GITHUB } from "@/data/site-config";
import { articles } from "@/data/articles";
import { nextArticleFile } from "@/lib/article-markdown";
import { listDir, type RepoFile } from "@/lib/github";
import { AinMark } from "../ain-mark";
import { PinGate } from "./pin-gate";
import { ArticleEditor, type EditorTarget } from "./article-editor";
import { SettingsPanel } from "./settings-panel";

type Tab = "texts" | "settings";

type Row = {
  file: string;
  title: string;
  genre?: string;
  date?: string;
  /** Seen in the repo listing (may be newer than the baked site). */
  inRepo: boolean;
  baked: boolean;
};

function articleNumber(file: string): number {
  const match = file.match(/^article(\d+)$/);
  return match ? Number(match[1]) : Number.MAX_SAFE_INTEGER;
}

/** The desk itself: PIN gate, then the texts list / editor and the settings. */
export function AdminStudio() {
  const [ready, setReady] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [tab, setTab] = useState<Tab>("texts");
  const [editor, setEditor] = useState<EditorTarget | null>(null);

  const [repoFiles, setRepoFiles] = useState<RepoFile[] | null>(null);
  const [repoError, setRepoError] = useState(false);
  const [repoLoading, setRepoLoading] = useState(false);

  // A session unlock survives reloads until the browser tab closes.
  useEffect(() => {
    try {
      setUnlocked(window.sessionStorage.getItem("ain-admin-unlocked") === "1");
    } catch {
      /* storage unavailable — stay locked */
    }
    setReady(true);
  }, []);

  const refreshRepo = useCallback(async () => {
    setRepoLoading(true);
    try {
      const files = await listDir(GITHUB.contentDir);
      setRepoFiles(files.filter((file) => file.name.endsWith(".md")));
      setRepoError(false);
    } catch {
      setRepoError(true);
    } finally {
      setRepoLoading(false);
    }
  }, []);

  useEffect(() => {
    if (unlocked) void refreshRepo();
  }, [unlocked, refreshRepo]);

  if (!ready) return <div className="min-h-svh" />;
  if (!unlocked) return <PinGate onUnlock={() => setUnlocked(true)} />;

  // Merge the baked articles with whatever the repo currently holds.
  const rows = new Map<string, Row>();
  for (const article of articles) {
    rows.set(article.file, {
      file: article.file,
      title: article.title,
      genre: article.genre,
      date: article.date,
      inRepo: false,
      baked: true
    });
  }
  for (const file of repoFiles ?? []) {
    const stem = file.name.replace(/\.md$/, "");
    const existing = rows.get(stem);
    if (existing) existing.inRepo = true;
    else rows.set(stem, { file: stem, title: stem, inRepo: true, baked: false });
  }
  const list = [...rows.values()].sort(
    (a, b) => articleNumber(a.file) - articleNumber(b.file) || a.file.localeCompare(b.file)
  );

  function openNew() {
    const file = nextArticleFile(list.map((row) => row.file));
    const id = String(articleNumber(file)).padStart(2, "0");
    setEditor({ mode: "new", file, id });
    setTab("texts");
  }

  const tabButton = (value: Tab, label: string) => (
    <button
      type="button"
      onClick={() => setTab(value)}
      aria-current={tab === value ? "page" : undefined}
      className="border-0 border-b-2 bg-transparent px-1 pb-3 text-base transition-colors"
      style={{
        font: "inherit",
        color: tab === value ? "var(--accent)" : "var(--warm-gray)",
        borderBottom: tab === value ? "2px solid var(--accent)" : "2px solid transparent"
      }}
    >
      {label}
    </button>
  );

  return (
    <div className="mx-auto max-w-4xl px-4 pt-28 pb-24 sm:px-8">
      {/* desk header */}
      <header className="mb-10 flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display m-0 text-4xl text-parchment">المكتب السري</h1>
          <p className="m-0 mt-2 text-sm text-warm-gray">
            من هنا تُنشر النصوص إلى المستودع مباشرة، والموقع يُعاد بناؤه من تلقاء نفسه.
          </p>
        </div>
        <div style={{ color: "var(--bronze)" }}>
          <AinMark variant="a" size={44} eye eyeColor="var(--accent)" />
        </div>
      </header>

      {/* tab bar */}
      <nav aria-label="أقسام المكتب" className="mb-8 flex gap-6 border-b" style={{ borderColor: "var(--line)" }}>
        {tabButton("texts", "النصوص")}
        {tabButton("settings", "الإعدادات")}
      </nav>

      {/* both panels stay mounted so tab switches never drop editor state */}
      <section style={{ display: tab === "texts" ? undefined : "none" }} aria-label="النصوص">
        {editor ? (
          <ArticleEditor
            key={`${editor.mode}-${editor.file}`}
            target={editor}
            onBack={() => setEditor(null)}
            onGoToSettings={() => setTab("settings")}
            onChanged={() => void refreshRepo()}
          />
        ) : (
          <div>
            <div className="mb-6 flex items-center justify-between gap-4">
              <p className="m-0 text-sm text-warm-gray">
                {repoLoading
                  ? "يُقرأ المستودع…"
                  : repoError
                    ? "تعذّر الوصول إلى المستودع — تُعرض النصوص المخبوزة فقط."
                    : `${list.length} نصاً على المكتب`}
              </p>
              <button
                type="button"
                onClick={openNew}
                aria-label="ابدأ نصاً جديداً"
                className="rounded-full px-5 py-2 font-bold transition-opacity hover:opacity-90"
                style={{ background: "var(--accent)", color: "var(--ink)", border: "none", font: "inherit", fontWeight: 700 }}
              >
                نص جديد +
              </button>
            </div>

            <ul className="m-0 list-none space-y-3 p-0">
              {list.map((row) => (
                <li
                  key={row.file}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border px-5 py-4"
                  style={{ borderColor: "var(--line)", background: "rgba(255,255,255,0.015)" }}
                >
                  <div>
                    <span className="font-display block text-xl text-parchment">{row.title}</span>
                    <span className="mt-1 block text-xs text-bronze">
                      {row.genre ? <>{row.genre} · </> : null}
                      {row.date ? <>{row.date} · </> : null}
                      <span dir="ltr">{row.file}.md</span>
                      {!row.baked ? " · في المستودع، بانتظار البناء" : null}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditor({ mode: "edit", file: row.file })}
                    aria-label={`حرّر النص ${row.title}`}
                    className="rounded-full border px-4 py-1.5 text-sm transition-colors hover:text-accent"
                    style={{ borderColor: "var(--line)", background: "none", color: "var(--warm-gray)", font: "inherit" }}
                  >
                    تحرير
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <section style={{ display: tab === "settings" ? undefined : "none" }} aria-label="الإعدادات">
        <SettingsPanel />
      </section>
    </div>
  );
}
