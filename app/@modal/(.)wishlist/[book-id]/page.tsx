import { notFound } from "next/navigation";
import { getWishlistBookById, wishlistBooks } from "@/books/books-index";
import WishlistBookDetail from "@/components/wishlist/wishlist-book-detail";

interface PageProps {
  params: Promise<{ "book-id": string }>;
}

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  const params: { "book-id": string }[] = [];
  for (const book of wishlistBooks) {
    params.push({ "book-id": book.id });
    const slug = book.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    if (slug && slug !== book.id) {
      params.push({ "book-id": slug });
    }
  }
  return params;
}

export default async function InterceptedWishlistBookPage({ params }: PageProps) {
  const { "book-id": bookId } = await params;
  const book = getWishlistBookById(bookId);

  if (!book) {
    notFound();
  }

  return <WishlistBookDetail book={book} isIntercepted={true} />;
}
