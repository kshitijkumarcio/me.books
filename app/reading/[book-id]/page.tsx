import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCurrentReadBookById, currentReads } from "@/books/books-index";
import CRBookDetail from "@/components/current-reads/cr-book-detail";

interface PageProps {
  params: Promise<{ "book-id": string }>;
}

export function generateStaticParams() {
  const params: { "book-id": string }[] = [];
  for (const book of currentReads) {
    params.push({ "book-id": book.id });
    const slug = book.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    if (slug && slug !== book.id) {
      params.push({ "book-id": slug });
    }
  }
  return params;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { "book-id": bookId } = await params;
  const book = getCurrentReadBookById(bookId);

  if (!book) {
    return {
      title: "Book Not Found | kshitijkumar.me",
    };
  }

  return {
    title: `${book.title} by ${book.author} | Currently Reading`,
    description: `Currently reading "${book.title}" on Kshitij's bookshelf.`,
  };
}

export default async function CurrentReadStandalonePage({ params }: PageProps) {
  const { "book-id": bookId } = await params;
  const book = getCurrentReadBookById(bookId);

  if (!book) {
    notFound();
  }

  return <CRBookDetail book={book} isIntercepted={false} />;
}
