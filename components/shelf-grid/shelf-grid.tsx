"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { PrefetchKind } from "next/dist/client/components/router-reducer/router-reducer-types";
import { motion, LayoutGroup } from "motion/react";
import { easing022 } from "@/constants";
import type { BookItem } from "@/books/books-index";
import BookBlock from "@/components/book-block";
import ScaleWrapper from "@/components/wishlist/scale-wrapper";
import { SmoothHeight } from "@/components/ui-components/smooth-height";
import { cn } from "@/lib/utils";
import GridSizeIndicator from "./grid-size-indicator";
import { useRegisterGrid } from "./grid-registry";
import { useDevMode } from "@/hooks/ui-hooks/use-dev-mode";
import {
  useCurateStore,
  isShelfBookMatchingFilters,
} from "@/hooks/layout-hooks/use-curate-menu";
import {
  rowIndexToLetters,
  lettersToRowIndex,
  parseGridPosition,
  formatGridPosition,
  calculateShelfGridDimensions,
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
    import("@/components/read-book-detail/read-book-detail");

    books.forEach((book) => {
      if (book.status === "read") {
        try {
          router.prefetch(`/read/${book.id}`, { kind: PrefetchKind.FULL });
        } catch {
          router.prefetch(`/read/${book.id}`);
        }
      }
    });
  }, [books, router]);

  // Subscribe to real-time curate filter state
  const isClassicsActive = useCurateStore((state) => state.isClassicsActive);
  const selectedGenres = useCurateStore((state) => state.selectedGenres);
  const pageRange = useCurateStore((state) => state.pageRange);

  // Set of book IDs that satisfy the current filter criteria
  const matchingBookIds = useMemo(() => {
    const set = new Set<string>();
    books.forEach((b) => {
      if (
        isShelfBookMatchingFilters(
          b,
          isClassicsActive,
          selectedGenres,
          pageRange
        )
      ) {
        set.add(b.id);
      }
    });
    return set;
  }, [books, isClassicsActive, selectedGenres, pageRange]);

  // Set of book IDs that are currently scaling out (Phase 1 before unmounting)
  const [exitingBookIds, setExitingBookIds] = useState<Set<string>>(
    () => new Set()
  );

  // Set of newly mounted book IDs that should animate in from scale 0
  const [newlyMountedIds, setNewlyMountedIds] = useState<Set<string>>(
    () => new Set()
  );

  // Track previous matching IDs to detect filter transitions during render
  const [prevMatchingBookIds, setPrevMatchingBookIds] =
    useState<Set<string>>(matchingBookIds);

  if (matchingBookIds !== prevMatchingBookIds) {
    setPrevMatchingBookIds(matchingBookIds);

    const nextExiting = new Set(exitingBookIds);
    const nextNewlyMounted = new Set(newlyMountedIds);

    // Books that were previously matching, but now aren't, enter exiting (scale-out)
    prevMatchingBookIds.forEach((id) => {
      if (!matchingBookIds.has(id)) {
        nextExiting.add(id);
      }
    });

    // Books that newly match:
    matchingBookIds.forEach((id) => {
      if (nextExiting.has(id)) {
        nextExiting.delete(id);
      }
      if (!prevMatchingBookIds.has(id)) {
        nextNewlyMounted.add(id);
      }
    });

    setExitingBookIds(nextExiting);
    setNewlyMountedIds(nextNewlyMounted);
  }

  // Called when a book's scale-to-0 animation finishes: unmount it from the layout
  const handleScaleOutComplete = useCallback((bookId: string) => {
    setExitingBookIds((prev) => {
      if (!prev.has(bookId)) return prev;
      const next = new Set(prev);
      next.delete(bookId);
      return next;
    });
    setNewlyMountedIds((prev) => {
      if (!prev.has(bookId)) return prev;
      const next = new Set(prev);
      next.delete(bookId);
      return next;
    });
  }, []);

  // displayedBooks includes matching books PLUS books currently completing scale-out
  const displayedBooks = useMemo(() => {
    return books.filter(
      (b) => matchingBookIds.has(b.id) || exitingBookIds.has(b.id)
    );
  }, [books, matchingBookIds, exitingBookIds]);

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

  // Base dimensions calculated from all books before filtering
  const { cols: K } = useMemo(() => {
    return calculateShelfGridDimensions(
      books,
      blockSize,
      effectiveGapX,
      effectiveGapY,
      propCols,
      propRows
    );
  }, [books, blockSize, effectiveGapX, effectiveGapY, propCols, propRows]);

  const initialGridWidthCells = useMemo(() => {
    return K * blockSize + Math.max(0, K - 1) * effectiveGapX;
  }, [K, blockSize, effectiveGapX]);

  // Group shelf books into alternating rows (K, K - 1):
  // 1. Contiguously fills rows so no blank gaps exist
  // 2. Honors explicit positions inside active slots
  // 3. Auto-flows remaining books into open slots
  const shelfRows = useMemo(() => {
    const totalBooks = displayedBooks.length;
    if (totalBooks === 0) return [];

    // Step 1: Calculate capacities for each row (alternating K, K - 1)
    const rowCapacities: number[] = [];
    let remaining = totalBooks;
    let r = 0;
    while (remaining > 0) {
      const cap = r % 2 === 0 ? K : Math.max(1, K - 1);
      const countInRow = Math.min(remaining, cap);
      rowCapacities.push(countInRow);
      remaining -= countInRow;
      r++;
    }

    // Step 2: Separate explicit books that land in active slots from overflow/unpositioned books
    const slotMap = new Map<string, BookItem>();
    const overflowExplicitBooks: BookItem[] = [];
    const unpositionedBooks: BookItem[] = [];

    displayedBooks.forEach((book) => {
      if (book.position) {
        const parsed = parseGridPosition(book.position);
        if (
          parsed &&
          parsed.row >= 0 &&
          parsed.row < rowCapacities.length &&
          parsed.colIndex >= 0 &&
          parsed.colIndex < rowCapacities[parsed.row] &&
          !slotMap.has(`${parsed.row}-${parsed.colIndex}`)
        ) {
          slotMap.set(`${parsed.row}-${parsed.colIndex}`, book);
        } else {
          overflowExplicitBooks.push(book);
        }
      } else {
        unpositionedBooks.push(book);
      }
    });

    // Pool of books to auto-flow into remaining unassigned slots
    const autoflowPool = [...overflowExplicitBooks, ...unpositionedBooks];
    let autoflowIdx = 0;

    // Step 3: Populate each row contiguously without any blank gaps
    const rows: Array<
      Array<{
        key: string;
        coordinate: string;
        book: BookItem;
      }>
    > = [];

    for (let rowIdx = 0; rowIdx < rowCapacities.length; rowIdx++) {
      const count = rowCapacities[rowIdx];
      const rowItems: Array<{
        key: string;
        coordinate: string;
        book: BookItem;
      }> = [];

      for (let c = 0; c < count; c++) {
        const key = `${rowIdx}-${c}`;
        let bookToPlace: BookItem | undefined;

        if (slotMap.has(key)) {
          bookToPlace = slotMap.get(key);
        } else if (autoflowIdx < autoflowPool.length) {
          bookToPlace = autoflowPool[autoflowIdx++];
        }

        if (bookToPlace) {
          rowItems.push({
            key: `shelf-slot-${bookToPlace.id}`,
            coordinate: formatGridPosition(rowIdx, c),
            book: bookToPlace,
          });
        }
      }

      if (rowItems.length > 0) {
        rows.push(rowItems);
      }
    }

    return rows;
  }, [displayedBooks, K]);

  useRegisterGrid(
    useMemo(
      () => ({
        id: "shelf",
        name: "Books Read",
        cols: K,
        rows: Math.max(1, shelfRows.length),
        blockSize,
        gapX: effectiveGapX,
        gapY: effectiveGapY,
        totalBooks: displayedBooks.length,
        explicitBooksCount: displayedBooks.filter((b) => Boolean(b.position))
          .length,
        unpositionedBooksCount: displayedBooks.filter((b) => !b.position)
          .length,
        isCoordinatesVisible,
        onToggleCoordinates: () => setLocalShowCoordinates((prev) => !prev),
        enableGridSizeDisplay: shouldShowGridSizeIndicator,
      }),
      [
        K,
        shelfRows.length,
        blockSize,
        effectiveGapX,
        effectiveGapY,
        displayedBooks,
        isCoordinatesVisible,
        shouldShowGridSizeIndicator,
      ]
    )
  );

  return (
    <div
      id="books-read"
      className={cn(
        "px-cell relative flex min-h-[45vh] flex-col items-center select-none",
        className
      )}
      style={{
        rowGap: `calc(var(--cell-size) * ${effectiveGapY})`,
        minWidth: `calc(var(--cell-size) * ${initialGridWidthCells})`,
      }}
    >
      {/* Developer Mode: Bottom-Left Floating Grid Size Indicator & Inspector */}
      {shouldShowGridSizeIndicator && (
        <GridSizeIndicator
          cols={K}
          rows={Math.max(1, shelfRows.length)}
          blockSize={blockSize}
          gapX={effectiveGapX}
          gapY={effectiveGapY}
          totalBooks={displayedBooks.length}
          explicitBooksCount={
            displayedBooks.filter((b) => Boolean(b.position)).length
          }
          unpositionedBooksCount={
            displayedBooks.filter((b) => !b.position).length
          }
          isCoordinatesVisible={isCoordinatesVisible}
          onToggleCoordinates={() => setLocalShowCoordinates((prev) => !prev)}
          enableGridSizeDisplay={shouldShowGridSizeIndicator}
        />
      )}

      {/* Render Shelf Rows with smooth Layout Animations */}
      <SmoothHeight>
        <LayoutGroup id="shelf-brick-grid">
          {displayedBooks.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: easing022 }}
              style={{
                minWidth: `calc(var(--cell-size) * ${initialGridWidthCells})`,
              }}
              className="my-cell-4 flex flex-col items-center justify-center py-16 text-center select-none"
            >
              <p className="font-mona-sans text-[15px] font-medium text-black/50">
                no books match the selected filters
              </p>
            </motion.div>
          ) : (
            <div
              className="relative flex flex-col items-center select-none"
              style={{
                rowGap: `calc(var(--cell-size) * ${effectiveGapY})`,
                minWidth: `calc(var(--cell-size) * ${initialGridWidthCells})`,
              }}
            >
              {shelfRows.map((row, r) => (
                <motion.div
                  key={`shelf-row-${r}`}
                  layout
                  transition={{ duration: 0.55, ease: easing022 }}
                  className="relative flex flex-row justify-center focus-within:z-40 hover:z-40 has-data-hovered:z-40"
                  style={{
                    columnGap: `calc(var(--cell-size) * ${effectiveGapX})`,
                  }}
                >
                  {row.map((item) => (
                    <motion.div
                      key={item.key}
                      layoutId={`shelf-card-${item.book.id}`}
                      layout
                      transition={{ duration: 1, ease: easing022 }}
                      className="relative flex shrink-0 items-center justify-center focus-within:z-50 hover:z-50 has-data-hovered:z-50"
                    >
                      <ScaleWrapper
                        isScalingOut={exitingBookIds.has(item.book.id)}
                        isNewlyMounted={newlyMountedIds.has(item.book.id)}
                        onScaleOutComplete={() =>
                          handleScaleOutComplete(item.book.id)
                        }
                      >
                        <BookBlock book={item.book} size={blockSize} />
                      </ScaleWrapper>

                      {/* Coordinate badge for occupied book blocks */}
                      {isCoordinatesVisible && (
                        <div className="pointer-events-none absolute top-2 left-2 z-40 rounded bg-black/80 px-1.5 py-0.5 font-mono text-[10px] font-bold text-white shadow backdrop-blur-xs select-none">
                          {item.coordinate}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </motion.div>
              ))}
            </div>
          )}
        </LayoutGroup>
      </SmoothHeight>
    </div>
  );
};

export default ShelfGrid;
