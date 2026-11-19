import type React from "react";
import type { StaticImageData } from "next/image";

export type PositionValue = string | number;

export interface ElementPosition {
  top?: PositionValue;
  right?: PositionValue;
  bottom?: PositionValue;
  left?: PositionValue;
  width?: PositionValue;
  height?: PositionValue;
  zIndex?: number;
  rotation?: string;
}

export interface BaseLayoutElement extends ElementPosition {
  id?: string;
  className?: string;
}

// Book format types (affects cover dimensions and styling)
export type BookFormat = "standard" | "little-penguin-classic";

export const COVER_FORMAT_SIZES: Record<BookFormat, string> = {
  standard: "w-46",
  "little-penguin-classic": "w-40",
};

export interface CoverLayoutElement extends BaseLayoutElement {
  type: "cover";
  src?: StaticImageData | string;
  alt?: string;
  widthClass?: string;
  format?: BookFormat;
}

export type QuoteTextColor =
  "black" | "white" | `text-[${string}]` | `#${string}` | (string & {});

export interface QuoteLayoutElement extends BaseLayoutElement {
  type: "quote";
  quote: string;
  author?: string;
  paperColor?: string;
  textColor?: QuoteTextColor;
  paperSeed?: number;
  tearStrength?: number;
  tearFrequency?: number;
  roughness?: number;
  lightAngle?: number;
  lightElevation?: number;
  maxWidthClass?: string;
}

export interface ImageLayoutElement extends BaseLayoutElement {
  type: "image";
  src: StaticImageData | string;
  alt?: string;
  widthClass?: string;
}

export interface CodeLayoutElement extends BaseLayoutElement {
  type: "code";
  code: string;
  language?: string;
  filename?: string;
}

export interface TagLayoutElement extends BaseLayoutElement {
  type: "tag";
  text: string;
  color?: string;
}

export interface PillMessageLayoutElement extends BaseLayoutElement {
  type: "pill-message";
  text?: React.ReactNode;
  pill_classnames?: string;
  text_classnames?: string;
}

export interface CustomLayoutElement extends BaseLayoutElement {
  type: "custom";
  content?: React.ReactNode;
}

export interface GenrePillLayoutElement extends BaseLayoutElement {
  type: "genre-pill";
  genre?: string;
  text?: string;
}

export type BlockLayoutElement =
  | CoverLayoutElement
  | QuoteLayoutElement
  | ImageLayoutElement
  | CodeLayoutElement
  | TagLayoutElement
  | PillMessageLayoutElement
  | GenrePillLayoutElement
  | CustomLayoutElement;

export type BookStatus = "reading" | "read" | "wishlist";

export interface BaseBookItem {
  id: string;
  title: string;
  author: string;
  coverImage: StaticImageData;
  genre?: string;
  genres?: string[];
  status: BookStatus;
  format: BookFormat;
  position?: string; // Grid position e.g. "A1", "A3", "B5"
  layout?: BlockLayoutElement[];
  goodreadsUrl?: string;
  goodreads?: string;
  ticketImage?: StaticImageData;
  country?: string;
  publishedYear?: number;
  firstPublishedYear?: number;
  synopsis?: string | string[];
  availability?: "available" | "taken" | "not for borrowing";
}

export interface CurrentlyReadingPill {
  text: string;
  pill_classnames?: string;
  text_classnames?: string;
}

export interface CurrentlyReadingBook extends BaseBookItem {
  status: "reading";
  progress: number;
  total_pages: number;
  genres?: string[];
  pills?: CurrentlyReadingPill[];
  goodreadsUrl?: string;
  goodreads?: string;
}

export interface ReadBook extends BaseBookItem {
  status: "read";
  rating: number;
  yearRead: number;
  country?: string;
  publishedYear?: number;
  firstPublishedYear?: number;
  ticketImage?: StaticImageData;
  genres?: string[];
  goodreadsUrl?: string;
  goodreads?: string;
  borrowUrl?: string;
  borrowMessage?: string;
}

export interface WishlistBook extends BaseBookItem {
  status: "wishlist";
  amazonUrl?: string; // Direct Amazon product URL
  goodreadsUrl?: string;
  goodreads?: string;
  price?: number;
  priority?: "top" | "high" | "normal" | ""; // "top" = Most Wanted / Top Pick
  note?: string; // 1-line personal note on why you want this book
  isbn?: string;
  isClaimed?: boolean; // Set to true if someone has already gifted this book
  genres?: string[];
}

export type BookItem = CurrentlyReadingBook | ReadBook | WishlistBook;
