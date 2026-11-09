"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { wishlistBooks, allBooks } from "@/books/books-index";
import type { WishlistBook } from "@/books/books-index";
import {
  calculateShelfGridDimensions,
  formatGridPosition,
  parseGridExplicitBooks,
} from "@/components/shelf-grid/grid-utils";
import { EmptyBlock } from "@/components/shelf-grid/shelf-grid";
import { useRegisterGrid } from "@/components/shelf-grid/grid-registry";
import { useDevMode } from "@/hooks/ui-hooks/use-dev-mode";
import WishListBlock from "./wishlist-block";

export const WishListBlockSize = 6;

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

  // 3. Parse explicit positions & detect min columns/rows (like ShelfGrid)
  const { explicitMap, unpositionedBooks, minRequiredK, minRequiredR } =
    useMemo(() => {
      return parseGridExplicitBooks(books, "Wishlist");
    }, [books]);

  const effectiveCols = Math.max(dynamicCols, minRequiredK);

  // Calculate total rows needed to accommodate all books and explicit placements
  const totalRows = useMemo(() => {
    let cap = 0;
    let r = 0;
    while (cap < books.length || r < minRequiredR) {
      cap += r % 2 === 0 ? effectiveCols : Math.max(1, effectiveCols - 1);
      r++;
    }
    return Math.max(1, r);
  }, [books.length, minRequiredR, effectiveCols]);

  // Register Wishlist with unified Grid Registry for the developer indicator
  useRegisterGrid(
    useMemo(
      () => ({
        id: "wishlist",
        name: "Wishlist",
        cols: effectiveCols,
        rows: totalRows,
        blockSize: effectiveBlockSize,
        gapX: horizontalGap,
        gapY: verticalGap,
        totalBooks: books.length,
        explicitBooksCount: explicitMap.size,
        unpositionedBooksCount: unpositionedBooks.length,
        isCoordinatesVisible,
        onToggleCoordinates: () => setLocalShowCoordinates((prev) => !prev),
        enableGridSizeDisplay: shouldShowGridSizeIndicator,
      }),
      [
        effectiveCols,
        totalRows,
        effectiveBlockSize,
        horizontalGap,
        verticalGap,
        books.length,
        explicitMap.size,
        unpositionedBooks.length,
        isCoordinatesVisible,
        shouldShowGridSizeIndicator,
      ]
    )
  );

  // Group wishlist books into alternating rows to create the masonry brick pattern:
  // - Even rows (0, 2, ...): effectiveCols
  // - Odd rows (1, 3, ...): effectiveCols - 1 (centered)
  const brickRows = useMemo(() => {
    let unpositionedIndex = 0;
    const rows: Array<
      Array<{
        key: string;
        coordinate: string;
        book?: WishlistBook;
      }>
    > = [];

    for (let r = 0; r < totalRows; r++) {
      const rowCapacity =
        r % 2 === 0 ? effectiveCols : Math.max(1, effectiveCols - 1);

      // Find which unassigned slots in this row should be filled.
      // If there are not enough books to fill the complete row, fill from the center instead of an edge.
      const center = (rowCapacity - 1) / 2;
      const unassignedCols: number[] = [];

      for (let c = 0; c < rowCapacity; c++) {
        const key = `${r}-${c}`;
        if (!explicitMap.has(key)) {
          unassignedCols.push(c);
        }
      }

      // How many unpositioned books can we place in this row?
      const unpositionedRemaining =
        unpositionedBooks.length - unpositionedIndex;
      const booksToPlaceCount = Math.max(
        0,
        Math.min(unpositionedRemaining, unassignedCols.length)
      );

      // Sort unassigned columns by distance to center so partial rows are filled from the center
      unassignedCols.sort(
        (a, b) => Math.abs(a - center) - Math.abs(b - center) || a - b
      );

      // The chosen columns are the ones closest to the center
      const chosenCols = new Set(unassignedCols.slice(0, booksToPlaceCount));

      const rowItems: Array<{
        key: string;
        coordinate: string;
        book?: WishlistBook;
      }> = [];

      for (let c = 0; c < rowCapacity; c++) {
        const coord = formatGridPosition(r, c);
        const key = `${r}-${c}`;

        let bookToPlace: WishlistBook | undefined;

        if (explicitMap.has(key)) {
          bookToPlace = explicitMap.get(key);
        } else if (chosenCols.has(c)) {
          bookToPlace = unpositionedBooks[unpositionedIndex++];
        }

        rowItems.push({
          key: bookToPlace ? `book-${bookToPlace.id}` : `empty-${coord}`,
          coordinate: coord,
          book: bookToPlace,
        });
      }

      rows.push(rowItems);
    }

    // Trim trailing rows if all slots in them are empty
    while (
      rows.length > 1 &&
      rows[rows.length - 1].every((item) => !item.book)
    ) {
      rows.pop();
    }

    return rows;
  }, [totalRows, effectiveCols, explicitMap, unpositionedBooks]);

  return (
    <div
      id="wishlist"
      className={cn("mt-cell-[1.7] relative min-h-dvh w-full", className)}
    >
      <div className="pointer-events-none sticky left-0 w-screen px-9 lg:px-5">
        <div className="flex w-full items-center justify-between">
          <p className="font-mona-sans text-[calc(12px+4dvw)] leading-[calc(12px+5dvw)] font-medium text-black uppercase">
            (WISHLIST
          </p>
          <div className="mx-8 h-1 w-full bg-black" />
          <p className="font-mona-sans -translate-y-1 text-[calc(12px+4dvw)] leading-[calc(12px+5dvw)] font-medium text-black lowercase">
            muhehe)
          </p>
        </div>
      </div>

      <div className="pointer-events-auto">
        {/* Wishlist Alternating Brick Grid matching BooksRead page width */}
        <div
          className="mt-cell-[1.3] relative flex flex-col items-center select-none"
          style={{
            rowGap: `calc(var(--cell-size) * ${verticalGap})`,
          }}
        >
          {brickRows.map((row, r) => (
            <div
              key={`wishlist-row-${r}`}
              className="relative flex flex-row justify-center hover:z-40"
              style={{
                columnGap: `calc(var(--cell-size) * ${horizontalGap})`,
              }}
            >
              {row.map((item) => (
                <div
                  key={item.key}
                  className="relative flex shrink-0 items-center justify-center focus-within:z-50 hover:z-50"
                >
                  {item.book ? (
                    <WishListBlock book={item.book} size={effectiveBlockSize} />
                  ) : (
                    <EmptyBlock
                      size={effectiveBlockSize}
                      coordinate={item.coordinate}
                      showCoordinate={isCoordinatesVisible}
                    />
                  )}

                  {/* Coordinate badge for occupied wishlist book blocks */}
                  {isCoordinatesVisible && item.book && (
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

export default Wishlist;
