import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { articles } from "./article-manifest.mjs";
import { cleanArabicLine, normalizeArabicText, plainTextToParagraphs } from "./article-renderer.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const contentDir = path.join(root, "content", "articles");
const pdfDir = path.join(root, "public", "pdfs");
const force = process.argv.includes("--force");

const arabicDigitMap = new Map([
  ["٠", "0"],
  ["١", "1"],
  ["٢", "2"],
  ["٣", "3"],
  ["٤", "4"],
  ["٥", "5"],
  ["٦", "6"],
  ["٧", "7"],
  ["٨", "8"],
  ["٩", "9"],
  ["۰", "0"],
  ["۱", "1"],
  ["۲", "2"],
  ["۳", "3"],
  ["۴", "4"],
  ["۵", "5"],
  ["۶", "6"],
  ["۷", "7"],
  ["۸", "8"],
  ["۹", "9"]
]);

function normalizeDigits(value) {
  return String(value).replace(/[٠-٩۰-۹]/g, (digit) => arabicDigitMap.get(digit) ?? digit);
}

function canonicalArabic(value) {
  return normalizeDigits(cleanArabicLine(value))
    .replace(/[\u064b-\u065f\u0670]/g, "")
    .replace(/[إأآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/[^\p{Script=Arabic}\d]/gu, "");
}

function dateKey(value) {
  const parts = normalizeDigits(value).match(/\d+/g);

  if (!parts || parts.length < 3) {
    return "";
  }

  return parts.map((part) => String(Number(part))).join("/");
}

function shouldDropImportedHeaderLine(line, article) {
  const canonicalLine = canonicalArabic(line);
  const lineDate = dateKey(line);
  const knownValues = [
    "علي هاشمي",
    article.title,
    article.subtitle,
    article.category,
    article.date
  ];

  return knownValues.some((value) => {
    const knownDate = dateKey(value);
    return canonicalLine === canonicalArabic(value) || (lineDate && knownDate && lineDate === knownDate);
  });
}

function stripImportedHeader(rawText, article) {
  const lines = normalizeArabicText(rawText).split("\n");
  let seenNonEmpty = 0;

  return lines
    .filter((line) => {
      const cleaned = cleanArabicLine(line);

      if (!cleaned) {
        return true;
      }

      seenNonEmpty += 1;

      if (seenNonEmpty <= 8 && shouldDropImportedHeaderLine(cleaned, article)) {
        return false;
      }

      return true;
    })
    .join("\n");
}

function serializeValue(value) {
  if (Array.isArray(value)) {
    return `[${value.join(", ")}]`;
  }

  return String(value);
}

function serializeFrontmatter(article) {
  const orderedKeys = [
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

  return orderedKeys.map((key) => `${key}: ${serializeValue(article[key])}`).join("\n");
}

function renderMarkdown(article, rawText) {
  const textWithoutHeader = stripImportedHeader(rawText, article);
  const body = plainTextToParagraphs(textWithoutHeader).join("\n\n");

  return `---
${serializeFrontmatter(article)}
---

<!--
اكتب النص هنا.
افصل بين الفقرات بسطر فارغ.
لا تضف مسافات يدوية قبل الفقرات؛ القالب يتحكم بالمسافات.
للمقاطع الشعرية:
::poem
سطر أول
سطر ثان
::
-->

${body}
`;
}

mkdirSync(contentDir, { recursive: true });

for (const article of articles) {
  const pdfPath = path.join(pdfDir, `${article.file}.pdf`);
  const mdPath = path.join(contentDir, `${article.file}.md`);

  if (!existsSync(pdfPath)) {
    throw new Error(`Missing PDF: ${pdfPath}`);
  }

  if (existsSync(mdPath) && !force) {
    console.log(`skipped content/articles/${article.file}.md`);
    continue;
  }

  const rawText = execFileSync("pdftotext", ["-enc", "UTF-8", "-nopgbrk", pdfPath, "-"], {
    encoding: "utf8"
  });

  writeFileSync(mdPath, renderMarkdown(article, rawText));
  console.log(`generated content/articles/${article.file}.md`);
}
