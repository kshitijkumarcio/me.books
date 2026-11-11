"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { BookItem } from "@/books/books-index";
import BookBlock from "@/components/book-block";
import { cn } from "@/lib/utils";
import GridSizeIndicator from "./grid-size-indicator";
import { useRegisterGrid } from "./grid-registry";
import { useDevMode } from "@/hooks/ui-hooks/use-dev-mode";
import {
  rowIndexToLetters,
  lettersToRowIndex,
  parseGridPosition,
  formatGridPosition,
  calculateShelfGridDimensions,
  parseGridExplicitBooks,
  buildAlternatingGridSlots,
} from "./grid-utils";

export {
  rowIndexToLetters,
  lettersToRowIndex,
  parseGridPosition,
  formatGridPosition,
  calculateShelfGridDimensions,
};

export interface ShelfGridProps {
  books: BookItem[];
  cols?: number;
  rows?: number;
  blockSize?: 8 | 6; // cells
  gapSize?: number; // uniform gap fallback in cells
  horizontalGap?: number; // horizontal gap between blocks in cells
  verticalGap?: number; // vertical gap between rows in cells
  gapX?: number; // alias for horizontalGap
  gapY?: number; // alias for verticalGap
  className?: string;
  showCoordinates?: boolean; // Explicit control of coordinate overlay
  showGridSize?: boolean; // Explicit control of grid size display
  enableGridSizeDisplay?: boolean; // Show floating grid size indicator in bottom left (only in developer mode by default)
}

/**
 * Empty placeholder block preserving grid alignment for unoccupied slots.
 */
export const EmptyBlock = ({
  size = 8,
  coordinate,
  showCoordinate,
}: {
  size?: number;
  coordinate: string;
  showCoordinate?: boolean;
}) => {
  return (
    <div
      className={cn(
        size === 6
          ? "w-cell-6 h-cell-6"
          : size === 8
            ? "w-cell-8 h-cell-8"
            : "",
        "relative aspect-square select-none",
        showCoordinate
          ? "flex flex-col items-center justify-center rounded-xl border border-dashed border-black/25 bg-black/2 text-black/50 transition-colors"
          : "pointer-events-none invisible"
      )}
      style={{
        width: `calc(var(--cell-size) * ${size})`,
        height: `calc(var(--cell-size) * ${size})`,
      }}
    >
      {showCoordinate && (
        <span className="font-mono text-xs font-semibold tracking-wider">
          {coordinate}
        </span>
      )}
    </div>
  );
};

const ShelfGrid = ({
  books = [],
  cols: propCols,
  rows: propRows,
  blockSize = 8,
  gapSize = 0,
  horizontalGap,
  verticalGap,
  gapX,
  gapY,
  showCoordinates: propShowCoordinates,
  showGridSize,
  enableGridSizeDisplay,
  className,
}: ShelfGridProps) => {
  const effectiveGapX = horizontalGap ?? gapX ?? gapSize;
  const effectiveGapY = verticalGap ?? gapY ?? gapSize;
  const router = useRouter();

  // Prefetch intercepted routes for read books and pre-warm detail component
  useEffect(() => {
    // Pre-warm the client component chunk so it is immediately ready in memory on first click
    import("@/components/read-book-detail/read-book-detail");

    // Prefetch intercepted routes for all read books
    books.forEach((book) => {
      if (book.status === "read") {
        router.prefetch(`/read/${book.id}`);
      }
    });
  }, [books, router]);

  const [localShowCoordinates, setLocalShowCoordinates] =
    useState<boolean>(false);
  const isDeveloperMode = useDevMode();

  const shouldShowGridSizeIndicator =
    enableGridSizeDisplay !== undefined
      ? enableGridSizeDisplay
      : showGridSize !== undefined
        ? showGridSize
        : isDeveloperMode;

  const isCoordinatesVisible =
    propShowCoordinates !== undefined
      ? propShowCoordinates
      : localShowCoordinates;

  const { explicitMap, unpositionedBooks } = useMemo(() => {
    return parseGridExplicitBooks(books, "ShelfGrid");
  }, [books]);

  const { cols: K, rows: R } = useMemo(() => {
    return calculateShelfGridDimensions(
      books,
      blockSize,
      effectiveGapX,
      effectiveGapY,
      propCols,
      propRows
    );
  }, [books, blockSize, effectiveGapX, effectiveGapY, propCols, propRows]);

  useRegisterGrid(
    useMemo(
      () => ({
        id: "shelf",
        name: "Books Read",
        cols: K,
        rows: R,
        blockSize,
        gapX: effectiveGapX,
        gapY: effectiveGapY,
        totalBooks: books.length,
        explicitBooksCount: explicitMap.size,
        unpositionedBooksCount: unpositionedBooks.length,
        isCoordinatesVisible,
        onToggleCoordinates: () => setLocalShowCoordinates((prev) => !prev),
        enableGridSizeDisplay: shouldShowGridSizeIndicator,
      }),
      [
        K,
        R,
        blockSize,
        effectiveGapX,
        effectiveGapY,
        books.length,
        explicitMap.size,
        unpositionedBooks.length,
        isCoordinatesVisible,
        shouldShowGridSizeIndicator,
      ]
    )
  );

  const rowsData = useMemo(() => {
    const slotsMatrix = buildAlternatingGridSlots(
      R,
      K,
      explicitMap,
      unpositionedBooks
    );

    return slotsMatrix.map((rowSlots) =>
      rowSlots.map((slot) => {
        if (slot.book) {
          return {
            key: `book-${slot.book.id || slot.coordinate}`,
            coordinate: slot.coordinate,
            isOccupied: true,
            node: <BookBlock book={slot.book} size={blockSize} />,
          };
        }
        return {
          key: `empty-${slot.coordinate}`,
          coordinate: slot.coordinate,
          isOccupied: false,
          node: (
            <EmptyBlock
              size={blockSize}
              coordinate={slot.coordinate}
              showCoordinate={isCoordinatesVisible}
            />
          ),
        };
      })
    );
  }, [R, K, explicitMap, unpositionedBooks, blockSize, isCoordinatesVisible]);

  return (
    <div
      className={cn(
        "px-cell relative flex flex-col items-center select-none",
        className
      )}
      style={{
        rowGap: `calc(var(--cell-size) * ${effectiveGapY})`,
      }}
    >
      {/* Developer Mode: Bottom-Left Floating Grid Size Indicator & Inspector */}
      {shouldShowGridSizeIndicator && (
        <GridSizeIndicator
          cols={K}
          rows={R}
          blockSize={blockSize}
          gapX={effectiveGapX}
          gapY={effectiveGapY}
          totalBooks={books.length}
          explicitBooksCount={explicitMap.size}
          unpositionedBooksCount={unpositionedBooks.length}
          isCoordinatesVisible={isCoordinatesVisible}
          onToggleCoordinates={() => setLocalShowCoordinates((prev) => !prev)}
          enableGridSizeDisplay={shouldShowGridSizeIndicator}
        />
      )}

      {/* Render Shelf Rows */}
      {rowsData.map((row, r) => (
        <div
          key={`shelf-row-${r}`}
          className="relative flex flex-row justify-center hover:z-40"
          style={{
            columnGap: `calc(var(--cell-size) * ${effectiveGapX})`,
          }}
        >
          {row.map((item) => (
            <div
              key={item.key}
              className="relative flex shrink-0 items-center justify-center focus-within:z-50 hover:z-50"
            >
              {item.node}

              {/* Coordinate badge for occupied book blocks */}
              {isCoordinatesVisible && item.isOccupied && (
                <div className="pointer-events-none absolute top-2 left-2 z-40 rounded bg-black/80 px-1.5 py-0.5 font-mono text-[10px] font-bold text-white shadow backdrop-blur-xs select-none">
                  {item.coordinate}
                </div>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default ShelfGrid;
