"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { GITHUB } from "@/data/site-config";
import type { ArticleBlock } from "@/data/articles";
import { shelfBooks } from "@/data/shelf";
import {
  cleanArabicLine,
  estimateReading,
  markdownToBlocks,
  parseArticleMarkdown,
  serializeArticleMarkdown,
  type ArticleMeta
} from "@/lib/article-markdown";
import { deleteFile, getFile, getStoredToken, putFile } from "@/lib/github";
import { ArticlePreview } from "./article-preview";

export type EditorTarget =
  | { mode: "new"; file: string; id: string }
  | { mode: "edit"; file: string };

type ArticleEditorProps = {
  target: EditorTarget;
  onBack: () => void;
  onGoToSettings: () => void;
  /** Called after a successful publish or delete so the list refreshes. */
  onChanged: () => void;
};

type Status =
  | { kind: "idle" }
  | { kind: "no-token" }
  | { kind: "success" }
  | { kind: "error"; message: string };

const GENRES = shelfBooks.flatMap((book) => book.genres);

const fieldClass = "w-full rounded-lg border bg-transparent px-3 py-2 text-parchment";
const fieldStyle = { borderColor: "var(--line)", background: "rgba(255,255,255,0.02)", font: "inherit" };
const labelClass = "mb-1 block text-xs tracking-wider text-bronze";
const pillButtonClass = "rounded-full border px-4 py-1.5 text-sm transition-colors hover:text-accent";
const pillButtonStyle = { borderColor: "var(--line)", background: "none", color: "var(--warm-gray)", font: "inherit" };

function todayLatin(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}/${month}/${day}`;
}

/** The writing surface: metadata, markdown body, live preview, publish. */
export function ArticleEditor({ target, onBack, onGoToSettings, onChanged }: ArticleEditorProps) {
  const isNew = target.mode === "new";
  const path = `${GITHUB.contentDir}/${target.file}.md`;

  const [loading, setLoading] = useState(!isNew);
  const [loadError, setLoadError] = useState("");
  const [sha, setSha] = useState<string | undefined>(undefined);

  const [id, setId] = useState(isNew ? target.id : "");
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [genre, setGenre] = useState("");
  const [date, setDate] = useState(isNew ? todayLatin() : "");
  const [mood, setMood] = useState("");
  const [themesText, setThemesText] = useState("");
  const [summary, setSummary] = useState("");
  const [signal, setSignal] = useState("");
  const [category, setCategory] = useState("مزيج أدبي");
  const [pdf, setPdf] = useState("");
  const [body, setBody] = useState("");

  const [dirty, setDirty] = useState(false);
  const [preview, setPreview] = useState(false);
  const [previewBlocks, setPreviewBlocks] = useState<ArticleBlock[]>([]);
  const [publishing, setPublishing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load the existing file from the repo; the sha is needed to commit updates.
  useEffect(() => {
    if (target.mode !== "edit") return;
    let cancelled = false;
    (async () => {
      try {
        const file = await getFile(`${GITHUB.contentDir}/${target.file}.md`);
        const parsed = parseArticleMarkdown(file.content);
        if (cancelled) return;
        setSha(file.sha);
        setId(parsed.meta.id);
        setTitle(parsed.meta.title);
        setSubtitle(parsed.meta.subtitle);
        setGenre(parsed.meta.genre);
        setDate(parsed.meta.date);
        setMood(parsed.meta.mood);
        setThemesText(parsed.meta.themes.join("، "));
        setSummary(parsed.meta.summary);
        setSignal(parsed.meta.signal);
        setCategory(parsed.meta.category || "مزيج أدبي");
        setPdf(parsed.meta.pdf);
        setBody(parsed.markdown);
        setLoading(false);
      } catch (error) {
        if (cancelled) return;
        setLoadError(error instanceof Error ? error.message : "تعذّر تحميل النص");
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [target]);

  // Warn before the tab closes while edits are unpublished.
  useEffect(() => {
    if (!dirty) return;
    function handler(event: BeforeUnloadEvent) {
      event.preventDefault();
      event.returnValue = "";
    }
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  // Debounced live preview.
  useEffect(() => {
    if (!preview) return;
    const timer = window.setTimeout(() => setPreviewBlocks(markdownToBlocks(body)), 300);
    return () => window.clearTimeout(timer);
  }, [body, preview]);

  function edit<T>(setter: (value: T) => void) {
    return (value: T) => {
      setter(value);
      setDirty(true);
      setStatus((current) => (current.kind === "success" ? { kind: "idle" } : current));
    };
  }

  function handleBack() {
    if (dirty && !window.confirm("لديك تعديلات غير منشورة — هل تريد العودة إلى القائمة دون نشر؟")) return;
    onBack();
  }

  function insertTemplate(kind: "poem" | "quote") {
    const template =
      kind === "poem" ? "\n\n::poem\nسطر أول\nسطر ثانٍ\n::\n\n" : "\n\n> سطر الاقتباس\n\n";
    const element = textareaRef.current;
    const start = element?.selectionStart ?? body.length;
    const end = element?.selectionEnd ?? start;
    setBody(body.slice(0, start) + template + body.slice(end));
    setDirty(true);
    requestAnimationFrame(() => {
      if (!element) return;
      element.focus();
      const caret = start + template.length;
      element.setSelectionRange(caret, caret);
    });
  }

  function buildMeta(cleanTitle: string): ArticleMeta {
    const { words, readingTime } = estimateReading(body);
    return {
      id,
      file: target.file,
      title: cleanTitle,
      subtitle: cleanArabicLine(subtitle),
      date: date.trim() || todayLatin(),
      year: (date.trim() || todayLatin()).match(/\d{4}/)?.[0] ?? "",
      category: category.trim() || "مزيج أدبي",
      genre,
      themes: themesText
        .split(/[,،]/)
        .map((theme) => theme.trim())
        .filter(Boolean),
      readingTime,
      words,
      mood: cleanArabicLine(mood),
      pdf: pdf.trim(),
      summary: cleanArabicLine(summary),
      signal: cleanArabicLine(signal)
    };
  }

  async function publish() {
    if (publishing || deleting) return;
    if (!getStoredToken()) {
      setStatus({ kind: "no-token" });
      return;
    }
    const cleanTitle = cleanArabicLine(title);
    if (!cleanTitle) {
      setStatus({ kind: "error", message: "العنوان مطلوب قبل النشر" });
      return;
    }
    if (!genre) {
      setStatus({ kind: "error", message: "اختر النوع — به يعرف النص رفَّه في المكتبة" });
      return;
    }
    if (!body.trim()) {
      setStatus({ kind: "error", message: "النص فارغ — اكتب شيئاً قبل النشر" });
      return;
    }
    setPublishing(true);
    setStatus({ kind: "idle" });
    try {
      const content = serializeArticleMarkdown(buildMeta(cleanTitle), body);
      await putFile(path, content, sha ? `تحديث: ${cleanTitle}` : `نشر: ${cleanTitle}`, sha);
      setDirty(false);
      setStatus({ kind: "success" });
      onChanged();
      // Refresh the sha quietly so a follow-up publish commits as an update.
      getFile(path)
        .then((file) => setSha(file.sha))
        .catch(() => {});
    } catch (error) {
      setStatus({ kind: "error", message: error instanceof Error ? error.message : "تعذّر النشر" });
    } finally {
      setPublishing(false);
    }
  }

  async function remove() {
    if (!sha || publishing || deleting) return;
    if (!getStoredToken()) {
      setStatus({ kind: "no-token" });
      return;
    }
    const name = cleanArabicLine(title) || target.file;
    if (!window.confirm(`هل تريد حذف «${name}» من المستودع نهائياً؟ لا رجوع بعد الحذف.`)) return;
    setDeleting(true);
    setStatus({ kind: "idle" });
    try {
      await deleteFile(path, `حذف: ${name}`, sha);
      setDirty(false);
      onChanged();
      onBack();
    } catch (error) {
      setStatus({ kind: "error", message: error instanceof Error ? error.message : "تعذّر الحذف" });
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <p className="py-16 text-center text-warm-gray" role="status">
        يُفتح المخطوط من المستودع…
      </p>
    );
  }

  if (loadError) {
    return (
      <div className="rounded-xl border p-6 text-center" style={{ borderColor: "var(--line)" }}>
        <p className="m-0" style={{ color: "var(--accent-soft)" }}>{loadError}</p>
        <p className="mt-2 mb-4 text-sm text-warm-gray">
          إن كان المستودع خاصاً فالقراءة تحتاج رمز GitHub من الإعدادات.
        </p>
        <div className="flex justify-center gap-3">
          <button type="button" onClick={onBack} className={pillButtonClass} style={pillButtonStyle}>
            العودة إلى القائمة
          </button>
          <button type="button" onClick={onGoToSettings} className={pillButtonClass} style={pillButtonStyle}>
            افتح الإعدادات
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* editor header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display m-0 text-2xl text-parchment">
            {isNew ? "نص جديد" : title || target.file}
          </h2>
          <p className="m-0 mt-1 text-xs text-warm-gray">
            <span dir="ltr">{path}</span>
            {dirty ? <span style={{ color: "var(--accent-soft)" }}> · تعديلات غير منشورة</span> : null}
          </p>
        </div>
        <button
          type="button"
          onClick={handleBack}
          aria-label="العودة إلى قائمة النصوص"
          className={pillButtonClass}
          style={pillButtonStyle}
        >
          ← العودة إلى القائمة
        </button>
      </div>

      {/* metadata */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className={labelClass} htmlFor="admin-title">العنوان</label>
          <input
            id="admin-title"
            value={title}
            onChange={(event) => edit(setTitle)(event.target.value)}
            className={fieldClass}
            style={fieldStyle}
          />
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass} htmlFor="admin-subtitle">العنوان الفرعي</label>
          <input
            id="admin-subtitle"
            value={subtitle}
            onChange={(event) => edit(setSubtitle)(event.target.value)}
            className={fieldClass}
            style={fieldStyle}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="admin-genre">النوع</label>
          <select
            id="admin-genre"
            value={genre}
            onChange={(event) => edit(setGenre)(event.target.value)}
            className={fieldClass}
            style={{ ...fieldStyle, background: "var(--ink-soft)" }}
          >
            <option value="">— اختر النوع —</option>
            {GENRES.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
            {genre && !GENRES.includes(genre) ? <option value={genre}>{genre}</option> : null}
          </select>
        </div>
        <div>
          <label className={labelClass} htmlFor="admin-date">التاريخ</label>
          <input
            id="admin-date"
            dir="ltr"
            value={date}
            onChange={(event) => edit(setDate)(event.target.value)}
            placeholder="YYYY/MM/DD"
            className={fieldClass}
            style={{ ...fieldStyle, textAlign: "right" }}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="admin-mood">المزاج</label>
          <input
            id="admin-mood"
            value={mood}
            onChange={(event) => edit(setMood)(event.target.value)}
            className={fieldClass}
            style={fieldStyle}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="admin-themes">الوسوم (مفصولة بفواصل)</label>
          <input
            id="admin-themes"
            value={themesText}
            onChange={(event) => edit(setThemesText)(event.target.value)}
            placeholder="طبيعة، ذاكرة"
            className={fieldClass}
            style={fieldStyle}
          />
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass} htmlFor="admin-summary">الخلاصة</label>
          <input
            id="admin-summary"
            value={summary}
            onChange={(event) => edit(setSummary)(event.target.value)}
            className={fieldClass}
            style={fieldStyle}
          />
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass} htmlFor="admin-signal">الإشارات</label>
          <input
            id="admin-signal"
            value={signal}
            onChange={(event) => edit(setSignal)(event.target.value)}
            className={fieldClass}
            style={fieldStyle}
          />
        </div>
      </div>

      {/* body grammar hint + helpers */}
      <div
        className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-t-lg border border-b-0 px-4 py-3 text-xs text-warm-gray"
        style={{ borderColor: "var(--line)", background: "rgba(255,255,255,0.02)" }}
      >
        <span>
          فقرة = سطر فارغ بين الفقرات، «## عنوان» و«### عنوان» للعناوين، «&gt; سطر» للاقتباس،
          ومقطع شعري بين ::poem و ::
        </span>
        <span className="flex gap-2">
          <button
            type="button"
            onClick={() => insertTemplate("poem")}
            aria-label="أدرج قالب مقطع شعري"
            className={pillButtonClass}
            style={pillButtonStyle}
          >
            + مقطع شعري
          </button>
          <button
            type="button"
            onClick={() => insertTemplate("quote")}
            aria-label="أدرج قالب اقتباس"
            className={pillButtonClass}
            style={pillButtonStyle}
          >
            + اقتباس
          </button>
        </span>
      </div>
      <textarea
        ref={textareaRef}
        dir="rtl"
        value={body}
        onChange={(event) => edit(setBody)(event.target.value)}
        aria-label="نص المخطوط"
        className="font-naskh w-full rounded-b-lg border px-4 py-4 text-lg leading-loose text-parchment"
        style={{ ...fieldStyle, minHeight: "420px", resize: "vertical" }}
      />

      {/* preview */}
      <div className="mt-4">
        <button
          type="button"
          onClick={() => {
            const next = !preview;
            setPreview(next);
            if (next) setPreviewBlocks(markdownToBlocks(body));
          }}
          aria-expanded={preview}
          aria-label={preview ? "أخف المعاينة" : "اعرض المعاينة"}
          className={pillButtonClass}
          style={pillButtonStyle}
        >
          {preview ? "إخفاء المعاينة" : "معاينة المخطوط"}
        </button>
        {preview ? (
          <div className="mt-4">
            <ArticlePreview blocks={previewBlocks} />
          </div>
        ) : null}
      </div>

      {/* publish + delete */}
      <div className="mt-8 flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={publish}
          disabled={publishing || deleting}
          className="rounded-full px-6 py-2.5 font-bold transition-opacity disabled:opacity-40"
          style={{ background: "var(--accent)", color: "var(--ink)", border: "none", font: "inherit", fontWeight: 700 }}
        >
          {publishing ? "يُنشر…" : "انشر في المكتبة"}
        </button>
        {!isNew && sha ? (
          <button
            type="button"
            onClick={remove}
            disabled={publishing || deleting}
            aria-label="احذف النص من المستودع"
            className={`${pillButtonClass} disabled:opacity-40`}
            style={{ ...pillButtonStyle, color: "var(--accent-soft)" }}
          >
            {deleting ? "يُحذف…" : "حذف النص"}
          </button>
        ) : null}
      </div>

      {status.kind === "no-token" ? (
        <div
          className="mt-4 rounded-xl border p-4 text-sm"
          style={{ borderColor: "rgba(255,106,0,0.35)", color: "var(--parchment-dim)" }}
          role="alert"
        >
          لا يوجد رمز GitHub محفوظ في هذا المتصفح — أضف الرمز من الإعدادات قبل النشر.
          <button
            type="button"
            onClick={onGoToSettings}
            className={`${pillButtonClass} mr-3`}
            style={pillButtonStyle}
          >
            افتح الإعدادات
          </button>
        </div>
      ) : null}

      {status.kind === "error" ? (
        <p role="alert" className="mt-4 mb-0 text-sm" style={{ color: "var(--accent-soft)" }}>
          {status.message}
        </p>
      ) : null}

      {status.kind === "success" ? (
        <div
          className="mt-4 rounded-xl border p-5"
          style={{ borderColor: "var(--line)", background: "rgba(255,255,255,0.02)" }}
          role="status"
        >
          <p className="m-0 text-parchment">
            النص أصبح في المستودع — الموقع سيُعاد بناؤه خلال دقائق.
          </p>
          <div className="mt-3 flex flex-wrap gap-4 text-sm">
            <a
              href={`https://github.com/${GITHUB.owner}/${GITHUB.repo}/commits/${GITHUB.branch}`}
              target="_blank"
              rel="noreferrer"
              className="transition-colors hover:text-accent"
              style={{ color: "var(--gold)" }}
            >
              تتبّع البناء على GitHub ↗
            </a>
            <Link
              href={`/read/?f=${target.file}`}
              className="no-underline transition-colors hover:text-accent"
              style={{ color: "var(--gold)" }}
            >
              اقرأه الآن في المكتبة
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
