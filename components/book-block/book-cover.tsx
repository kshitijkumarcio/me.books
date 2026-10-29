"use client";

import Image from "next/image";
import type { StaticImageData } from "next/image";
import { cn } from "@/lib/utils";
import { parseCellUnit } from "./book-block";
import type { BookFormat } from "@/books/books-index";
import { COVER_FORMAT_SIZES } from "@/books/books-index";

interface BookCoverProps {
  src?: StaticImageData;
  alt: string;
  className?: string;
  rotation?: string;
  widthClass?: string;
  format?: BookFormat;
  id?: string;
}

export const BookCover = ({
  src,
  alt,
  className,
  rotation = "rotate-0",
  widthClass = "w-40",
  format = "standard",
}: BookCoverProps) => {
  if (!src) return null;
  const effectiveWidthClass =
    widthClass || COVER_FORMAT_SIZES[format] || "w-40";
  const cellWidth = parseCellUnit(effectiveWidthClass);

  return (
    <div
      className={cn(
        "group/cover relative cursor-pointer transition-all duration-500 ease-out",
        "hover:z-30 hover:scale-[1.03]",
        rotation,
        className
      )}
    >
      <div
        style={cellWidth ? { width: cellWidth } : undefined}
        className={cn(
          "shadow-book relative overflow-hidden",
          !cellWidth && effectiveWidthClass
        )}
      >
        <Image
          src={src}
          alt={alt}
          draggable={false}
          className={cn("h-auto w-full origin-center object-cover select-none")}
          priority={false}
        />
        {/* Subtle spine glare effect */}
        <div className="pointer-events-none absolute inset-y-0 -left-0.5 w-2 bg-linear-to-r from-black/25 via-white/20 to-transparent" />
        {/* Subtle border outline */}
        <div className="pointer-events-none absolute inset-0 ring-1 ring-black/10 ring-inset" />
      </div>
    </div>
  );
};

export default BookCover;
