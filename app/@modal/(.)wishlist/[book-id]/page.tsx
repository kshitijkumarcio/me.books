import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getWishlistBookById, wishlistBooks } from "@/books/books-index";
import WishlistBookDetail from "@/components/wishlist/wishlist-book-detail";

interface PageProps {
  params: Promise<{ "book-id": string }>;
}

export function generateStaticParams() {
  return wishlistBooks.map((book) => ({
    "book-id": book.id,
  }));
}

async function WishlistBookModalContent({ params }: PageProps) {
  const { "book-id": bookId } = await params;
  const book = getWishlistBookById(bookId);

  if (!book) {
    notFound();
  }

  return <WishlistBookDetail book={book} isIntercepted={true} />;
}

export default function InterceptedWishlistBookPage(props: PageProps) {
  return (
    <Suspense fallback={null}>
      <WishlistBookModalContent {...props} />
    </Suspense>
  );
}
