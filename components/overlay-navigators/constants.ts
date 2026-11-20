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
