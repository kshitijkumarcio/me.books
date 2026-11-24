export const GENRE_OPTIONS = [
  "all",
  "sci-fi",
  "fantasy",
  "fiction",
  "romance",
  "dystopian",
  "essays",
  "non-fiction",
  "philosophy",
  "adventure",
] as const;

export const MIN_BOOK_LENGTH = 10;
export const MAX_BOOK_LENGTH = 900;

export const MIN_BOOK_PRICE = 100;
export const MAX_BOOK_PRICE = 1000;

export const LENGTH_OPTIONS = [
  { id: "all", label: "all" },
  { id: "short", label: "< 250p" },
  { id: "medium", label: "250-450p" },
  { id: "long", label: "450p+" },
] as const;

export const PRICE_RANGE_OPTIONS = [
  { id: "all", label: "all" },
  { id: "under-400", label: "< 350" },
  { id: "400-600", label: "350 - 500" },
  { id: "above-600", label: "> 500" },
] as const;

export const PRIORITY_OPTIONS = [
  { id: "all", label: "like these." },
  { id: "top", label: "love these!" },
  { id: "high", label: "need these!!" },
] as const;
