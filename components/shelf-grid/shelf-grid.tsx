"use client";

import React, { useMemo } from "react";
import type { BookItem } from "@/books/books-index";
import BookBlock from "@/components/book-block";
import { cn } from "@/lib/utils";

interface ShelfGridProps {
  books: BookItem[];
  cols?: number;
  rows?: number;
  blockSize?: 8 | 6; // cells
  gapSize?: number; // cells
  className?: string;
}

const ShelfGrid = ({
  books = [],
  cols: propCols,
  rows: propRows,
  blockSize = 8,
  gapSize = 0,
  className,
}: ShelfGridProps) => {
  const totalSlots = books.length;

  // Dynamic alternating layout optimizer:
  // Rows alternate between K and K-1 blocks (e.g. 6, 5, 6, 5...).
  // Calculates optimal K and R so the overall canvas aspect ratio is as square as possible.
  const { cols: K, rows: R } = useMemo(() => {
    if (totalSlots === 0) return { cols: 1, rows: 1 };

    // If explicit cols prop was provided, use it
    if (propCols && propCols > 0) {
      let cap = 0;
      let r = 0;
      while (cap < totalSlots) {
        cap += r % 2 === 0 ? propCols : Math.max(1, propCols - 1);
        r++;
      }
      return { cols: propCols, rows: propRows ?? r };
    }

    let bestK = Math.max(2, Math.ceil(Math.sqrt(totalSlots)));
    let bestR = 1;
    let minScore = Infinity;

    // Search candidate K values to find the most square layout
    const minK = 2;
    const maxK = Math.max(3, Math.min(totalSlots, 25));

    for (let candidateK = minK; candidateK <= maxK; candidateK++) {
      let cap = 0;
      let r = 0;
      while (cap < totalSlots) {
        cap += r % 2 === 0 ? candidateK : Math.max(1, candidateK - 1);
        r++;
      }

      // Calculate width and height in cells for this (candidateK, r)
      const widthCells =
        candidateK * blockSize + Math.max(0, candidateK - 1) * gapSize;
      const heightCells =
        r * blockSize + Math.max(0, r - 1) * gapSize;

      // Aspect ratio difference from 1:1 (square)
      const diff = Math.abs(widthCells - heightCells);
      const leftover = cap - totalSlots;
      const score = diff * 100 + leftover;

      if (score < minScore) {
        minScore = score;
        bestK = candidateK;
        bestR = r;
      }
    }

    return { cols: bestK, rows: propRows ?? bestR };
  }, [totalSlots, propCols, propRows, blockSize, gapSize]);

  // Group items into alternating rows to create the brick masonry pattern
  const rowsData = useMemo(() => {
    let bookIndex = 0;
    const result: Array<Array<{ key: string; node: React.ReactNode }>> = [];

    for (let r = 0; r < R; r++) {
      const rowCapacity = r % 2 === 0 ? K : Math.max(1, K - 1);
      const rowItems: Array<{ key: string; node: React.ReactNode }> = [];

      for (let c = 0; c < rowCapacity; c++) {
        if (bookIndex < books.length) {
          const book = books[bookIndex++];
          rowItems.push({
            key: `book-${book.id || `${r}-${c}`}`,
            node: <BookBlock book={book} size={blockSize} />,
          });
        }
      }

      if (rowItems.length > 0) {
        result.push(rowItems);
      }
    }

    return result;
  }, [R, K, books, blockSize]);

  return (
    <div
      className={cn("flex flex-col px-cell items-center select-none", className)}
      style={{
        gap: `calc(var(--cell-size) * ${gapSize})`,
      }}
    >
      {rowsData.map((row, r) => (
        <div
          key={`shelf-row-${r}`}
          className="flex flex-row justify-center"
          style={{
            gap: `calc(var(--cell-size) * ${gapSize})`,
          }}
        >
          {row.map((item) => (
            <div
              key={item.key}
              className="relative flex items-center justify-center shrink-0"
            >
              {item.node}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default ShelfGrid;
