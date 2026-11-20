export const GENRE_OPTIONS = [
  "all",
  "sci-fi",
  "fiction",
  "philosophy",
  "dystopian",
  "thriller",
] as const;

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
