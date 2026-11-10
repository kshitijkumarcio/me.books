import type { CurrentlyReadingBook, BookItem } from "@/books/books-index";
import { parseCellUnit } from "@/components/book-block/book-block";

export interface PillCoord {
  top: string;
  left?: string;
  right?: string;
  transform: string;
  y: number;
}

export interface ActivePillState {
  index: number;
  side: "left" | "right";
  coord: PillCoord;
}

/**
 * Calculates a random position on either the "left" or "right" side:
 * - Vertically: strictly inside [0.45, 3.9] cells (never hides progress bar).
 * - Horizontally:
 *   - Overlaps the book cover by at most 0.35 cell width (< 0.5 cell limit).
 *   - Never more than 0.25 cell away from cover.
 */
export function getRandomSidePosition(
  side: "left" | "right",
  customRand?: () => number,
  minY = 0.45,
  maxY = 3.9,
  minOffset = 3.85,
  maxOffsetDelta = 0.6
): PillCoord {
  const rand = customRand || Math.random;
  const bestY = minY + rand() * (maxY - minY);
  const rotation = (rand() - 0.5) * 3;

  if (side === "left") {
    const rightOffset = minOffset + rand() * maxOffsetDelta;
    return {
      top: `calc(var(--cell-size) * ${bestY.toFixed(2)})`,
      right: `calc(var(--cell-size) * ${rightOffset.toFixed(2)})`,
      transform: `rotate(${rotation.toFixed(1)}deg)`,
      y: bestY,
    };
  } else {
    const leftOffset = minOffset + rand() * maxOffsetDelta;
    return {
      top: `calc(var(--cell-size) * ${bestY.toFixed(2)})`,
      left: `calc(var(--cell-size) * ${leftOffset.toFixed(2)})`,
      transform: `rotate(${rotation.toFixed(1)}deg)`,
      y: bestY,
    };
  }
}

/**
 * Creates a simple deterministic PRNG for unique initial book coords
 */
export function createBookPRNG(seedNum: number) {
  let s = (seedNum * 16807 + 1013904223) % 2147483647;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/**
 * Resolves cover dimensions, format, and rotation settings.
 */
export function getCoverConfig(book?: CurrentlyReadingBook | BookItem | null) {
  if (!book) {
    return { widthClass: "w-36", rotation: "rotate-0", cellWidth: undefined };
  }
  const coverElement = book.layout?.find((el) => el.type === "cover");
  const defaultWidth =
    book.format === "little-penguin-classic" ? "w-32" : "w-36";

  const widthClass = coverElement?.widthClass || defaultWidth;
  const rotation = coverElement?.rotation || "rotate-0";
  const cellWidth = parseCellUnit(widthClass);

  return { widthClass, rotation, cellWidth };
}

/**
 * Safely extracts current pages read and total pages.
 */
export function getReadingProgress(
  book?: CurrentlyReadingBook | BookItem | null
) {
  if (!book) return { progress: 0, totalPages: 100 };
  const progress =
    "progress" in book && typeof book.progress === "number" ? book.progress : 0;
  const totalPages =
    "total_pages" in book && typeof book.total_pages === "number"
      ? book.total_pages
      : 100;

  return { progress, totalPages };
}
