import { notFound } from "next/navigation";
import { getReadBookById, BooksRead } from "@/books/books-index";
import ReadBookDetail from "@/components/read-book-detail/read-book-detail";

interface PageProps {
  params: Promise<{ "book-id": string }>;
}

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  const params: { "book-id": string }[] = [];
  for (const book of BooksRead) {
    params.push({ "book-id": book.id });
    const slug = book.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    if (slug && slug !== book.id) {
      params.push({ "book-id": slug });
    }
  }
  return params;
}

export default async function InterceptedReadBookPage({ params }: PageProps) {
  const { "book-id": bookId } = await params;
  const book = getReadBookById(bookId);

  if (!book) {
    notFound();
  }

  return <ReadBookDetail book={book} isIntercepted={true} />;
}
