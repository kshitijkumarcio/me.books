"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface GenrePillProps extends React.HTMLAttributes<HTMLDivElement> {
  genre: string;
  className?: string;
}

export const GenrePill = ({ genre, className, ...props }: GenrePillProps) => {
  if (!genre) return null;

  return (
    <div
      className={cn(
        "genre-pill inline-flex items-center justify-center rounded-lg border bg-[#FEFEFE] px-[calc(14px*var(--book-scale))] py-[calc(8px*var(--book-scale))] whitespace-nowrap shadow-xs transition-transform duration-200 select-none",
        className
      )}
      {...props}
    >
      <span className="font-mona-sans text-[calc(11px*var(--book-scale))] leading-none font-semibold tracking-tight text-black antialiased">
        {genre}
      </span>
    </div>
  );
};

export default GenrePill;
