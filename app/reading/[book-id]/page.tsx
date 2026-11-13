import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getCurrentReadBookById, currentReads } from "@/books/books-index";
import CRBookDetail from "@/components/current-reads/cr-book-detail";

interface PageProps {
  params: Promise<{ "book-id": string }>;
}

export const instant = false;

export function generateStaticParams() {
  return currentReads.map((book) => ({
    "book-id": book.id,
  }));
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

async function StandaloneContent({ params }: PageProps) {
  const { "book-id": bookId } = await params;
  const book = getCurrentReadBookById(bookId);

  if (!book) {
    notFound();
  }

  return <CRBookDetail book={book} isIntercepted={false} />;
}

export default function CurrentReadStandalonePage(props: PageProps) {
  return (
    <Suspense fallback={null}>
      <StandaloneContent {...props} />
    </Suspense>
  );
}
