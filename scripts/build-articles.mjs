import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { cleanArabicLine, escapeHtml, normalizeArabicText, renderArticleHtml, withBasePath } from "./article-renderer.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const contentDir = path.join(root, "content", "articles");
const articlesDir = path.join(root, "public", "articles");
const generatedDataPath = path.join(root, "src", "data", "articles.generated.ts");

const requiredFields = [
  "id",
  "file",
  "title",
  "subtitle",
  "date",
  "year",
  "category",
  "genre",
  "themes",
  "readingTime",
  "words",
  "mood",
  "pdf",
  "summary",
  "signal"
];

function parseScalar(value) {
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

function parseFrontmatter(source, filePath) {
  const normalized = normalizeArabicText(source);
  const match = normalized.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);

  if (!match) {
    throw new Error(`Missing frontmatter in ${filePath}`);
  }

  const data = {};

  for (const line of match[1].split("\n")) {
    if (!line.trim() || line.trim().startsWith("#")) {
      continue;
    }

    const separator = line.indexOf(":");
    if (separator === -1) {
      throw new Error(`Invalid frontmatter line in ${filePath}: ${line}`);
    }

    const key = line.slice(0, separator).trim();
    const value = line.slice(separator + 1);
    data[key] = parseScalar(value);
  }

  for (const field of requiredFields) {
    if (data[field] === undefined || data[field] === "") {
      throw new Error(`Missing "${field}" in ${filePath}`);
    }
  }

  return {
    article: {
      ...data,
      href: withBasePath(`/articles/${data.file}.html`),
      pdf: withBasePath(data.pdf),
      source: path.relative(root, filePath)
    },
    markdown: match[2].trim()
  };
}

function linesToInlineHtml(lines) {
  return escapeHtml(lines.map(cleanArabicLine).join(" "));
}

function renderPoem(block) {
  const lines = block
    .replace(/^::poem\s*\n/, "")
    .replace(/\n::\s*$/, "")
    .split("\n")
    .map(cleanArabicLine)
    .filter(Boolean);

  return `<div class="stanza">${escapeHtml(lines.join("\n"))}</div>`;
}

function markdownBlockToHtml(block) {
  const trimmed = block.trim();
  const lines = trimmed.split("\n");

  if (!trimmed || trimmed.startsWith("<!--")) {
    return "";
  }

  if (trimmed.startsWith("::poem") && trimmed.endsWith("::")) {
    return renderPoem(trimmed);
  }

  if (lines.length === 1 && lines[0].startsWith("### ")) {
    return `<h3>${escapeHtml(cleanArabicLine(lines[0].slice(4)))}</h3>`;
  }

  if (lines.length === 1 && lines[0].startsWith("## ")) {
    return `<h2>${escapeHtml(cleanArabicLine(lines[0].slice(3)))}</h2>`;
  }

  if (lines.every((line) => line.trim().startsWith(">"))) {
    const quoteLines = lines.map((line) => cleanArabicLine(line.replace(/^>\s?/, ""))).filter(Boolean);
    return `<blockquote>${escapeHtml(quoteLines.join("\n"))}</blockquote>`;
  }

  return `<p>${linesToInlineHtml(lines)}</p>`;
}

function markdownToHtml(markdown) {
  return normalizeArabicText(markdown)
    .split(/\n{2,}/)
    .map(markdownBlockToHtml)
    .filter(Boolean)
    .join("\n");
}

function sortArticles(left, right) {
  return left.id.localeCompare(right.id, "en", { numeric: true });
}

function toGeneratedArticle(article) {
  const {
    id,
    title,
    subtitle,
    date,
    year,
    category,
    genre,
    themes,
    readingTime,
    words,
    mood,
    href,
    pdf,
    summary,
    signal
  } = article;

  return {
    id,
    title,
    subtitle,
    date,
    year,
    category,
    genre,
    themes,
    readingTime,
    words,
    mood,
    href,
    pdf,
    summary,
    signal
  };
}

function writeGeneratedData(articles) {
  const source = `import type { Article } from "./articles";

export const articles = ${JSON.stringify(articles.map(toGeneratedArticle), null, 2)} satisfies Article[];
`;

  writeFileSync(generatedDataPath, source);
}

if (!existsSync(contentDir)) {
  throw new Error(`Missing content directory: ${contentDir}`);
}

mkdirSync(articlesDir, { recursive: true });

const files = readdirSync(contentDir)
  .filter((file) => file.endsWith(".md"))
  .sort();

if (files.length === 0) {
  throw new Error(`No Markdown articles found in ${contentDir}`);
}

const entries = files
  .map((file) => {
    const filePath = path.join(contentDir, file);
    const parsed = parseFrontmatter(readFileSync(filePath, "utf8"), filePath);
    return {
      ...parsed,
      bodyHtml: markdownToHtml(parsed.markdown)
    };
  })
  .sort((left, right) => sortArticles(left.article, right.article));

const allArticles = entries.map((entry) => entry.article);

for (const entry of entries) {
  const html = renderArticleHtml(entry.article, entry.bodyHtml, allArticles);
  writeFileSync(path.join(articlesDir, `${entry.article.file}.html`), html);
  console.log(`generated public/articles/${entry.article.file}.html`);
}

writeGeneratedData(allArticles);
console.log("generated src/data/articles.generated.ts");
