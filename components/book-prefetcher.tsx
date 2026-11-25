"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PrefetchKind } from "next/dist/client/components/router-reducer/router-reducer-types";
import { BooksRead, currentReads, wishlistBooks } from "@/books/books-index";

/**
 * AllBooksPrefetcher
 *
 * Ensures every single intercepted book route across BooksRead, CurrentReads, and Wishlist
 * is completely prefetched and ready in memory immediately from the get go.
 *
 * 1. Renders an invisible, zero-opacity in-viewport list of `<Link prefetch={true}>` tags,
 *    triggering Next.js's IntersectionObserver-based Link prefetcher for all routes immediately.
 * 2. Pre-warms the dynamic JavaScript chunks for all 3 detail modals in memory.
 * 3. Dispatches imperative `router.prefetch(href, { kind: "full" })` for every single book.
 */
export function AllBooksPrefetcher() {
  const router = useRouter();

  const allHrefs = useMemo(() => {
    const readHrefs = BooksRead.map((book) => `/read/${book.id}`);
    const crHrefs = currentReads.map((book) => `/reading/${book.id}`);
    const wlHrefs = wishlistBooks.map((book) => `/wishlist/${book.id}`);
    return [...readHrefs, ...crHrefs, ...wlHrefs];
  }, []);

  useEffect(() => {
    // 1. Pre-warm client modal component chunks so they are parsed & in memory on first click
    import("@/components/read-book-detail/read-book-detail");
    import("@/components/current-reads/cr-book-detail");
    import("@/components/wishlist/wishlist-book-detail");
    import("@/components/about/about-detail");
    import("@/components/use-case/use-case-detail");

    // 2. Pre-fetch every single route with full prefetch kind
    allHrefs.forEach((href) => {
      try {
        router.prefetch(href, { kind: PrefetchKind.FULL });
      } catch {
        router.prefetch(href);
      }
    });
  }, [allHrefs, router]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed top-0 left-0 -z-50 h-px w-px overflow-hidden opacity-0"
    >
      {allHrefs.map((href) => (
        <Link
          key={href}
          href={href}
          prefetch={true}
          scroll={false}
          tabIndex={-1}
        />
      ))}
    </div>
  );
}

export default AllBooksPrefetcher;
