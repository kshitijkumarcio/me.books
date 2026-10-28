"use client";

import React, { useMemo } from "react";
import type { BookItem } from "@/books/books-index";
import BookBlock from "@/components/book-block";
import WelcomeBlock from "@/components/welcome-block";
import ShelfGap from "./shelf-gap";
import { cn } from "@/lib/utils";

interface ShelfGridProps {
  books: BookItem[];
  cols?: number;
  rows?: number;
  blockSize?: 8 | 6; // cells
  gapSize?: 2 | 1; // cells
  className?: string;
  showDebugBorder?: boolean;
  getRowLabel?: (rowIdx: number) => string | undefined;
  centerWelcomeSlot?: React.ReactNode;
  centerRow?: number;
  centerCol?: number;
}

export const ShelfGrid = ({
  books = [],
  cols: propCols,
  rows: propRows,
  blockSize = 8,
  gapSize = 1,
  className,
  showDebugBorder = false,
  getRowLabel,
  centerWelcomeSlot = <WelcomeBlock />,
  centerRow: customCenterRow,
  centerCol: customCenterCol,
}: ShelfGridProps) => {
  // Calculate total required slots (all books + 1 for center welcome slot if present)
  const totalSlots = books.length + (centerWelcomeSlot ? 1 : 0);

  // Calculate rows and columns dynamically based on what the total is of all books length
  const cols = useMemo(() => {
    if (propCols && propCols > 0) return propCols;
    if (totalSlots === 0) return 1;
    // Balanced square-like grid layout
    return Math.ceil(Math.sqrt(totalSlots));
  }, [propCols, totalSlots]);

  const rows = useMemo(() => {
    if (propRows && propRows > 0) return propRows;
    if (totalSlots === 0) return 1;
    return Math.ceil(totalSlots / cols);
  }, [propRows, totalSlots, cols]);

  // Determine center slot for the 8x8 Welcome Block
  const centerRow = customCenterRow ?? Math.floor(rows / 2);
  const centerCol = customCenterCol ?? Math.floor(cols / 2);

  // Construct grid-template-columns and grid-template-rows using exact cell sizes
  const gridStyle = useMemo(() => {
    const colTracks: string[] = [];
    for (let c = 0; c < cols; c++) {
      colTracks.push(`calc(var(--cell-size) * ${blockSize})`);
      if (c < cols - 1) {
        colTracks.push(`calc(var(--cell-size) * ${gapSize})`);
      }
    }

    const rowTracks: string[] = [];
    for (let r = 0; r < rows; r++) {
      rowTracks.push(`calc(var(--cell-size) * ${blockSize})`);
      if (r < rows - 1) {
        rowTracks.push(`calc(var(--cell-size) * ${gapSize})`);
      }
    }

    return {
      display: "grid",
      gridTemplateColumns: colTracks.join(" "),
      gridTemplateRows: rowTracks.join(" "),
    };
  }, [cols, rows, blockSize, gapSize]);

  // Map book items sequentially to all slots, reserving the center slot for the Welcome Block
  let bookIndex = 0;
  const gridItems: React.ReactNode[] = [];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const isCenter = Boolean(centerWelcomeSlot && r === centerRow && c === centerCol);

      if (isCenter) {
        gridItems.push(
          <div
            key="center-welcome-block"
            style={{
              gridRow: r * 2 + 1,
              gridColumn: c * 2 + 1,
            }}
            className="relative z-30 flex items-center justify-center"
          >
            {centerWelcomeSlot}
          </div>
        );
        continue;
      }

      const book = books[bookIndex++];
      if (!book) continue;

      gridItems.push(
        <div
          key={`book-${book.id || `${r}-${c}`}`}
          style={{
            gridRow: r * 2 + 1,
            gridColumn: c * 2 + 1,
          }}
          className="relative flex items-center justify-center"
        >
          <BookBlock book={book} size={blockSize} />
        </div>
      );
    }
  }

  return (
    <div style={gridStyle} className={cn("relative select-none", className)}>
      {/* 1. RENDER BOOK BLOCKS & WELCOME BLOCK */}
      {gridItems}

      {/* 2. RENDER HORIZONTAL SHELF LABELS */}
      {Array.from({ length: rows - 1 }).map((_, r) => {
        const label = getRowLabel?.(r);
        if (!label) return null;

        return (
          <div
            key={`h-gap-${r}`}
            style={{
              gridRow: r * 2 + 2,
              gridColumn: `1 / span ${cols * 2 - 1}`,
            }}
            className="flex h-full w-full items-center px-2 pointer-events-none"
          >
            <ShelfGap
              type="horizontal"
              rowIdx={r}
              gapSize={gapSize}
              label={label}
            />
          </div>
        );
      })}
    </div>
  );
};

export default ShelfGrid;
