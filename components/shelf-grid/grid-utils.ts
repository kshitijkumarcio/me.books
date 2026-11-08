import type { BookItem } from "@/books/books-index";

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
 * Calculates optimal K (columns) and R (rows) for an alternating brick masonry shelf grid,
 * matching overall aspect ratio and respecting any explicitly placed books.
 */
export const calculateShelfGridDimensions = (
  books: BookItem[],
  blockSize = 8,
  effectiveGapX = 1,
  effectiveGapY = 0.5,
  propCols?: number,
  propRows?: number
): { cols: number; rows: number } => {
  let minRequiredK = 2;
  let minRequiredR = 1;

  books.forEach((book) => {
    if (book.position) {
      const parsed = parseGridPosition(book.position);
      if (parsed) {
        const colNumber = parsed.colIndex + 1;
        const neededK = parsed.row % 2 === 0 ? colNumber : colNumber + 1;
        if (neededK > minRequiredK) minRequiredK = neededK;
        if (parsed.row + 1 > minRequiredR) minRequiredR = parsed.row + 1;
      }
    }
  });

  const totalSlots = books.length;
  if (totalSlots === 0) {
    return { cols: 1, rows: 1 };
  }

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

    const widthCells =
      candidateK * blockSize + Math.max(0, candidateK - 1) * effectiveGapX;
    const heightCells = r * blockSize + Math.max(0, r - 1) * effectiveGapY;

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
};

/**
 * Separates explicit positions from unpositioned books and resolves collision conflicts.
 */
export const parseGridExplicitBooks = <T extends BookItem>(
  books: T[],
  gridLabel = "ShelfGrid"
): {
  explicitMap: Map<string, T>;
  unpositionedBooks: T[];
  minRequiredK: number;
  minRequiredR: number;
} => {
  const explicit = new Map<string, T>();
  const seenExplicit = new Map<string, T[]>();
  const unpositioned: T[] = [];

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
            `[${gridLabel}] Invalid position format "${book.position}" for book "${book.title || book.id}". Expected e.g. "A1", "B5".`
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

  seenExplicit.forEach((assignedBooks, key) => {
    const [r, c] = key.split("-").map(Number);
    const coordLabel = formatGridPosition(r, c);

    explicit.set(key, assignedBooks[0]);

    const colNumber = c + 1;
    const neededK = r % 2 === 0 ? colNumber : colNumber + 1;
    if (neededK > reqK) reqK = neededK;
    if (r + 1 > reqR) reqR = r + 1;

    if (assignedBooks.length > 1) {
      if (process.env.NODE_ENV !== "production") {
        console.warn(
          `[${gridLabel} Collision] Position "${coordLabel}" was claimed by ${assignedBooks.length} books: ${assignedBooks
            .map((b) => `"${b.title || b.id}"`)
            .join(", ")}. Book "${assignedBooks[0].title || assignedBooks[0].id}" was placed here; others were moved to unpositioned auto-flow.`
        );
      }
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
};

/**
 * Builds alternating rows layout matrix (K, K-1, K, K-1...) filling explicit positions
 * first and auto-flowing unpositioned books into remaining open slots.
 */
export const buildAlternatingGridSlots = <T extends BookItem>(
  rows: number,
  cols: number,
  explicitMap: Map<string, T>,
  unpositionedBooks: T[]
): Array<Array<{ coordinate: string; book?: T; isOccupied: boolean }>> => {
  let unpositionedIndex = 0;
  const result: Array<Array<{ coordinate: string; book?: T; isOccupied: boolean }>> = [];

  for (let r = 0; r < rows; r++) {
    const rowCapacity = r % 2 === 0 ? cols : Math.max(1, cols - 1);
    const rowItems: Array<{ coordinate: string; book?: T; isOccupied: boolean }> = [];

    for (let c = 0; c < rowCapacity; c++) {
      const coord = formatGridPosition(r, c);
      const key = `${r}-${c}`;

      let bookToPlace: T | undefined;

      if (explicitMap.has(key)) {
        bookToPlace = explicitMap.get(key);
      } else if (unpositionedIndex < unpositionedBooks.length) {
        bookToPlace = unpositionedBooks[unpositionedIndex++];
      }

      rowItems.push({
        coordinate: coord,
        book: bookToPlace,
        isOccupied: Boolean(bookToPlace),
      });
    }

    if (rowItems.length > 0) {
      result.push(rowItems);
    }
  }

  return result;
};

