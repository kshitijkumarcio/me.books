"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  getReadBookById,
  getCurrentReadBookById,
  getWishlistBookById,
  type ReadBook,
  type CurrentlyReadingBook,
  type WishlistBook,
} from "@/books/books-index";
import { useReadBookModal } from "@/hooks/layout-hooks/use-read-book-modal";

export const useActiveBookRoute = () => {
  const pathname = usePathname();
  const router = useRouter();
  const {
    isClosing,
    triggerClose,
    isInterceptedOpen,
    activeModal,
    clearActiveModal,
  } = useReadBookModal();

  const isReadBookRoute =
    Boolean(pathname?.includes("/read/")) || activeModal?.type === "read";
  const isReadingRoute =
    Boolean(pathname?.includes("/reading/")) || activeModal?.type === "reading";
  const isWishlistRoute =
    Boolean(pathname?.includes("/wishlist/")) || activeModal?.type === "wishlist";
  const isAnyModalRoute = isReadBookRoute || isReadingRoute || isWishlistRoute;
  const isShowingBookControls = isAnyModalRoute && !isClosing;

  let currentReadBook: ReadBook | undefined =
    activeModal?.type === "read" ? activeModal.book : undefined;
  if (!currentReadBook && isReadBookRoute && pathname) {
    const parts = pathname.split("/read/");
    const idSegment = parts[1]?.split("/")[0]?.split("?")[0];
    if (idSegment) {
      currentReadBook = getReadBookById(decodeURIComponent(idSegment));
    }
  }

  let currentCRBook: CurrentlyReadingBook | undefined =
    activeModal?.type === "reading" ? activeModal.book : undefined;
  if (!currentCRBook && isReadingRoute && pathname) {
    const parts = pathname.split("/reading/");
    const idSegment = parts[1]?.split("/")[0]?.split("?")[0];
    if (idSegment) {
      currentCRBook = getCurrentReadBookById(decodeURIComponent(idSegment));
    }
  }

  let currentWishlistBook: WishlistBook | undefined =
    activeModal?.type === "wishlist" ? activeModal.book : undefined;
  if (!currentWishlistBook && isWishlistRoute && pathname) {
    const parts = pathname.split("/wishlist/");
    const idSegment = parts[1]?.split("/")[0]?.split("?")[0];
    if (idSegment) {
      currentWishlistBook = getWishlistBookById(decodeURIComponent(idSegment));
    }
  }

  const handleCloseBook = () => {
    triggerClose(() => {
      clearActiveModal();
      if (isInterceptedOpen || Boolean(activeModal)) {
        router.back();
      } else {
        router.push("/");
      }
    });
  };

  const defaultBorrowMsg =
    currentReadBook?.borrowMessage ||
    (currentReadBook
      ? `hey Kshitij! Can I borrow ${currentReadBook.title} by ${currentReadBook.author} from you?`
      : "hey Kshitij! Can I borrow this book from you?");
  const borrowUrl =
    currentReadBook?.borrowUrl ||
    `https://wa.me/918208377317?text=${encodeURIComponent(defaultBorrowMsg)}`;

  const readGoodreadsUrl =
    currentReadBook?.goodreadsUrl ||
    (currentReadBook as { goodreads?: string } | undefined)?.goodreads ||
    (currentReadBook
      ? `https://www.goodreads.com/search?q=${encodeURIComponent(
          `${currentReadBook.title} ${currentReadBook.author}`
        )}`
      : "https://www.goodreads.com");

  const crGoodreadsUrl =
    currentCRBook?.goodreadsUrl ||
    (currentCRBook as { goodreads?: string } | undefined)?.goodreads ||
    (currentCRBook
      ? `https://www.goodreads.com/search?q=${encodeURIComponent(
          `${currentCRBook.title} ${currentCRBook.author}`
        )}`
      : "https://www.goodreads.com");

  const wishlistAmazonUrl =
    currentWishlistBook?.amazonUrl?.trim() ||
    (currentWishlistBook
      ? `https://www.amazon.in/s?k=${encodeURIComponent(
          `${currentWishlistBook.title} ${currentWishlistBook.author} book`
        )}`
      : "https://www.amazon.in");

  const wishlistGoodreadsUrl =
    currentWishlistBook?.goodreadsUrl ||
    (currentWishlistBook as { goodreads?: string } | undefined)?.goodreads ||
    (currentWishlistBook
      ? `https://www.goodreads.com/search?q=${encodeURIComponent(
          `${currentWishlistBook.title} ${currentWishlistBook.author}`
        )}`
      : "https://www.goodreads.com");

  return {
    isReadBookRoute,
    isReadingRoute,
    isWishlistRoute,
    isShowingBookControls,
    handleCloseBook,
    borrowUrl,
    readGoodreadsUrl,
    crGoodreadsUrl,
    wishlistAmazonUrl,
    wishlistGoodreadsUrl,
  };
};
