"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { PrefetchKind } from "next/dist/client/components/router-reducer/router-reducer-types";
import { motion, LayoutGroup } from "motion/react";
import { easing022 } from "@/constants";
import { cn } from "@/lib/utils";
import { wishlistBooks, allBooks } from "@/books/books-index";
import type { WishlistBook } from "@/books/books-index";
import {
  calculateShelfGridDimensions,
  formatGridPosition,
  parseGridPosition,
} from "@/components/shelf-grid/grid-utils";
import { useRegisterGrid } from "@/components/shelf-grid/grid-registry";
import { useDevMode } from "@/hooks/ui-hooks/use-dev-mode";
import {
  useShortlistStore,
  isWishlistBookMatchingFilters,
} from "@/hooks/layout-hooks/use-shortlist-menu";
import WishListBlock from "./wishlist-block";
import ScaleWrapper from "./scale-wrapper";
import WishlistStampTicket from "./wishlist-stamp-ticket";
import { SmoothHeight } from "@/components/ui-components/smooth-height";

export const WishListBlockSize = 5.5;

export interface WishlistProps {
  books?: WishlistBook[];
  cols?: number;
  WishListBlockSize?: number;
  blockSize?: number;
  horizontalGap?: number;
  verticalGap?: number;
  className?: string;
  showCoordinates?: boolean;
  showGridSize?: boolean;
  enableGridSizeDisplay?: boolean;
}

const Wishlist = ({
  books = wishlistBooks,
  cols,
  WishListBlockSize: propWishListBlockSize,
  blockSize,
  horizontalGap = 0,
  verticalGap = 1,
  className,
  showCoordinates: propShowCoordinates,
  showGridSize,
  enableGridSizeDisplay,
}: WishlistProps) => {
  const effectiveBlockSize =
    propWishListBlockSize ?? blockSize ?? WishListBlockSize;

  const router = useRouter();

  // Prefetch intercepted routes for wishlist books and pre-warm detail component
  useEffect(() => {
    import("./wishlist-book-detail");
    books.forEach((book) => {
      try {
        router.prefetch(`/wishlist/${book.id}`, { kind: PrefetchKind.FULL });
      } catch {
        router.prefetch(`/wishlist/${book.id}`);
      }
    });
  }, [books, router]);

  // Subscribe to real-time shortlist filter state (price range & priority)
  const priceRange = useShortlistStore((state) => state.priceRange);
  const selectedPriorities = useShortlistStore(
    (state) => state.selectedPriorities
  );

  // Set of book IDs that satisfy the current filter criteria
  const matchingBookIds = useMemo(() => {
    const set = new Set<string>();
    books.forEach((b) => {
      if (isWishlistBookMatchingFilters(b, priceRange, selectedPriorities)) {
        set.add(b.id);
      }
    });
    return set;
  }, [books, priceRange, selectedPriorities]);

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

    // Books that were previously matching, but now aren't, enter the exiting (scale-out) state
    prevMatchingBookIds.forEach((id) => {
      if (!matchingBookIds.has(id)) {
        nextExiting.add(id);
      }
    });

    // Books that newly match:
    matchingBookIds.forEach((id) => {
      // If it was in exiting state, cancel exiting
      if (nextExiting.has(id)) {
        nextExiting.delete(id);
      }
      // If it wasn't matching before, mark as newly mounted so it scales in
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

  // The active list of books passed to the grid layout calculation.
  // Includes all matching books PLUS books currently completing their scale-out animation.
  const displayedBooks = useMemo(() => {
    return books.filter(
      (b) => matchingBookIds.has(b.id) || exitingBookIds.has(b.id)
    );
  }, [books, matchingBookIds, exitingBookIds]);

  // Local coordinate toggle state
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

  // 1. Calculate the column count and total cell width of ShelfGrid (BooksRead)
  // ShelfGrid defaults: blockSize = 8, horizontalGap = 1, verticalGap = 0.5
  const shelfCols = useMemo(
    () => calculateShelfGridDimensions(allBooks, 8, 1, 0.5).cols,
    []
  );

  const shelfWidthCells = useMemo(() => {
    const shelfBlockSize = 8;
    const shelfGapX = 1;
    return shelfCols * shelfBlockSize + Math.max(0, shelfCols - 1) * shelfGapX;
  }, [shelfCols]);

  // 2. Dynamically calculate how many columns we need based on WishListBlockSize
  // to match the approx page width defined by the ShelfGrid
  const dynamicCols = useMemo(() => {
    if (cols && cols > 0) return cols;

    // Total Wishlist width for C columns: C * effectiveBlockSize + (C - 1) * horizontalGap
    // Solving: C * (effectiveBlockSize + horizontalGap) - horizontalGap ≈ shelfWidthCells
    const unitWidth = effectiveBlockSize + horizontalGap;
    if (unitWidth <= 0) return shelfCols;

    const targetCols = Math.round(
      (shelfWidthCells + horizontalGap) / unitWidth
    );
    return Math.max(1, targetCols);
  }, [cols, effectiveBlockSize, horizontalGap, shelfWidthCells, shelfCols]);

  const effectiveCols = dynamicCols;

  // Grid width calculated to match the full ShelfGrid zone width
  const defaultGridWidth = useMemo(() => {
    return `calc(var(--cell-size) * ${shelfWidthCells})`;
  }, [shelfWidthCells]);

  // Group wishlist books into alternating rows (effectiveCols, effectiveCols - 1):
  // 1. Always fills the entire width of the zone size (as set by ShelfGrid) first.
  // 2. Rows with fewer books than their capacity are centered with NO empty gaps.
  // 3. Honors explicit book positions (book.position) where they fall inside the occupied slots,
  //    and auto-flows remaining books into all open slots so zero blank spaces exist.
  const brickRows = useMemo(() => {
    const totalBooks = displayedBooks.length;
    if (totalBooks === 0) return [];

    // Step 1: Calculate capacities for each row (alternating effectiveCols, effectiveCols - 1)
    const rowCapacities: number[] = [];
    let remaining = totalBooks;
    let r = 0;
    while (remaining > 0) {
      const cap = r % 2 === 0 ? effectiveCols : Math.max(1, effectiveCols - 1);
      const countInRow = Math.min(remaining, cap);
      rowCapacities.push(countInRow);
      remaining -= countInRow;
      r++;
    }

    // Step 2: Separate explicit books that land in active slots from overflow/unpositioned books
    const slotMap = new Map<string, WishlistBook>();
    const overflowExplicitBooks: WishlistBook[] = [];
    const unpositionedBooks: WishlistBook[] = [];

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
        book: WishlistBook;
      }>
    > = [];

    for (let rowIdx = 0; rowIdx < rowCapacities.length; rowIdx++) {
      const count = rowCapacities[rowIdx];
      const rowItems: Array<{
        key: string;
        coordinate: string;
        book: WishlistBook;
      }> = [];

      for (let c = 0; c < count; c++) {
        const key = `${rowIdx}-${c}`;
        let bookToPlace: WishlistBook | undefined;

        if (slotMap.has(key)) {
          bookToPlace = slotMap.get(key);
        } else if (autoflowIdx < autoflowPool.length) {
          bookToPlace = autoflowPool[autoflowIdx++];
        }

        if (bookToPlace) {
          rowItems.push({
            key: `wishlist-slot-${bookToPlace.id}`,
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
  }, [displayedBooks, effectiveCols]);

  // Register Wishlist with unified Grid Registry for the developer indicator
  useRegisterGrid(
    useMemo(
      () => ({
        id: "wishlist",
        name: "Wishlist",
        cols: effectiveCols,
        rows: Math.max(1, brickRows.length),
        blockSize: effectiveBlockSize,
        gapX: horizontalGap,
        gapY: verticalGap,
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
        effectiveCols,
        brickRows.length,
        effectiveBlockSize,
        horizontalGap,
        verticalGap,
        displayedBooks,
        isCoordinatesVisible,
        shouldShowGridSizeIndicator,
      ]
    )
  );

  return (
    <div
      id="wishlist"
      className={cn("mt-cell-[1.93] relative w-full", className)}
    >
      <div className="pointer-events-none sticky left-0 w-screen px-9 lg:px-5">
        <div className="flex w-full items-center justify-between">
          <p className="font-mona-sans text-[calc(12px+4dvw)] leading-[calc(12px+5dvw)] font-medium text-black uppercase">
            {"I'D LOVEEE"}
          </p>
          {/* <div className="mx-8 h-1 w-full bg-black" /> */}
          <p className="font-mona-sans text-[calc(12px+4dvw)] leading-[calc(12px+5dvw)] font-medium text-black uppercase">
            RECEIVING
          </p>
        </div>
        <div className="relative z-10 flex w-full items-center justify-between">
          <p className="font-mona-sans text-[calc(12px+4dvw)] leading-[calc(12px+5dvw)] font-medium text-black uppercase">
            ANY OF
          </p>
          <p className="font-mona-sans text-[calc(12px+4dvw)] leading-[calc(12px+5dvw)] font-medium text-black uppercase">
            (&nbsp;THESE&nbsp;)
          </p>
          <p className="font-mona-sans text-[calc(12px+4dvw)] leading-[calc(12px+5dvw)] font-medium text-black uppercase">
            BOOKS
          </p>
        </div>
        <div className="mt-cell-[1.9] relative flex items-start justify-between">
          {/* 3D Interactive Postage Stamp Ticket */}
          <WishlistStampTicket className="absolute right-[16.5%] bottom-0 aspect-2/3 max-w-30" />
          <p className="font-mona-sans relative text-[14px] font-semibold">
            (below is my
          </p>
          <p className="font-mona-sans relative text-[14px] font-semibold">
            wishlist for books)
          </p>
        </div>
      </div>

      <div className="pointer-events-auto">
        <SmoothHeight>
          <LayoutGroup id="wishlist-brick-grid">
            {displayedBooks.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: easing022 }}
                style={{
                  minWidth: defaultGridWidth,
                }}
                className="mt-cell-4 flex flex-col items-center justify-center py-16 text-center select-none"
              >
                <p className="font-mona-sans text-[15px] font-medium text-black/50">
                  no books match the selected filters
                </p>
              </motion.div>
            ) : (
              /* Wishlist Alternating Brick Grid matching BooksRead page width */
              <div
                className="mt-cell-1.25 relative flex flex-col items-center select-none"
                style={{
                  rowGap: `calc(var(--cell-size) * ${verticalGap})`,
                  minWidth: defaultGridWidth,
                }}
              >
                {brickRows.map((row, r) => (
                  <motion.div
                    key={`wishlist-row-${r}`}
                    layout
                    transition={{ duration: 0.55, ease: easing022 }}
                    className="relative flex flex-row justify-center focus-within:z-40 hover:z-40 has-data-hovered:z-40"
                    style={{
                      columnGap: `calc(var(--cell-size) * ${horizontalGap})`,
                    }}
                  >
                    {row.map((item) => (
                      <motion.div
                        key={item.key}
                        layoutId={`wishlist-card-${item.book.id}`}
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
                          <WishListBlock
                            book={item.book}
                            size={effectiveBlockSize}
                          />
                        </ScaleWrapper>

                        {/* Co-ordinates badge for occupied wishlist book blocks */}
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
    </div>
  );
};

export default Wishlist;
