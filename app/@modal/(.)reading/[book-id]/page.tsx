import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getCurrentReadBookById, currentReads } from "@/books/books-index";
import CRBookDetail from "@/components/current-reads/cr-book-detail";

interface PageProps {
  params: Promise<{ "book-id": string }>;
}

export function generateStaticParams() {
  return currentReads.map((book) => ({
    "book-id": book.id,
  }));
}

async function CRBookModalContent({ params }: PageProps) {
  const { "book-id": bookId } = await params;
  const book = getCurrentReadBookById(bookId);

  if (!book) {
    notFound();
  }

  return <CRBookDetail book={book} isIntercepted={true} />;
}

export default function InterceptedCRBookPage(props: PageProps) {
  return (
    <Suspense fallback={null}>
      <CRBookModalContent {...props} />
    </Suspense>
  );
}
