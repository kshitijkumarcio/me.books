"use client";

import type { WishlistBook, BookItem } from "@/books/books-index";
import BookCover from "@/components/book-block/book-cover";
import { cn } from "@/lib/utils";

export interface WishListBlockProps {
  book: WishlistBook | BookItem;
  size?: number;
  className?: string;
}

export const WishListBlock = ({
  book,
  size = 6,
  className,
}: WishListBlockProps) => {
  if (!book) return null;

  const coverElement = book.layout?.find((el) => el.type === "cover");
  const widthClass = coverElement?.widthClass || "w-40";
  const rotation = coverElement?.rotation || "rotate-0";

  return (
    <div
      className={cn(
        "w-cell-6 h-cell-6",
        "relative flex items-center justify-center select-none",
        className
      )}
      style={{
        width: `calc(var(--cell-size) * ${size})`,
        height: `calc(var(--cell-size) * ${size})`,
      }}
    >
      <div className="relative h-full w-full">
        <BookCover
          src={book.coverImage}
          alt={book.title}
          widthClass={widthClass}
          format={book.format}
          rotation={rotation}
          className="bottom-cell-[1.05] absolute left-1/2 -translate-x-1/2"
        />
      </div>
    </div>
  );
};

export default WishListBlock;
