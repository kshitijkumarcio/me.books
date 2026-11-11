"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import type { StaticImageData } from "next/image";
import { AnimatePresence, useMotionValue, useSpring } from "motion/react";
import type { BookItem, BlockLayoutElement } from "@/books/books-index";
import BookCover from "./book-cover";
import BookQuote from "./book-quote";
import PillMessage from "./pill-message";
import GenrePill from "@/components/current-reads/genres-pill";
import ShelfBookHoverCard from "@/components/shelf-grid/shelf-book-hover-card";
import { cn } from "@/lib/utils";
import {
  parseCellUnit,
  resolveElementPosition,
  normalizeLayout,
} from "./book-block-utils";

export { parseCellUnit, resolveElementPosition };

interface BookBlockProps {
  item?: BookItem;
  book?: BookItem;
  size?: 8 | 6;
  className?: string;
}

/** Renders a single layout element based on its type and positioning */
const renderLayoutElement = (
  element: BlockLayoutElement,
  book: BookItem,
  index: number
) => {
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
          href={book.status === "read" ? `/read/${book.id}` : undefined}
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
          maxWidthClass={element.maxWidthClass || "max-w-[280px]"}
          className={element.className}
        />
      );
      break;
    }

    case "image": {
      const cellWidth = parseCellUnit(element.widthClass || "w-36");
      node = (
        <div
          style={cellWidth ? { width: cellWidth } : undefined}
          className={cn(
            "relative select-none",
            // "border-8 border-b-12 border-[#f0ebd8]",
            !cellWidth && (element.widthClass || "w-36"),
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
            "text-neon rounded border border-black/15 bg-neutral-900/90 p-[calc(8px*var(--book-scale))] font-mono text-[calc(10px*var(--book-scale))] shadow-md backdrop-blur-xs select-none",
            element.className
          )}
        >
          {element.filename && (
            <div className="mb-1 text-[calc(9px*var(--book-scale))] text-neutral-400">
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
            "inline-flex items-center rounded-xs border border-black/15 bg-white/95 px-[calc(8px*var(--book-scale))] py-[calc(2px*var(--book-scale))] font-mono text-[calc(9px*var(--book-scale))] font-bold tracking-wider text-neutral-800 uppercase shadow-xs select-none",
            element.className
          )}
        >
          {element.text}
        </span>
      );
      break;
    }

    case "pill-message": {
      node = (
        <PillMessage
          text={element.text}
          pill_classnames={element.pill_classnames}
          text_classnames={element.text_classnames}
          className={element.className}
        />
      );
      break;
    }

    case "genre-pill": {
      node = (
        <GenrePill
          genre={
            element.genre ||
            (typeof element.text === "string" ? element.text : "")
          }
          className={element.className}
        />
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
};

const BookBlock = ({
  item,
  book: propBook,
  size = 8,
  className,
}: BookBlockProps) => {
  const book = item || propBook;
  const [isHovered, setIsHovered] = useState(false);
  const blockRef = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, {
    damping: 60,
    stiffness: 300,
    mass: 0.5,
  });
  const springY = useSpring(mouseY, {
    damping: 60,
    stiffness: 300,
    mass: 0.5,
  });

  const OFFSET_X = 40;
  const OFFSET_Y = 40;

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    if (blockRef.current) {
      const rect = blockRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left + OFFSET_X;
      const y = e.clientY - rect.top + OFFSET_Y;
      mouseX.set(x);
      mouseY.set(y);
      springX.jump(x);
      springY.jump(y);
    }
    setIsHovered(true);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (blockRef.current) {
      const rect = blockRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left + OFFSET_X;
      const y = e.clientY - rect.top + OFFSET_Y;
      if (!isHovered) {
        mouseX.set(x);
        mouseY.set(y);
        springX.jump(x);
        springY.jump(y);
        setIsHovered(true);
      } else {
        mouseX.set(x);
        mouseY.set(y);
      }
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  if (!book) return null;

  const elements = normalizeLayout(book, size);

  return (
    <div
      ref={blockRef}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn(
        size === 6 ? "w-cell-6 h-cell-6" : "w-cell-8 h-cell-8",
        "relative aspect-square select-none",
        isHovered && "z-50",
        className
      )}
    >
      {elements.map((el, i) => renderLayoutElement(el, book, i))}

      <AnimatePresence>
        {isHovered && (
          <ShelfBookHoverCard book={book} x={springX} y={springY} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default BookBlock;
