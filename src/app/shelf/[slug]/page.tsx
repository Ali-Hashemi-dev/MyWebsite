import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CategoryView } from "@/components/shelf/category-view";
import { bookBySlug, shelfBooks } from "@/data/shelf";

export function generateStaticParams() {
  return shelfBooks.map((book) => ({ slug: book.slug }));
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const book = bookBySlug(slug);
  if (!book) return {};
  return {
    title: `${book.title} | مكتبة علي هاشمي`,
    description: book.tagline
  };
}

export default async function ShelfPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const book = bookBySlug(slug);
  if (!book) notFound();

  return <CategoryView book={book} />;
}
