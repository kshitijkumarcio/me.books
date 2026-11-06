"use client";

import React, { useMemo, useState, useEffect } from "react";
import type { BookItem } from "@/books/books-index";
import BookBlock from "@/components/book-block";
import { cn } from "@/lib/utils";
import GridSizeIndicator from "./grid-size-indicator";

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
 * Converts a 0-based row index to spreadsheet-style letters (0 -> "A", 25 -> "Z", 26 -> "AA", etc.).
 */
export const rowIndexToLetters = (index: number): string => {
  let letters = "";
  let temp = index;
  while (temp >= 0) {
    letters = String.fromCharCode(65 + (temp % 26)) + letters;
    temp = Math.floor(temp / 26) - 1;
  }
  return letters;
};

/**
 * Converts spreadsheet-style row letters to a 0-based row index ("A" -> 0, "B" -> 1, "AA" -> 26).
 */
export const lettersToRowIndex = (letters: string): number => {
  const upper = letters.toUpperCase();
  let index = 0;
  for (let i = 0; i < upper.length; i++) {
    index = index * 26 + (upper.charCodeAt(i) - 64);
  }
  return index - 1;
};

/**
 * Parses grid position strings like "A1", "B5", "c12" into row and col indices.
 * col is 1-based in the string; colIndex is 0-based.
 */
export const parseGridPosition = (
  pos?: string | null
): { row: number; col: number; colIndex: number; label: string } | null => {
  if (!pos || typeof pos !== "string") return null;
  const match = pos.trim().match(/^([A-Za-z]+)(\d+)$/);
  if (!match) return null;

  const rowLetters = match[1].toUpperCase();
  const colNumber = parseInt(match[2], 10);
  if (isNaN(colNumber) || colNumber < 1) return null;

  const rowIndex = lettersToRowIndex(rowLetters);
  return {
    row: rowIndex,
    col: colNumber,
    colIndex: colNumber - 1,
    label: `${rowLetters}${colNumber}`,
  };
};

/**
 * Formats row index and col index into position string e.g. (0, 0) -> "A1".
 */
export const formatGridPosition = (
  rowIndex: number,
  colIndex: number
): string => {
  return `${rowIndexToLetters(rowIndex)}${colIndex + 1}`;
};

/**
 * Empty placeholder block preserving grid alignment for unoccupied slots.
 */
const EmptyBlock = ({
  size = 8,
  coordinate,
  showCoordinate,
}: {
  size: 8 | 6;
  coordinate: string;
  showCoordinate: boolean;
}) => {
  return (
    <div
      className={cn(
        size === 6 ? "w-cell-6 h-cell-6" : "w-cell-8 h-cell-8",
        "relative aspect-square select-none",
        showCoordinate
          ? "flex flex-col items-center justify-center rounded-xl border border-dashed border-black/25 bg-black/2 text-black/50 transition-colors"
          : "pointer-events-none invisible"
      )}
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
  // Local coordinate toggle state
  const [localShowCoordinates, setLocalShowCoordinates] =
    useState<boolean>(false);
  const [showGridBounds, setShowGridBounds] = useState<boolean>(false);
  const [isDevParam, setIsDevParam] = useState<boolean>(false);

  // Safely check ?dev=true query parameter on client without SSR mismatch
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("dev") === "true") {
        setIsDevParam(true);
      }
    }
  }, []);

  const isDevEnvironment = process.env.NODE_ENV === "development";
  const isDeveloperMode = isDevEnvironment || isDevParam;

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

  // Keyboard shortcut: Press 'g' or 'G' to toggle coordinate helper (only in developer mode)
  useEffect(() => {
    if (!shouldShowGridSizeIndicator) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input / textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement)?.isContentEditable
      ) {
        return;
      }
      if (e.key === "g" || e.key === "G") {
        setLocalShowCoordinates((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [shouldShowGridSizeIndicator]);

  // 1. Parse explicit positions & detect collisions
  const { explicitMap, unpositionedBooks, minRequiredK, minRequiredR } =
    useMemo(() => {
      const explicit = new Map<string, BookItem>();
      const seenExplicit = new Map<string, BookItem[]>();
      const unpositioned: BookItem[] = [];

      books.forEach((book) => {
        if (book.position) {
          const parsed = parseGridPosition(book.position);
          if (parsed) {
            const key = `${parsed.row}-${parsed.colIndex}`;
            const existing = seenExplicit.get(key) || [];
            existing.push(book);
            seenExplicit.set(key, existing);
          } else {
            if (process.env.NODE_ENV !== "production") {
              console.warn(
                `[ShelfGrid] Invalid position format "${book.position}" for book "${book.title || book.id}". Expected e.g. "A1", "B5".`
              );
            }
            unpositioned.push(book);
          }
        } else {
          unpositioned.push(book);
        }
      });

      let reqK = 2;
      let reqR = 1;

      // Collision detection & resolution
      seenExplicit.forEach((assignedBooks, key) => {
        const [r, c] = key.split("-").map(Number);
        const coordLabel = formatGridPosition(r, c);

        // First book wins the designated slot
        explicit.set(key, assignedBooks[0]);

        // Bounds tracking
        const colNumber = c + 1;
        // Even rows (0, 2, ...) have capacity K -> K >= colNumber
        // Odd rows (1, 3, ...) have capacity K - 1 -> K - 1 >= colNumber => K >= colNumber + 1
        const neededK = r % 2 === 0 ? colNumber : colNumber + 1;
        if (neededK > reqK) reqK = neededK;
        if (r + 1 > reqR) reqR = r + 1;

        if (assignedBooks.length > 1) {
          if (process.env.NODE_ENV !== "production") {
            console.warn(
              `[ShelfGrid Collision] Position "${coordLabel}" was claimed by ${assignedBooks.length} books: ${assignedBooks
                .map((b) => `"${b.title || b.id}"`)
                .join(
                  ", "
                )}. Book "${assignedBooks[0].title || assignedBooks[0].id}" was placed here; others were moved to unpositioned auto-flow.`
            );
          }
          // Push conflicting books into autoflow queue so they still appear on shelf
          for (let i = 1; i < assignedBooks.length; i++) {
            unpositioned.push(assignedBooks[i]);
          }
        }
      });

      return {
        explicitMap: explicit,
        unpositionedBooks: unpositioned,
        minRequiredK: reqK,
        minRequiredR: reqR,
      };
    }, [books]);

  // 2. Dynamic alternating layout optimizer:
  // Rows alternate between K and K-1 blocks (e.g. 6, 5, 6, 5...).
  // Calculates optimal K and R so the overall canvas aspect ratio is as square as possible,
  // respecting the minimum required bounds of all explicitly positioned books.
  const { cols: K, rows: R } = useMemo(() => {
    const totalSlots = books.length;
    if (totalSlots === 0 && explicitMap.size === 0) {
      return { cols: 1, rows: 1 };
    }

    // If explicit cols prop was provided, enforce minimum bounds
    if (propCols && propCols > 0) {
      const effectiveCols = Math.max(propCols, minRequiredK);
      let cap = 0;
      let r = 0;
      while (cap < totalSlots || r < minRequiredR) {
        cap += r % 2 === 0 ? effectiveCols : Math.max(1, effectiveCols - 1);
        r++;
      }
      return {
        cols: effectiveCols,
        rows: propRows ? Math.max(propRows, minRequiredR) : r,
      };
    }

    let bestK = Math.max(minRequiredK, Math.ceil(Math.sqrt(totalSlots || 1)));
    let bestR = minRequiredR;
    let minScore = Infinity;

    // Search candidate K values starting from at least minRequiredK
    const minK = Math.max(2, minRequiredK);
    const maxK = Math.max(
      minK,
      Math.min(Math.max(totalSlots, minRequiredK * 2), 30)
    );

    for (let candidateK = minK; candidateK <= maxK; candidateK++) {
      let cap = 0;
      let r = 0;
      while (cap < totalSlots || r < minRequiredR) {
        cap += r % 2 === 0 ? candidateK : Math.max(1, candidateK - 1);
        r++;
      }

      // Calculate width and height in cells for this (candidateK, r)
      const widthCells =
        candidateK * blockSize + Math.max(0, candidateK - 1) * effectiveGapX;
      const heightCells = r * blockSize + Math.max(0, r - 1) * effectiveGapY;

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

    return {
      cols: bestK,
      rows: propRows ? Math.max(propRows, minRequiredR) : bestR,
    };
  }, [
    books.length,
    explicitMap.size,
    minRequiredK,
    minRequiredR,
    propCols,
    propRows,
    blockSize,
    effectiveGapX,
    effectiveGapY,
  ]);

  // 3. 2-Phase Fill: Group items into alternating rows to create the brick masonry pattern
  const rowsData = useMemo(() => {
    let unpositionedIndex = 0;
    const result: Array<
      Array<{
        key: string;
        coordinate: string;
        node: React.ReactNode;
        isOccupied: boolean;
      }>
    > = [];

    for (let r = 0; r < R; r++) {
      const rowCapacity = r % 2 === 0 ? K : Math.max(1, K - 1);
      const rowItems: Array<{
        key: string;
        coordinate: string;
        node: React.ReactNode;
        isOccupied: boolean;
      }> = [];

      for (let c = 0; c < rowCapacity; c++) {
        const coord = formatGridPosition(r, c);
        const key = `${r}-${c}`;

        let bookToPlace: BookItem | undefined;

        // Phase 1: Explicit position
        if (explicitMap.has(key)) {
          bookToPlace = explicitMap.get(key);
        } else if (unpositionedIndex < unpositionedBooks.length) {
          // Phase 2: Hybrid autoflow for unpositioned books
          bookToPlace = unpositionedBooks[unpositionedIndex++];
        }

        if (bookToPlace) {
          rowItems.push({
            key: `book-${bookToPlace.id || coord}`,
            coordinate: coord,
            isOccupied: true,
            node: <BookBlock book={bookToPlace} size={blockSize} />,
          });
        } else {
          // Phase 3: Empty slot placeholder to maintain grid alignment
          rowItems.push({
            key: `empty-${coord}`,
            coordinate: coord,
            isOccupied: false,
            node: (
              <EmptyBlock
                size={blockSize}
                coordinate={coord}
                showCoordinate={isCoordinatesVisible}
              />
            ),
          });
        }
      }

      if (rowItems.length > 0) {
        result.push(rowItems);
      }
    }

    return result;
  }, [R, K, explicitMap, unpositionedBooks, blockSize, isCoordinatesVisible]);

  return (
    <div
      className={cn(
        "px-cell relative flex flex-col items-center select-none",
        showGridBounds &&
          "rounded-3xl p-4 outline-2 outline-indigo-500/30 transition-all duration-300 outline-dashed",
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
          showGridBounds={showGridBounds}
          onToggleGridBounds={() => setShowGridBounds((prev) => !prev)}
          enableGridSizeDisplay={shouldShowGridSizeIndicator}
        />
      )}

      {/* Render Shelf Rows */}
      {rowsData.map((row, r) => (
        <div
          key={`shelf-row-${r}`}
          className="relative flex flex-row justify-center"
          style={{
            columnGap: `calc(var(--cell-size) * ${effectiveGapX})`,
          }}
        >
          {/* Row Guide Label when Bounds are enabled */}
          {showGridBounds && (
            <div className="pointer-events-none absolute top-1/2 -left-18 flex -translate-y-1/2 items-center gap-1 rounded bg-black/85 px-2 py-0.5 font-mono text-[10px] font-semibold text-white shadow backdrop-blur-xs select-none sm:-left-24">
              <span className="text-indigo-400">
                Row {rowIndexToLetters(r)}
              </span>
              <span className="text-neutral-400">
                ({r % 2 === 0 ? K : Math.max(1, K - 1)})
              </span>
            </div>
          )}

          {row.map((item) => (
            <div
              key={item.key}
              className="relative flex shrink-0 items-center justify-center"
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
