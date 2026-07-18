"use client";

import { forwardRef } from "react";
import type { Article } from "@/data/articles";
import type { ShelfBook } from "@/data/shelf";
import { AinMark } from "../ain-mark";
import styles from "./library.module.css";

type BookSpineProps = {
  book: ShelfBook & { articles: Article[] };
  onOpen: (book: ShelfBook & { articles: Article[] }, element: HTMLButtonElement) => void;
};

const BASE_HEIGHT = 17; /* rem */
const BASE_WIDTH = 3.6; /* rem */

function arabicDigits(value: number) {
  return String(value).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[Number(d)]);
}

/**
 * One standing book on the shelf. A button: keyboard reachable, opens the
 * category. Books with no texts yet stand dimmer — "unwritten" volumes.
 */
export const BookSpine = forwardRef<HTMLButtonElement, BookSpineProps>(function BookSpine(
  { book, onOpen },
  ref
) {
  const empty = book.articles.length === 0;

  return (
    <button
      ref={ref}
      type="button"
      className={`${styles.book} ${empty ? styles.unwritten : ""}`}
      style={{
        width: `${BASE_WIDTH * book.thickness}rem`,
        height: `${BASE_HEIGHT * book.height}rem`
      }}
      onClick={(event) => onOpen(book, event.currentTarget)}
      aria-label={`${book.title} — ${empty ? "كتاب لم يُكتب بعد" : `${book.articles.length} نصوص`}`}
    >
      <span
        className={styles.spine}
        style={{
          background: `linear-gradient(160deg, ${book.binding.from}, ${book.binding.to})`
        }}
      >
        <AinMark variant="a" size={16} className={styles.spineMark} />
        <span className={styles.spineTitle}>{book.title}</span>
        <span style={{ color: "var(--bronze)", fontSize: "0.62rem" }}>
          {empty ? "···" : arabicDigits(book.articles.length)}
        </span>
      </span>
      <span className={styles.plate} aria-hidden>
        <span style={{ display: "block", color: "var(--accent)", fontSize: "0.95rem", fontWeight: 700 }}>
          {book.title}
        </span>
        <span style={{ display: "block", color: "var(--warm-gray)", fontSize: "0.8rem", lineHeight: 1.7 }}>
          {book.tagline}
        </span>
      </span>
    </button>
  );
});
