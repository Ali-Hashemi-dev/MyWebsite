/**
 * Shared article markdown logic, usable in the browser.
 *
 * This is the TypeScript twin of scripts/build-articles.mjs +
 * scripts/article-renderer.mjs: the same frontmatter format, the same
 * Arabic normalization, the same block grammar (paragraphs, ## / ###,
 * > quotes, ::poem … ::). The admin studio uses it to parse and preview
 * articles before publishing, and the live overlay uses it to render
 * freshly published markdown before the next static rebuild.
 *
 * Keep the parsing rules in sync with the build scripts.
 */

import type { Article, ArticleBlock } from "@/data/articles";

const hiddenDirectionControls = /[\u200e\u200f\u202a-\u202e\u2066-\u2069]/g;

export function normalizeArabicText(value: string): string {
  return String(value ?? "")
    .normalize("NFC")
    .replace(hiddenDirectionControls, "")
    .replace(/\u00a0/g, " ")
    .replace(/\f/g, "\n\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{4,}/g, "\n\n\n")
    .trim();
}

export function cleanArabicLine(value: string): string {
  return normalizeArabicText(value)
    .replace(/\s+/g, " ")
    .replace(/\s+([،؛:؟.!])/g, "$1")
    .replace(/([،؛:؟.!])(?=[^\s،؛:؟.!"'»”)\]}])/g, "$1 ")
    .replace(/([([{«])\s+/g, "$1")
    .replace(/\s+([)\]}»])/g, "$1")
    .trim();
}

/** Frontmatter fields as written in content/articles/*.md. */
export type ArticleMeta = {
  id: string;
  file: string;
  title: string;
  subtitle: string;
  date: string;
  year: string;
  category: string;
  genre: string;
  themes: string[];
  readingTime: string;
  words: string;
  mood: string;
  pdf: string;
  summary: string;
  signal: string;
};

export type ParsedArticle = {
  meta: ArticleMeta;
  /** Body markdown exactly as stored (normalized), for round-trip editing. */
  markdown: string;
  /** Body parsed into render blocks. */
  body: ArticleBlock[];
};

function parseScalar(value: string): string | string[] {
  const trimmed = value.trim();
  if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
    return trimmed
      .slice(1, -1)
      .split(",")
      .map((item) => item.trim().replace(/^["']|["']$/g, ""))
      .filter(Boolean);
  }
  return trimmed.replace(/^["']|["']$/g, "");
}

function asString(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value.join(", ");
  return (value ?? "").trim();
}

function asList(value: string | string[] | undefined): string[] {
  if (Array.isArray(value)) return value;
  const single = (value ?? "").trim();
  return single ? [single] : [];
}

function poemBlock(block: string): ArticleBlock {
  const lines = block
    .replace(/^::poem\s*\n/, "")
    .replace(/\n::\s*$/, "")
    .split("\n")
    .map(cleanArabicLine)
    .filter(Boolean);
  return { type: "poem", lines };
}

function markdownBlockToBlock(block: string): ArticleBlock | null {
  const trimmed = block.trim();
  const lines = trimmed.split("\n");

  if (!trimmed || trimmed.startsWith("<!--")) return null;
  if (trimmed.startsWith("::poem") && trimmed.endsWith("::")) return poemBlock(trimmed);
  if (lines.length === 1 && lines[0].startsWith("### ")) {
    return { type: "h3", text: cleanArabicLine(lines[0].slice(4)) };
  }
  if (lines.length === 1 && lines[0].startsWith("## ")) {
    return { type: "h2", text: cleanArabicLine(lines[0].slice(3)) };
  }
  if (lines.every((line) => line.trim().startsWith(">"))) {
    const quoteLines = lines
      .map((line) => cleanArabicLine(line.replace(/^>\s?/, "")))
      .filter(Boolean);
    return { type: "quote", lines: quoteLines };
  }
  return { type: "p", text: cleanArabicLine(lines.map(cleanArabicLine).join(" ")) };
}

export function markdownToBlocks(markdown: string): ArticleBlock[] {
  return normalizeArabicText(markdown)
    .split(/\n{2,}/)
    .map(markdownBlockToBlock)
    .filter((block): block is ArticleBlock => block !== null);
}

/**
 * Parse a full article .md source (frontmatter + body).
 * Throws with a readable message when the frontmatter is missing or broken.
 */
export function parseArticleMarkdown(source: string): ParsedArticle {
  const normalized = normalizeArabicText(source);
  const match = normalized.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) {
    throw new Error("الملف لا يحتوي على ترويسة frontmatter بين --- و ---");
  }

  const data: Record<string, string | string[]> = {};
  for (const line of match[1].split("\n")) {
    if (!line.trim() || line.trim().startsWith("#")) continue;
    const separator = line.indexOf(":");
    if (separator === -1) {
      throw new Error(`سطر ترويسة غير صالح: ${line}`);
    }
    data[line.slice(0, separator).trim()] = parseScalar(line.slice(separator + 1));
  }

  const meta: ArticleMeta = {
    id: asString(data.id),
    file: asString(data.file),
    title: asString(data.title),
    subtitle: asString(data.subtitle),
    date: asString(data.date),
    year: asString(data.year),
    category: asString(data.category) || "مزيج أدبي",
    genre: asString(data.genre),
    themes: asList(data.themes),
    readingTime: asString(data.readingTime),
    words: asString(data.words),
    mood: asString(data.mood),
    pdf: asString(data.pdf),
    summary: asString(data.summary),
    signal: asString(data.signal)
  };

  if (!meta.file) throw new Error("الترويسة تفتقد الحقل file");
  if (!meta.title) throw new Error("الترويسة تفتقد الحقل title");

  const markdown = match[2].trim();
  return { meta, markdown, body: markdownToBlocks(markdown) };
}

/** Build a full Article (as the site renders it) from parsed markdown. */
export function parsedToArticle(parsed: ParsedArticle): Article {
  const { meta, body } = parsed;
  return {
    ...meta,
    href: `/read/${meta.file}/`,
    body
  };
}

/** Estimate word count + reading time for Arabic prose. */
export function estimateReading(markdown: string): { words: string; readingTime: string } {
  const count = normalizeArabicText(markdown)
    .replace(/^---[\s\S]*?---/, "")
    .split(/\s+/)
    .filter(Boolean).length;
  const minutes = Math.max(1, Math.round(count / 180));
  return { words: `${count} كلمة`, readingTime: `${minutes} دقائق` };
}

/** Serialize meta + body markdown back into a .md source for publishing. */
export function serializeArticleMarkdown(meta: ArticleMeta, bodyMarkdown: string): string {
  const themes = meta.themes.length ? `[${meta.themes.join(", ")}]` : "[]";
  const lines = [
    "---",
    `id: ${meta.id}`,
    `file: ${meta.file}`,
    `title: ${meta.title}`,
    `subtitle: ${meta.subtitle}`,
    `date: ${meta.date}`,
    `year: ${meta.year}`,
    `category: ${meta.category}`,
    `genre: ${meta.genre}`,
    `themes: ${themes}`,
    `readingTime: ${meta.readingTime}`,
    `words: ${meta.words}`,
    `mood: ${meta.mood}`,
    `pdf: ${meta.pdf}`,
    `summary: ${meta.summary}`,
    `signal: ${meta.signal}`,
    "---",
    "",
    normalizeArabicText(bodyMarkdown),
    ""
  ];
  return lines.join("\n");
}

/** Slug for new article files: article8, article9… based on existing files. */
export function nextArticleFile(existing: string[]): string {
  let max = 0;
  for (const name of existing) {
    const match = name.match(/^article(\d+)$/);
    if (match) max = Math.max(max, Number(match[1]));
  }
  return `article${max + 1}`;
}
