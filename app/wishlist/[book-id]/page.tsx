import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getWishlistBookById, wishlistBooks } from "@/books/books-index";
import WishlistBookDetail from "@/components/wishlist/wishlist-book-detail";

interface PageProps {
  params: Promise<{ "book-id": string }>;
}

export const instant = false;

export function generateStaticParams() {
  return wishlistBooks.map((book) => ({
    "book-id": book.id,
  }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { "book-id": bookId } = await params;
  const book = getWishlistBookById(bookId);

  if (!book) {
    return {
      title: "Book Not Found | kshitijkumar.me",
    };
  }

  return {
    title: `${book.title} by ${book.author} | Wishlist`,
    description: `Explore "${book.title}" on Kshitij's wishlist.`,
  };
}

async function StandaloneContent({ params }: PageProps) {
  const { "book-id": bookId } = await params;
  const book = getWishlistBookById(bookId);

  if (!book) {
    notFound();
  }

  return <WishlistBookDetail book={book} isIntercepted={false} />;
}

export default function WishlistBookStandalonePage(props: PageProps) {
  return (
    <Suspense fallback={null}>
      <StandaloneContent {...props} />
    </Suspense>
  );
}
