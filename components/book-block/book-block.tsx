"use client";

import React from "react";
import Image from "next/image";
import type { StaticImageData } from "next/image";
import type {
  BookItem,
  BlockLayoutElement,
  ElementPosition,
} from "@/books/books-index";
import { COVER_FORMAT_SIZES } from "@/books/books-index";
import { BookCover } from "./book-cover";
import { BookQuote } from "./book-quote";
import { cn } from "@/lib/utils";

interface BookBlockProps {
  item?: BookItem;
  book?: BookItem;
  size?: 8 | 6;
  className?: string;
}

/**
 * Resolves cell units into calc(var(--cell-size) * value).
 * Accepts:
 * - numbers: e.g. 5.3 -> calc(var(--cell-size) * 5.3)
 * - cell classes: e.g. "left-cell-5.3", "-top-cell-0.5", "w-cell-[5.3]"
 * - bare number strings: e.g. "5.3", "-2.1"
 */
export function parseCellUnit(
  val: string | number | undefined | null
): string | null {
  if (val === undefined || val === null) return null;
  if (typeof val === "number") {
    return `calc(var(--cell-size) * ${val})`;
  }
  const str = String(val).trim();
  // Match e.g. "left-cell-5.3", "-left-cell-5.3", "top-cell-[5.3]", "w-cell-3.2", etc.
  const match = str.match(
    /^(-)?(?:top|bottom|left|right|w|h|p|m|gap|inset)-cell-(?:\[)?([0-9.]+)(?:\])?$/
  );
  if (match) {
    const isNegative = match[1] === "-";
    const num = parseFloat(match[2]);
    if (!isNaN(num)) {
      return `calc(var(--cell-size) * ${isNegative ? -num : num})`;
    }
  }
  // Match bare numbers in string e.g. "5.3", "-5.3"
  if (/^-?[0-9.]+$/.test(str)) {
    const num = parseFloat(str);
    if (!isNaN(num)) {
      return `calc(var(--cell-size) * ${num})`;
    }
  }
  return null;
}

/** Converts layout positioning (cell values or classes) into CSS styles and classnames */
export function resolveElementPosition(pos: ElementPosition) {
  const classes: string[] = ["absolute"];
  const style: React.CSSProperties = {};

  const sides: ("top" | "bottom" | "left" | "right")[] = [
    "top",
    "bottom",
    "left",
    "right",
  ];
  for (const side of sides) {
    const val = pos[side];
    if (val === undefined || val === null) continue;

    const cellCalc = parseCellUnit(val);
    if (cellCalc) {
      style[side] = cellCalc;
    } else if (typeof val === "string") {
      const trimmed = val.trim();
      if (
        trimmed.startsWith(`${side}-cell-`) ||
        trimmed.startsWith(`-${side}-cell-`) ||
        trimmed.startsWith(`${side}-`) ||
        trimmed.startsWith(`-${side}-`)
      ) {
        classes.push(trimmed);
      } else {
        style[side] = trimmed;
      }
    }
  }

  // width & height if specified on position
  if (pos.width !== undefined && pos.width !== null) {
    const wCalc = parseCellUnit(pos.width);
    if (wCalc) {
      style.width = wCalc;
    } else if (typeof pos.width === "string") {
      if (pos.width.startsWith("w-")) classes.push(pos.width);
      else style.width = pos.width;
    }
  }

  if (pos.height !== undefined && pos.height !== null) {
    const hCalc = parseCellUnit(pos.height);
    if (hCalc) {
      style.height = hCalc;
    } else if (typeof pos.height === "string") {
      if (pos.height.startsWith("h-")) classes.push(pos.height);
      else style.height = pos.height;
    }
  }

  // zIndex
  if (typeof pos.zIndex === "number") {
    style.zIndex = pos.zIndex;
  }

  // rotation
  if (pos.rotation !== undefined && pos.rotation !== null) {
    if (typeof pos.rotation === "number") {
      style.transform = `rotate(${pos.rotation}deg)`;
    } else if (typeof pos.rotation === "string") {
      const rot = pos.rotation.trim();
      const rotMatch = rot.match(/^(-)?rotate-(?:\[)?([0-9.]+)deg?(?:\])?$/);
      if (rotMatch) {
        const sign = rotMatch[1] === "-" ? -1 : 1;
        const deg = parseFloat(rotMatch[2]);
        if (!isNaN(deg)) {
          style.transform = `rotate(${sign * deg}deg)`;
        }
      } else if (rot.startsWith("rotate-") || rot.startsWith("-rotate-")) {
        classes.push(rot);
      } else {
        style.transform = `rotate(${rot})`;
      }
    }
  }

  return { className: classes.join(" "), style };
}

/** Normalizes any layout representation into an element array */
function normalizeLayout(book: BookItem, size: 8 | 6): BlockLayoutElement[] {
  // 1. Array of elements if explicitly provided
  if (Array.isArray(book.layout) && book.layout.length > 0) {
    return book.layout;
  }

  // 2. Default 6x6 layout fallback
  if (size === 6) {
    return [
      {
        type: "cover",
        top: "top-cell-0.5",
        left: "left-cell-0.5",
        rotation: "rotate-0",
        widthClass: "w-40",
        zIndex: 10,
      },
    ];
  }

  // 3. Default 8x8 layout: Cover on top-left, Quote on bottom-right
  const defaultQuote =
    book.status === "wishlist"
      ? `“Wishlist: ${book.title}”`
      : `“${book.title}”`;

  const defaultCoverWidth =
    COVER_FORMAT_SIZES[book.format] || COVER_FORMAT_SIZES.standard;

  return [
    {
      type: "cover",
      top: "top-cell-0.5",
      left: "left-cell-0.5",
      rotation: "rotate-0",
      widthClass: defaultCoverWidth,
      format: book.format,
      zIndex: 10,
    },
    {
      type: "quote",
      quote: defaultQuote,
      author: book.author,
      paperColor: "#FFF27B",
      paperSeed: 42,
      tearStrength: 6,
      bottom: "bottom-cell-0.5",
      right: "right-cell-0.5",
      rotation: "rotate-0",
      maxWidthClass: "max-w-[200px] md:max-w-[280px]",
      zIndex: 20,
    },
  ];
}

/** Renders a single layout element based on its type and positioning */
function renderLayoutElement(
  element: BlockLayoutElement,
  book: BookItem,
  index: number
) {
  const { className: posClass, style: posStyle } =
    resolveElementPosition(element);

  let node: React.ReactNode = null;

  switch (element.type) {
    case "cover": {
      const src = (element.src as StaticImageData) || book.coverImage;
      const format = element.format || book.format;
      node = (
        <BookCover
          src={src}
          id={book.id}
          alt={element.alt || book.title}
          format={format}
          widthClass={element.widthClass}
          rotation={element.rotation || "rotate-0"}
          className={element.className}
        />
      );
      break;
    }

    case "quote": {
      node = (
        <BookQuote
          quote={element.quote || `“${book.title}”`}
          author={element.author || book.author}
          color={element.paperColor || "#FFF27B"}
          textColor={element.textColor || "black"}
          seed={element.paperSeed ?? 42}
          tearStrength={element.tearStrength ?? 6}
          tearFrequency={element.tearFrequency}
          roughness={element.roughness}
          lightAngle={element.lightAngle}
          lightElevation={element.lightElevation}
          rotation={element.rotation || "rotate-0"}
          maxWidthClass={
            element.maxWidthClass || "max-w-[200px] md:max-w-[280px]"
          }
          className={element.className}
        />
      );
      break;
    }

    case "image": {
      const cellWidth = parseCellUnit(element.widthClass);
      node = (
        <div
          style={cellWidth ? { width: cellWidth } : undefined}
          className={cn(
            "relative select-none",
            !cellWidth && (element.widthClass || "w-28 md:w-36"),
            element.className
          )}
        >
          <Image
            src={element.src}
            alt={element.alt || book.title}
            draggable={false}
            className="h-auto w-full object-cover select-none"
          />
        </div>
      );
      break;
    }

    case "code": {
      node = (
        <div
          className={cn(
            "text-neon rounded border border-black/15 bg-neutral-900/90 p-2 font-mono text-[10px] shadow-md backdrop-blur-xs select-none",
            element.className
          )}
        >
          {element.filename && (
            <div className="mb-1 text-[9px] text-neutral-400">
              {element.filename}
            </div>
          )}
          <pre className="overflow-x-auto font-mono leading-tight">
            {element.code}
          </pre>
        </div>
      );
      break;
    }

    case "tag": {
      node = (
        <span
          className={cn(
            "inline-flex items-center rounded-xs border border-black/15 bg-white/95 px-2 py-0.5 font-mono text-[9px] font-bold tracking-wider text-neutral-800 uppercase shadow-xs select-none",
            element.className
          )}
        >
          {element.text}
        </span>
      );
      break;
    }

    case "custom": {
      node = element.content;
      break;
    }

    default:
      node = null;
  }

  return (
    <div
      key={element.id || `layout-el-${element.type}-${index}`}
      style={posStyle}
      className={posClass}
    >
      {node}
    </div>
  );
}

export const BookBlock = ({
  item,
  book: propBook,
  size = 8,
  className,
}: BookBlockProps) => {
  const book = item || propBook;
  if (!book) return null;

  const elements = normalizeLayout(book, size);

  return (
    <div
      className={cn(
        size === 6 ? "w-cell-6 h-cell-6" : "w-cell-8 h-cell-8",
        "relative aspect-square select-none",
        // "border border-red-500",
        className
      )}
    >
      {elements.map((el, i) => renderLayoutElement(el, book, i))}
    </div>
  );
};

export default BookBlock;
