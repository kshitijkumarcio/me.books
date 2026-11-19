"use client";

import React from "react";
import { AnimatePresence } from "motion/react";
import type { BookItem } from "@/books/books-index";
import BookTitleHoverLabel from "./book-title-hover-label";
import { useBlockHover } from "@/hooks/ui-hooks/use-block-hover";
import {
  normalizeLayout,
  parseCellUnit,
  resolveElementPosition,
} from "./book-block-utils";
import { renderLayoutElement } from "./book-block-layout-element";
import { cn } from "@/lib/utils";

export { parseCellUnit, resolveElementPosition };

const AVAILABILITY_LABEL_MAP = {
  available: "Available",
  taken: "Taken",
  "not for borrowing": "Not for borrowing",
} as const;

export interface BookBlockProps {
  item?: BookItem;
  book?: BookItem;
  size?: 8 | 6;
  className?: string;
}

export const BookBlock = ({
  item,
  book: propBook,
  size = 8,
  className,
}: BookBlockProps) => {
  const book = item || propBook;
  const {
    blockRef,
    isHovered,
    isElevated,
    springX,
    springY,
    handleMouseEnter,
    handleMouseMove,
    handleMouseLeave,
  } = useBlockHover();

  if (!book) return null;

  const elements = normalizeLayout(book, size);

  return (
    <div
      ref={blockRef}
      data-hovered={isHovered ? "true" : isElevated ? "exiting" : undefined}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn(
        size === 6 ? "w-cell-6 h-cell-6" : "w-cell-8 h-cell-8",
        "relative aspect-square select-none",
        isHovered ? "z-[60]" : isElevated ? "z-[50]" : "isolate",
        className
      )}
    >
      {elements.map((el, i) => renderLayoutElement(el, book, i))}

      <AnimatePresence>
        {isHovered && (
          <BookTitleHoverLabel
            key={`shelf-title-${book.id}`}
            type="Shelf"
            title={book.title}
            availability={
              book.availability
                ? AVAILABILITY_LABEL_MAP[book.availability]
                : undefined
            }
            x={springX}
            y={springY}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default BookBlock;
