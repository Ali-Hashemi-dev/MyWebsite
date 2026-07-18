import { LibraryScene } from "@/components/library/library-scene";
import { HomeSections } from "@/components/home-sections";
import { booksWithArticles } from "@/data/shelf";
import { aboutParagraphs, articles } from "@/data/articles";

export default function Page() {
  const books = booksWithArticles();
  const recent = [...articles]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 3);

  return (
    <>
      <LibraryScene books={books} />
      <HomeSections recent={recent} aboutExcerpt={aboutParagraphs[0]} />
    </>
  );
}
