const hiddenDirectionControls = /[\u200e\u200f\u202a-\u202e\u2066-\u2069]/g;
const arabicMarksOnly = /^[\u064b-\u065f\u0670\s]+$/;

export function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function normalizeArabicText(value) {
  return String(value ?? "")
    .normalize("NFC")
    .replace(hiddenDirectionControls, "")
    .replace(/\u00a0/g, " ")
    .replace(/\f/g, "\n\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{4,}/g, "\n\n\n")
    .trim();
}

export function cleanArabicLine(value) {
  return normalizeArabicText(value)
    .replace(/\s+/g, " ")
    .replace(/\s+([،؛:؟.!])/g, "$1")
    .replace(/([،؛:؟.!])(?=[^\s،؛:؟.!"'»”)\]}])/g, "$1 ")
    .replace(/([([{«])\s+/g, "$1")
    .replace(/\s+([)\]}»])/g, "$1")
    .trim();
}

export function isPageNumberLine(value) {
  return /^[\d٠-٩۰-۹]+$/.test(value);
}

export function isExtractionNoiseLine(value) {
  return arabicMarksOnly.test(value);
}

function endsParagraph(value) {
  return /[.!؟]["'»”)\]}]*$/.test(value);
}

export function plainTextToParagraphs(text) {
  const paragraphs = [];
  let current = [];

  function pushParagraph(lines) {
    const paragraph = cleanArabicLine(lines.join(" "));
    if (paragraph) {
      paragraphs.push(paragraph);
    }
  }

  function flushCurrent() {
    if (current.length === 0) {
      return;
    }

    if (current.length <= 4 && current.every((line) => line.length <= 92)) {
      current.forEach((line) => pushParagraph([line]));
    } else {
      pushParagraph(current);
    }

    current = [];
  }

  for (const rawLine of normalizeArabicText(text).split("\n")) {
    const line = cleanArabicLine(rawLine);

    if (!line || isPageNumberLine(line) || isExtractionNoiseLine(line)) {
      flushCurrent();
      continue;
    }

    current.push(line);

    if (endsParagraph(line)) {
      flushCurrent();
    }
  }

  flushCurrent();
  return paragraphs;
}

export function paragraphsToHtml(paragraphs) {
  return paragraphs
    .filter(Boolean)
    .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
    .join("\n");
}

function indentHtml(value, spaces = 10) {
  const prefix = " ".repeat(spaces);
  return String(value)
    .split("\n")
    .map((line) => `${prefix}${line}`)
    .join("\n");
}

export function withBasePath(href) {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

  if (!basePath || !href || !href.startsWith("/") || href === basePath || href.startsWith(`${basePath}/`)) {
    return href;
  }

  return `${basePath}${href}`;
}

function toHref(value) {
  return escapeHtml(value);
}

export function renderArticleHtml(article, bodyHtml, allArticles) {
  const index = allArticles.findIndex((item) => item.file === article.file);
  const previous = index > 0 ? allArticles[index - 1] : undefined;
  const next = index >= 0 ? allArticles[index + 1] : undefined;
  const pdf = article.pdf ?? `/pdfs/${article.file}.pdf`;
  const previousLink = previous
    ? `<a href="${toHref(withBasePath(`/articles/${previous.file}.html`))}">السابق: ${escapeHtml(previous.title)}</a>`
    : `<span>لا يوجد نص سابق</span>`;
  const nextLink = next
    ? `<a href="${toHref(withBasePath(`/articles/${next.file}.html`))}">التالي: ${escapeHtml(next.title)}</a>`
    : `<span>لا يوجد نص تال</span>`;
  const bottomNext = next ? `/articles/${next.file}.html` : "/reading";
  const bottomNextLabel = next ? "التالي" : "الأرشيف";
  const sourceComment = article.source ? `\n            Source: ${escapeHtml(article.source)}` : "";

  return `<!doctype html>
<html lang="ar" dir="rtl">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(article.title)} | علي هاشمي</title>
    <meta name="description" content="${escapeHtml(article.title)} - ${escapeHtml(article.subtitle)}. نص أدبي لعلي هاشمي." />
    <style>
      :root {
        color-scheme: dark;
        --bg: #080706;
        --panel: rgba(255, 255, 255, 0.06);
        --text: #fff8ef;
        --muted: #b9afa4;
        --line: rgba(255, 255, 255, 0.14);
        --accent: #f97316;
        --reader-size: 1rem;
      }

      * { box-sizing: border-box; }

      body {
        margin: 0;
        min-height: 100vh;
        background:
          radial-gradient(circle at 16% 12%, rgba(249, 115, 22, 0.24), transparent 34rem),
          radial-gradient(circle at 84% 8%, rgba(255, 255, 255, 0.10), transparent 24rem),
          linear-gradient(145deg, #080706, #12100e 48%, #1f1208);
        color: var(--text);
        font-family: "Noto Sans Arabic", "Segoe UI", Tahoma, Arial, sans-serif;
        line-height: 2;
      }

      body::before {
        content: "";
        position: fixed;
        inset: 0;
        pointer-events: none;
        opacity: 0.16;
        background-image:
          linear-gradient(rgba(255,255,255,.06) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,.05) 1px, transparent 1px);
        background-size: 52px 52px;
        mask-image: linear-gradient(to bottom, black, transparent);
      }

      main {
        width: min(980px, calc(100% - 32px));
        margin: 0 auto;
        padding: 56px 0 110px;
      }

      .progress {
        position: fixed;
        inset: 0 0 auto 0;
        z-index: 20;
        height: 3px;
        transform-origin: right;
        background: linear-gradient(90deg, #7c2d12, #f97316, #fff8ef);
      }

      .top-actions {
        display: flex;
        justify-content: space-between;
        gap: 12px;
        margin-bottom: 16px;
      }

      .top-actions a,
      .top-actions button,
      .nav-row a,
      .nav-row span,
      .bottom-nav a {
        border: 1px solid var(--line);
        border-radius: 999px;
        padding: 10px 14px;
        color: var(--text);
        background: rgba(255,255,255,0.06);
        text-decoration: none;
        font: inherit;
        font-weight: 800;
      }

      button { cursor: pointer; }

      .chrome {
        border: 1px solid var(--line);
        border-radius: 32px;
        background: var(--panel);
        box-shadow: 0 32px 100px rgba(0, 0, 0, 0.46);
        overflow: hidden;
        backdrop-filter: blur(22px);
      }

      header {
        padding: clamp(28px, 6vw, 64px);
        border-bottom: 1px solid var(--line);
        background:
          linear-gradient(135deg, rgba(249, 115, 22, 0.22), transparent 48%),
          rgba(255,255,255,0.02);
      }

      .meta {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        margin-bottom: 24px;
        color: var(--muted);
        font-size: 0.95rem;
      }

      .pill {
        border: 1px solid var(--line);
        border-radius: 999px;
        padding: 6px 12px;
        background: rgba(255,255,255,0.06);
      }

      h1 {
        margin: 0;
        font-size: clamp(2.4rem, 7vw, 5.8rem);
        letter-spacing: 0;
        line-height: 1.1;
      }

      p.subtitle {
        margin: 18px 0 0;
        color: var(--accent);
        font-size: clamp(1.15rem, 2.2vw, 1.55rem);
      }

      .source {
        display: inline-flex;
        margin-top: 30px;
        align-items: center;
        gap: 8px;
        color: #111;
        background: #fff8ef;
        border-radius: 999px;
        padding: 10px 16px;
        text-decoration: none;
        font-weight: 800;
      }

      .article-body {
        padding: clamp(26px, 5vw, 60px);
        color: #f5eee6;
        font-size: var(--reader-size);
      }

      .article-body p,
      .article-body blockquote {
        margin: 0 0 1.35rem;
        max-width: 72ch;
        text-align: right;
      }

      .article-body p {
        text-indent: 1.6rem;
      }

      .article-body p:first-child {
        text-indent: 0;
      }

      .article-body h2,
      .article-body h3 {
        max-width: 72ch;
        margin: 2.25rem 0 1rem;
        color: var(--accent);
        line-height: 1.45;
      }

      .article-body h2 { font-size: clamp(1.45rem, 3vw, 2rem); }
      .article-body h3 { font-size: clamp(1.15rem, 2.4vw, 1.45rem); }

      .article-body blockquote {
        border-right: 3px solid var(--accent);
        padding: 0.25rem 1rem 0.25rem 0;
        color: #f6c7a1;
        background: rgba(249, 115, 22, 0.06);
        border-radius: 0 18px 18px 0;
      }

      .article-body .stanza {
        max-width: 72ch;
        margin: 0 0 1.35rem;
        white-space: pre-line;
        color: #f5eee6;
      }

      body.large {
        --reader-size: 1.16rem;
      }

      .nav-row {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        gap: 12px;
        padding: 0 clamp(26px, 5vw, 60px) clamp(26px, 5vw, 60px);
      }

      .bottom-nav {
        position: fixed;
        right: 50%;
        bottom: 14px;
        z-index: 30;
        display: none;
        transform: translateX(50%);
        gap: 8px;
        width: min(520px, calc(100% - 24px));
        justify-content: center;
        border: 1px solid var(--line);
        border-radius: 999px;
        background: rgba(8, 7, 6, 0.78);
        padding: 8px;
        backdrop-filter: blur(18px);
      }

      .bottom-nav a {
        flex: 1;
        text-align: center;
        padding: 9px 10px;
      }

      @media (max-width: 640px) {
        main { width: min(100% - 20px, 980px); padding-top: 24px; }
        .chrome { border-radius: 22px; }
        .top-actions { flex-direction: column; }
        .bottom-nav { display: flex; }
      }
    </style>
  </head>
  <body>
    <div class="progress" id="progress"></div>
    <main>
      <div class="top-actions">
        <a href="${toHref(withBasePath("/reading"))}">العودة إلى الأرشيف</a>
        <button type="button" id="font-toggle">تكبير الخط</button>
      </div>
      <section class="chrome" aria-labelledby="article-title">
        <header>
          <div class="meta">
            <span class="pill">علي هاشمي</span>
            <span class="pill">${escapeHtml(article.category)}</span>
            <span class="pill">${escapeHtml(article.date)}</span>
            <span class="pill">${escapeHtml(article.readingTime)}</span>
            <span class="pill">${escapeHtml(article.words)}</span>
            <span class="pill">نص أصلي / أرشيف شخصي</span>
          </div>
          <h1 id="article-title">${escapeHtml(article.title)}</h1>
          <p class="subtitle">${escapeHtml(article.subtitle)}</p>
          <a class="source" href="${toHref(withBasePath(pdf))}">فتح النسخة الأصلية PDF</a>
        </header>
        <article class="article-body">
          <!--
            Generated article body.${sourceComment}
            Edit the Markdown source, then run: npm run build:articles
          -->
${indentHtml(bodyHtml)}
        </article>
        <nav class="nav-row" aria-label="التنقل بين المقالات">
          ${previousLink}
          ${nextLink}
        </nav>
      </section>
    </main>
    <nav class="bottom-nav" aria-label="تنقل سريع">
      <a href="${toHref(withBasePath("/reading"))}">فهرس</a>
      <a href="${toHref(withBasePath(pdf))}">PDF</a>
      <a href="${toHref(withBasePath(bottomNext))}">${escapeHtml(bottomNextLabel)}</a>
    </nav>
    <script>
      const progress = document.getElementById("progress");
      const fontToggle = document.getElementById("font-toggle");

      function updateProgress() {
        const scrollable = document.documentElement.scrollHeight - window.innerHeight;
        const amount = scrollable > 0 ? window.scrollY / scrollable : 0;
        progress.style.transform = "scaleX(" + amount + ")";
      }

      fontToggle.addEventListener("click", () => {
        document.body.classList.toggle("large");
        fontToggle.textContent = document.body.classList.contains("large") ? "تصغير الخط" : "تكبير الخط";
      });

      updateProgress();
      window.addEventListener("scroll", updateProgress, { passive: true });
    </script>
  </body>
</html>
`;
}
