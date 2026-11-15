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
      const slug = book.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      if (slug && slug !== book.id) {
        routes.push(`/read/${slug}`);
      }
    }

    // Currently reading books
    for (const book of currentReads) {
      routes.push(`/reading/${book.id}`);
      const slug = book.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      if (slug && slug !== book.id) {
        routes.push(`/reading/${slug}`);
      }
    }

    // Wishlist books
    for (const book of wishlistBooks) {
      routes.push(`/wishlist/${book.id}`);
      const slug = book.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      if (slug && slug !== book.id) {
        routes.push(`/wishlist/${slug}`);
      }
    }

    return Array.from(new Set(routes));
  }, []);

  useEffect(() => {
    // 1. Immediately pre-warm client component chunks so code execution is instantaneous
    void import("@/components/read-book-detail/read-book-detail");
    void import("@/components/current-reads/cr-book-detail");
    void import("@/components/wishlist/wishlist-book-detail");

    // 2. Programmatically prefetch every route with full priority
    for (const route of allBookRoutes) {
      try {
        router.prefetch(route, { kind: "full" as any });
      } catch {
        // Fallback for router implementations
        router.prefetch(route);
      }
    }
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
