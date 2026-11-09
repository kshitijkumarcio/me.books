import React from "react";
import type {
  BookItem,
  BlockLayoutElement,
  ElementPosition,
} from "@/books/books-index";
import { COVER_FORMAT_SIZES } from "@/books/books-index";

/**
 * Resolves cell units or Tailwind size classes into calc(var(--cell-size) * ...),
 * scaling them proportionally with the grid size (60px on >=768px, 40px on <768px).
 */
export const parseCellUnit = (
  val: string | number | undefined | null
): string | null => {
  if (val === undefined || val === null) return null;
  if (typeof val === "number") {
    return `calc(var(--cell-size) * ${val})`;
  }
  const str = String(val).trim();
  if (!str) return null;

  if (str.startsWith("calc(")) {
    return str;
  }

  // 1. Explicit cell units: e.g. "top-cell-0.5", "w-cell-[2.5]", "-left-cell-1.5"
  const cellMatch = str.match(
    /^(-)?(?:top|bottom|left|right|w|h|p|m|gap|inset)-cell-(?:\[)?([0-9.]+)(?:\])?$/
  );
  if (cellMatch) {
    const isNegative = cellMatch[1] === "-";
    const num = parseFloat(cellMatch[2]);
    if (!isNaN(num)) {
      return `calc(var(--cell-size) * ${isNegative ? -num : num})`;
    }
  }

  // 2. Pure numbers as string: e.g. "0.5", "2", "-1.5"
  if (/^-?[0-9.]+$/.test(str)) {
    const num = parseFloat(str);
    if (!isNaN(num)) {
      return `calc(var(--cell-size) * ${num})`;
    }
  }

  // 3. Composite with md: prefix (e.g. "max-w-[200px] md:max-w-[280px]" or "w-28 md:w-36")
  if (str.includes("md:")) {
    const mdPxMatch = str.match(/md:(?:max-)?(?:w|h)-\[([0-9.]+)px\]/);
    if (mdPxMatch) {
      const px = parseFloat(mdPxMatch[1]);
      if (!isNaN(px)) {
        return `calc(var(--cell-size) * ${px} / 60)`;
      }
    }
    const mdNumMatch = str.match(/md:(?:max-)?(?:w|h)-([0-9.]+)/);
    if (mdNumMatch) {
      const num = parseFloat(mdNumMatch[1]);
      if (!isNaN(num)) {
        return `calc(var(--cell-size) * ${num * 4} / 60)`;
      }
    }
  }

  // 4. Arbitrary pixel sizes: e.g. "w-[160px]", "max-w-[280px]", "top-[10px]"
  const pxMatch = str.match(
    /^(-)?(?:max-)?(?:w|h|top|bottom|left|right)-\[([0-9.]+)px\]$/
  );
  if (pxMatch) {
    const isNegative = pxMatch[1] === "-";
    const px = parseFloat(pxMatch[2]);
    if (!isNaN(px)) {
      return `calc(var(--cell-size) * ${isNegative ? -px : px} / 60)`;
    }
  }

  // 5. Standard Tailwind spacing / sizing: e.g. "w-40", "w-36", "w-39.5", "max-w-62", "top-4"
  const tailwindMatch = str.match(
    /^(-)?(?:max-)?(?:w|h|top|bottom|left|right)-([0-9.]+)$/
  );
  if (tailwindMatch) {
    const isNegative = tailwindMatch[1] === "-";
    const num = parseFloat(tailwindMatch[2]);
    if (!isNaN(num)) {
      const desktopPx = num * 4;
      return `calc(var(--cell-size) * ${isNegative ? -desktopPx : desktopPx} / 60)`;
    }
  }

  return null;
};

/** Converts layout positioning into CSS styles and classnames */
export const resolveElementPosition = (pos: ElementPosition) => {
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

  if (typeof pos.zIndex === "number") {
    style.zIndex = pos.zIndex;
  }

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
};

/** Normalizes any layout representation into an element array */
export const normalizeLayout = (
  book: BookItem,
  size: 8 | 6
): BlockLayoutElement[] => {
  if (Array.isArray(book.layout) && book.layout.length > 0) {
    return book.layout;
  }

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
      zIndex: 10,
    },
    {
      type: "quote",
      quote: defaultQuote,
      top: "top-cell-5",
      left: "left-cell-0.5",
      paperColor: "#FFF27B",
      zIndex: 20,
    },
  ];
};
