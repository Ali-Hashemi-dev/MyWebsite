# كتابة النصوص — Writing & Publishing

There are two ways to publish. Both end up as git commits in `content/articles/`,
so everything is tracked on GitHub either way.

## 1. From the website (recommended) — المكتب السري

Open `/admin/` on the site, enter the PIN, and write. The studio:

- lists every text, opens any of them for editing, and creates new ones;
- previews the manuscript exactly as readers will see it;
- publishes by committing the markdown straight to this repo via the GitHub
  API (the token you paste in الإعدادات stays in your browser only);
- each publish triggers the GitHub Pages workflow, and the text is readable
  immediately at `/read/?f=<file>` while the rebuild runs.

PIN: set in `src/data/site-config.ts` (`ADMIN_PIN_HASH`, SHA-256 of the PIN).

## 2. By hand

Edit `content/articles/*.md` with this structure:

```md
---
id: 08
file: article8
title: عنوان النص
subtitle: عنوان فرعي
date: 2026/07/19
year: 2026
category: مزيج أدبي
genre: قصة
themes: [ذاكرة, طبيعة]
readingTime: 4 دقائق
words: 700 كلمة
mood: تأملي
pdf:
summary: سطر واحد يصف النص.
signal: ذاكرة، طبيعة
---

فقرة أولى.

فقرة ثانية.
```

Rules:

- Separate paragraphs with one blank line.
- `## عنوان` and `### عنوان` for headings, `> سطر` for quotes.
- For poetry:

```md
::poem
سطر أول
سطر ثان
::
```

- `pdf` may be left empty — the reader hides the PDF button.
- Arabic harakat are preserved; hidden bidi control characters are stripped.

After editing by hand, run:

```bash
npm run build:articles
```

then commit and push — GitHub Pages redeploys automatically.

To regenerate Markdown from PDFs only when needed:

```bash
npm run import:pdfs -- --force
```

Warning: `import:pdfs -- --force` overwrites edited Markdown files.
