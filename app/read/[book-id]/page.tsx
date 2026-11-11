import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getReadBookById, BooksRead } from "@/books/books-index";
import ReadBookDetail from "@/components/read-book-detail/read-book-detail";

interface PageProps {
  params: Promise<{ "book-id": string }>;
}

export const instant = false;

export function generateStaticParams() {
  return BooksRead.map((book) => ({
    "book-id": book.id,
  }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { "book-id": bookId } = await params;
  const book = getReadBookById(bookId);

  if (!book) {
    return {
      title: "Book Not Found | kshitijkumar.me",
    };
  }

  return {
    title: `${book.title} by ${book.author} | kshitijkumar.me`,
    description: `Read and explore "${book.title}" on Kshitij's bookshelf.`,
  };
}

async function StandaloneContent({ params }: PageProps) {
  const { "book-id": bookId } = await params;
  const book = getReadBookById(bookId);

  if (!book) {
    notFound();
  }

  return <ReadBookDetail book={book} isIntercepted={false} />;
}

export default function ReadBookStandalonePage(props: PageProps) {
  return (
    <Suspense fallback={null}>
      <StandaloneContent {...props} />
    </Suspense>
  );
}
