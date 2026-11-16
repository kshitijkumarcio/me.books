"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BooksRead, currentReads, wishlistBooks } from "@/books/books-index";

export const BookRoutePrefetcher = () => {
  const router = useRouter();

  const allBookRoutes = useMemo(() => {
    const routes: string[] = [];

    // Read books
    for (const book of BooksRead) {
      routes.push(`/read/${book.id}`);
    }

    // Currently reading books
    for (const book of currentReads) {
      routes.push(`/reading/${book.id}`);
    }

    // Wishlist books
    for (const book of wishlistBooks) {
      routes.push(`/wishlist/${book.id}`);
    }

    return routes;
  }, []);

  useEffect(() => {
    // 1. Immediately pre-warm client component chunks so detail modals evaluate instantly
    void import("@/components/read-book-detail/read-book-detail");
    void import("@/components/current-reads/cr-book-detail");
    void import("@/components/wishlist/wishlist-book-detail");

    // 2. Pre-fetch routes during browser idle time so initial hydration remains silky smooth
    const schedulePrefetch =
      typeof window !== "undefined" && "requestIdleCallback" in window
        ? (window as Window & { requestIdleCallback: (cb: () => void) => number }).requestIdleCallback
        : (cb: () => void) => setTimeout(cb, 100);

    const handle = schedulePrefetch(() => {
      for (const route of allBookRoutes) {
        router.prefetch(route);
      }
    });

    return () => {
      if (typeof window !== "undefined" && "cancelIdleCallback" in window) {
        (window as Window & { cancelIdleCallback: (h: number) => void }).cancelIdleCallback(handle as number);
      } else {
        clearTimeout(handle as unknown as NodeJS.Timeout);
      }
    };
  }, [allBookRoutes, router]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed top-0 left-0 z-[-1] h-px w-px overflow-hidden opacity-0 select-none"
    >
      {allBookRoutes.map((route) => (
        <Link key={route} href={route} prefetch={true} tabIndex={-1}>
          {route}
        </Link>
      ))}
    </div>
  );
};

export default BookRoutePrefetcher;
