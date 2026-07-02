import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { articles } from "./article-manifest.mjs";
import { normalizeArabicText, paragraphsToHtml, plainTextToParagraphs, renderArticleHtml } from "./article-renderer.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const articlesDir = path.join(root, "public", "articles");
const pdfDir = path.join(root, "public", "pdfs");

mkdirSync(articlesDir, { recursive: true });

for (const article of articles) {
  const pdfPath = path.join(pdfDir, `${article.file}.pdf`);

  if (!existsSync(pdfPath)) {
    throw new Error(`Missing PDF: ${pdfPath}`);
  }

  const rawText = execFileSync("pdftotext", ["-enc", "UTF-8", "-nopgbrk", pdfPath, "-"], {
    encoding: "utf8"
  });
  const bodyHtml = paragraphsToHtml(plainTextToParagraphs(normalizeArabicText(rawText)));
  const html = renderArticleHtml(article, bodyHtml, articles);

  writeFileSync(path.join(articlesDir, `${article.file}.html`), html);
  console.log(`generated public/articles/${article.file}.html`);
}
