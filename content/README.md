# Article Editing

Edit articles in `content/articles/*.md`.

Use this structure:

```md
---
title: عنوان النص
date: 2026/04/12
---

فقرة أولى.

فقرة ثانية.
```

Rules:

- Separate paragraphs with one blank line.
- Do not add manual spaces before Arabic text.
- Arabic harakat are preserved.
- Hidden bidi control characters are removed by the converter.
- For poetry, use:

```md
::poem
سطر أول
سطر ثان
::
```

After editing, run:

```bash
npm run build:articles
```

To regenerate Markdown from PDFs only when needed:

```bash
npm run import:pdfs -- --force
```

Warning: `import:pdfs -- --force` overwrites edited Markdown files.
