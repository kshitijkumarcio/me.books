"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PrefetchKind } from "next/dist/client/components/router-reducer/router-reducer-types";
import { cn } from "@/lib/utils";
import { currentReads } from "@/books/books-index";
import type { CurrentlyReadingBook } from "@/books/books-index";
import CRBlock from "./cr-block";
import {
  parseGridPosition,
  formatGridPosition,
  rowIndexToLetters,
} from "@/components/shelf-grid/grid-utils";
import { useRegisterGrid } from "@/components/shelf-grid/grid-registry";
import { useDevMode } from "@/hooks/ui-hooks/use-dev-mode";

export interface CurrentReadsProps {
  books?: CurrentlyReadingBook[];
  className?: string;
  horizontalGap?: number;
  verticalGap?: number;
  columnGap?: number;
  rowGap?: number;
  showCoordinates?: boolean;
  showGridSize?: boolean;
  enableGridSizeDisplay?: boolean;
}

export interface CurrentReadsSlotItem {
  key: string;
  coordinate: string;
  book: CurrentlyReadingBook;
}

export interface CurrentReadsRow {
  rowIndex: number;
  rowLabel: string;
  capacity: number;
  items: CurrentReadsSlotItem[];
}

/**
 * Builds alternating brick rows (3, 2, 3, 2, ...) honoring explicit book positions
 * and auto-flowing remaining books into open slots.
 * Rows that do not have enough books to fill their capacity are centered.
 */
export function buildCurrentReadsBrickRows(books: CurrentlyReadingBook[]): {
  rows: CurrentReadsRow[];
  explicitCount: number;
  unpositionedCount: number;
  totalCapacity: number;
} {
  if (!books || books.length === 0) {
    return {
      rows: [],
      explicitCount: 0,
      unpositionedCount: 0,
      totalCapacity: 0,
    };
  }

  const explicitMap = new Map<string, CurrentlyReadingBook>();
  const unpositionedBooks: CurrentlyReadingBook[] = [];
  let maxExplicitRow = -1;
  let explicitCount = 0;

  books.forEach((book) => {
    if (book.position) {
      const parsed = parseGridPosition(book.position);
      if (parsed && parsed.row >= 0) {
        const rowCapacity = parsed.row % 2 === 0 ? 3 : 2;
        // Validate colIndex: must be < rowCapacity (0, 1, 2 for even rows; 0, 1 for odd rows)
        if (parsed.colIndex >= 0 && parsed.colIndex < rowCapacity) {
          const key = `${parsed.row}-${parsed.colIndex}`;
          if (!explicitMap.has(key)) {
            explicitMap.set(key, book);
            explicitCount++;
            if (parsed.row > maxExplicitRow) {
              maxExplicitRow = parsed.row;
            }
            return;
          }
        }
      }
    }
    unpositionedBooks.push(book);
  });

  // Calculate minimum rows needed to fit all books with alternating capacities (3, 2, 3, 2, ...)
  let minRowsNeeded = 0;
  let remainingCount = books.length;
  while (remainingCount > 0) {
    const cap = minRowsNeeded % 2 === 0 ? 3 : 2;
    remainingCount -= cap;
    minRowsNeeded++;
  }

  const totalRows = Math.max(1, maxExplicitRow + 1, minRowsNeeded);

  let unpositionedIdx = 0;
  let totalCapacity = 0;
  const rows: CurrentReadsRow[] = [];

  for (let r = 0; r < totalRows; r++) {
    const cap = r % 2 === 0 ? 3 : 2;
    totalCapacity += cap;
    const rowItems: CurrentReadsSlotItem[] = [];

    for (let c = 0; c < cap; c++) {
      const key = `${r}-${c}`;
      const coord = formatGridPosition(r, c);

      let bookToPlace: CurrentlyReadingBook | undefined;
      if (explicitMap.has(key)) {
        bookToPlace = explicitMap.get(key);
      } else if (unpositionedIdx < unpositionedBooks.length) {
        bookToPlace = unpositionedBooks[unpositionedIdx++];
      }

      if (bookToPlace) {
        rowItems.push({
          key: `cr-book-${bookToPlace.id}`,
          coordinate: coord,
          book: bookToPlace,
        });
      }
    }

    if (rowItems.length > 0) {
      rows.push({
        rowIndex: r,
        rowLabel: rowIndexToLetters(r),
        capacity: cap,
        items: rowItems,
      });
    }
  }

  return {
    rows,
    explicitCount,
    unpositionedCount: unpositionedBooks.length,
    totalCapacity,
  };
}

const CurrentReads = ({
  books = currentReads,
  className,
  horizontalGap,
  verticalGap,
  columnGap,
  rowGap,
  showCoordinates: propShowCoordinates,
  showGridSize,
  enableGridSizeDisplay,
}: CurrentReadsProps) => {
  const router = useRouter();

  const effectiveColumnGap = horizontalGap ?? columnGap ?? 2;
  const effectiveRowGap = verticalGap ?? rowGap ?? 0;

  // Prefetch intercepted routes for current reads and pre-warm detail component
  useEffect(() => {
    import("./cr-book-detail");
    books.forEach((book) => {
      try {
        router.prefetch(`/reading/${book.id}`, { kind: PrefetchKind.FULL });
      } catch {
        router.prefetch(`/reading/${book.id}`);
      }
    });
  }, [books, router]);

  const [localShowCoordinates, setLocalShowCoordinates] =
    useState<boolean>(false);
  const isDeveloperMode = useDevMode();

  const isCoordinatesVisible =
    propShowCoordinates !== undefined
      ? propShowCoordinates
      : localShowCoordinates;

  const shouldShowGridSizeIndicator =
    enableGridSizeDisplay !== undefined
      ? enableGridSizeDisplay
      : showGridSize !== undefined
        ? showGridSize
        : isDeveloperMode;

  const { rows, explicitCount, unpositionedCount, totalCapacity } = useMemo(
    () => buildCurrentReadsBrickRows(books),
    [books]
  );

  // Register CurrentReads with the unified Grid Registry
  useRegisterGrid(
    useMemo(
      () => ({
        id: "current-reads",
        name: "Currently Reading",
        cols: 3,
        rows: rows.length,
        blockSize: 6,
        gapX: effectiveColumnGap,
        gapY: effectiveRowGap,
        totalBooks: books.length,
        explicitBooksCount: explicitCount,
        unpositionedBooksCount: unpositionedCount,
        totalCapacity,
        isCoordinatesVisible,
        onToggleCoordinates: () => setLocalShowCoordinates((prev) => !prev),
        enableGridSizeDisplay: shouldShowGridSizeIndicator,
      }),
      [
        rows.length,
        effectiveColumnGap,
        effectiveRowGap,
        books.length,
        explicitCount,
        unpositionedCount,
        totalCapacity,
        isCoordinatesVisible,
        shouldShowGridSizeIndicator,
      ]
    )
  );

  return (
    <div
      id="current-reads"
      className={cn("mt-cell-2.75 relative min-h-dvh w-full", className)}
    >
      <div className="pointer-events-none sticky left-0 w-screen px-9 lg:px-5">
        <div className="flex w-full items-center justify-between">
          <p className="font-mona-sans text-[calc(12px+4dvw)] leading-[calc(12px+5dvw)] font-semibold text-black uppercase">
            ALL BOOKS
          </p>
          {/* <div className="mx-8 h-1 w-full bg-black" /> */}
          <p className="font-mona-sans text-[calc(12px+4dvw)] leading-[calc(12px+5dvw)] font-semibold whitespace-nowrap text-black uppercase">
            THAT MAKE
          </p>
        </div>
        <div className="flex w-full items-center justify-between">
          <p className="font-mona-sans text-[calc(12px+4dvw)] leading-[calc(12px+5dvw)] font-semibold text-black uppercase">
            UP MY
          </p>
          <p className="font-mona-sans text-[calc(12px+4dvw)] leading-[calc(12px+5dvw)] font-semibold text-black uppercase">
            (&nbsp;CURRENT&nbsp;)
          </p>
          {/* <div className="mx-8 h-1 w-full bg-black" /> */}
          <p className="font-mona-sans text-[calc(12px+4dvw)] leading-[calc(12px+5dvw)] font-semibold text-black uppercase">
            READS
          </p>
        </div>

        {/* Dynamic alternating brick layout (3, 2, 3, 2, ...) with centered rows */}
        <div
          className="mt-cell pointer-events-auto flex flex-col items-center justify-center"
          style={{
            rowGap: `calc(var(--cell-size) * ${effectiveRowGap})`,
          }}
        >
          {rows.map((row) => (
            <div
              key={`cr-row-${row.rowIndex}`}
              className="relative flex flex-row items-end justify-center focus-within:z-40 hover:z-40 has-data-hovered:z-40"
              style={{
                columnGap: `calc(var(--cell-size) * ${effectiveColumnGap})`,
              }}
            >
              {row.items.map((item) => (
                <div
                  key={item.key}
                  className="relative flex shrink-0 items-end justify-center focus-within:z-50 hover:z-50 has-data-hovered:z-50"
                >
                  <CRBlock book={item.book} />

                  {/* Coordinate badge overlay when coordinates are visible */}
                  {isCoordinatesVisible && (
                    <div className="pointer-events-none absolute top-2 left-2 z-40 rounded bg-black/80 px-1.5 py-0.5 font-mono text-[10px] font-bold text-white shadow backdrop-blur-xs select-none">
                      {item.coordinate}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CurrentReads;
