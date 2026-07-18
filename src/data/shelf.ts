import { articles, type Article } from "./articles";

/**
 * The library shelf is fully configurable: each book on the shelf is defined
 * here, not hardcoded in components. A book collects articles whose `genre`
 * frontmatter matches one of its `genres`. Books with no matching articles
 * still appear on the shelf as "unwritten" volumes.
 *
 * To rename a category, change its `title`. To add a sixth book, add an entry.
 */
export type ShelfBook = {
  /** Stable slug used in URLs: /shelf/[slug]/ */
  slug: string;
  /** Display title on the spine and category page. */
  title: string;
  /** Short poetic tagline shown when the book is examined. */
  tagline: string;
  /** Genres (from article frontmatter) collected by this book. */
  genres: string[];
  /** Leather tone of the binding: CSS color values. */
  binding: { from: string; to: string };
  /** Relative height/thickness so the shelf feels hand-arranged. */
  height: number;
  thickness: number;
};

export const shelfBooks: ShelfBook[] = [
  {
    slug: "stories",
    title: "القصص",
    tagline: "حكايات تُنسج من الذاكرة والطبيعة، وتُقرأ كأنها عاشت قبلنا.",
    genres: ["قصة"],
    binding: { from: "#4a2c1a", to: "#2b1a10" },
    height: 1,
    thickness: 1.15
  },
  {
    slug: "essays",
    title: "المقالات",
    tagline: "تأملات نثرية تسائل الواقع وتعيد ترتيب المعنى.",
    genres: ["مقال"],
    binding: { from: "#3d3a34", to: "#211f1b" },
    height: 0.94,
    thickness: 1
  },
  {
    slug: "poetry",
    title: "الشعر الحر",
    tagline: "سطور تتنفس خارج الوزن، وتضيء ما لا يُقال.",
    genres: ["شعر حر"],
    binding: { from: "#59321c", to: "#33200f" },
    height: 0.9,
    thickness: 0.85
  },
  {
    slug: "letters",
    title: "الرسائل",
    tagline: "كتابٌ لم يُجلَّد بعد؛ رسائل تُكتب على مهل.",
    genres: ["رسالة"],
    binding: { from: "#2e2c33", to: "#1a191e" },
    height: 0.86,
    thickness: 0.8
  },
  {
    slug: "reflections",
    title: "التأملات",
    tagline: "مسودّات خواطر تنتظر ضوءها الأول.",
    genres: ["تأمل"],
    binding: { from: "#4d3b22", to: "#2c2113" },
    height: 0.97,
    thickness: 0.9
  }
];

export function booksWithArticles(): Array<ShelfBook & { articles: Article[] }> {
  return shelfBooks.map((book) => ({
    ...book,
    articles: articles.filter((article) => book.genres.includes(article.genre))
  }));
}

export function bookBySlug(slug: string) {
  return booksWithArticles().find((book) => book.slug === slug);
}

export function bookOfArticle(article: Article) {
  return booksWithArticles().find((book) => book.genres.includes(article.genre));
}
