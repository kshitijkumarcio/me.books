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

export default async function InterceptedCRBookPage({ params }: PageProps) {
  const { "book-id": bookId } = await params;
  const book = getCurrentReadBookById(bookId);

  if (!book) {
    notFound();
  }

  return <CRBookDetail book={book} isIntercepted={true} />;
}
