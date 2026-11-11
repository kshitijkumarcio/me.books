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

async function ReadBookModalContent({ params }: PageProps) {
  const { "book-id": bookId } = await params;
  const book = getReadBookById(bookId);

  if (!book) {
    notFound();
  }

  return <ReadBookDetail book={book} isIntercepted={true} />;
}

export default function InterceptedReadBookPage(props: PageProps) {
  return (
    <Suspense fallback={null}>
      <ReadBookModalContent {...props} />
    </Suspense>
  );
}
