import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Reader } from "@/components/reader/reader";
import { articleByFile, articles } from "@/data/articles";
import { bookOfArticle } from "@/data/shelf";

export function generateStaticParams() {
  return articles.map((article) => ({ file: article.file }));
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ file: string }>;
}): Promise<Metadata> {
  const { file } = await params;
  const article = articleByFile(file);
  if (!article) return {};
  return {
    title: `${article.title} | مكتبة عين`,
    description: article.summary
  };
}

export default async function ReadPage({ params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  const article = articleByFile(file);
  if (!article) notFound();

  const book = bookOfArticle(article);
  const siblings = book ? book.articles : articles;
  const index = siblings.findIndex((item) => item.file === article.file);
  const previous = index > 0 ? siblings[index - 1] : undefined;
  const next = index >= 0 && index < siblings.length - 1 ? siblings[index + 1] : undefined;

  return <Reader article={article} book={book} previous={previous} next={next} />;
}
