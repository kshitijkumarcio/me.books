"use client";

import { useEffect, useState } from "react";
import { motion, type MotionValue } from "motion/react";
import type { WishlistBook } from "@/books/books-index";
import { cn } from "@/lib/utils";

export interface WishlistHoverCardProps {
  book: WishlistBook;
  x: MotionValue<number>;
  y: MotionValue<number>;
  className?: string;
}

export const WishlistHoverCard = ({
  book,
  x,
  y,
  className,
}: WishlistHoverCardProps) => {
  const [livePrice, setLivePrice] = useState<string | null>(null);

  // If manual price is defined, format it
  const manualPrice =
    book.price !== undefined && book.price !== null && book.price !== ""
      ? typeof book.price === "number"
        ? `₹${book.price}`
        : String(book.price).startsWith("₹")
          ? String(book.price)
          : `₹${book.price}`
      : null;

  useEffect(() => {
    if (manualPrice || !book.isbn) return;

    let isMounted = true;
    fetch(`/book-shelf/api/book-price?isbn=${encodeURIComponent(book.isbn)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (isMounted && data?.price) {
          setLivePrice(data.price);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [book.isbn, manualPrice]);

  const displayPrice = manualPrice || livePrice;

  return (
    <motion.div
      style={{ x, y }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="pointer-events-none absolute top-0 left-0 z-50 select-none"
    >
      <div
        className={cn(
          "bg-neon flex items-center gap-2 rounded-lg border border-neutral-600 px-2 py-1 whitespace-nowrap",
          className
        )}
      >
        {/* Book Title & Author */}
        <div className="flex items-center gap-1.5 leading-none">
          <div className="font-mona-sans gap-1 text-[12px] leading-none font-semibold text-black">
            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-1.5">
                <p className="text-[18px] leading-none font-medium">+</p>
                <p className="">{book.title}</p>
              </div>

              <div className="aspect-square h-1 bg-black" />
              <div className="flex items-center gap-1 text-[11px] leading-none font-medium">
                {displayPrice || "Amazon"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default WishlistHoverCard;
