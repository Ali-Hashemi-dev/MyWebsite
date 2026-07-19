"use client";

import type { ArticleBlock } from "@/data/articles";

/** One rendered block, mirroring the reader's manuscript styling. */
function PreviewBlock({ block }: { block: ArticleBlock }) {
  switch (block.type) {
    case "h2":
      return <h2 className="font-display mt-12 mb-5 text-3xl" style={{ color: "#2a1b10" }}>{block.text}</h2>;
    case "h3":
      return <h3 className="font-display mt-8 mb-3 text-2xl" style={{ color: "#3b2716" }}>{block.text}</h3>;
    case "quote":
      return (
        <blockquote
          className="my-8 border-r-2 pr-6 text-lg leading-loose"
          style={{ borderColor: "var(--accent)", color: "#5a4326", marginRight: 0 }}
        >
          {block.lines.map((line, i) => (
            <p key={i} className="m-0 mb-2" style={{ textAlign: "right" }}>
              {line}
            </p>
          ))}
        </blockquote>
      );
    case "poem":
      return (
        <div className="my-10 text-center">
          <div
            aria-hidden
            className="mx-auto mb-5 h-px w-16"
            style={{ background: "linear-gradient(90deg, transparent, var(--accent), transparent)" }}
          />
          {block.lines.map((line, i) => (
            <p key={i} className="font-naskh m-0 mb-3 text-xl leading-loose" style={{ color: "#3b2716" }}>
              {line}
            </p>
          ))}
          <div
            aria-hidden
            className="mx-auto mt-5 h-px w-16"
            style={{ background: "linear-gradient(90deg, transparent, var(--accent), transparent)" }}
          />
        </div>
      );
    default:
      return <p>{block.text}</p>;
  }
}

/** Live manuscript preview: the body rendered on parchment as readers will see it. */
export function ArticlePreview({ blocks }: { blocks: ArticleBlock[] }) {
  return (
    <div
      dir="rtl"
      className="paper reader-body font-naskh rounded-lg px-6 py-10 sm:px-10 sm:py-12"
      style={{
        color: "#241610",
        boxShadow: "0 24px 60px rgba(0,0,0,0.5), inset 0 0 50px rgba(138,107,69,0.12)"
      }}
    >
      {blocks.length ? (
        blocks.map((block, index) => <PreviewBlock key={index} block={block} />)
      ) : (
        <p className="text-center" style={{ opacity: 0.55 }}>
          المعاينة فارغة — اكتب شيئاً في النص.
        </p>
      )}
    </div>
  );
}
