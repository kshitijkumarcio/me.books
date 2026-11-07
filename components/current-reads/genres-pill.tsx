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
        "genre-pill inline-flex items-center justify-center rounded-lg bg-[#FEFEFE] px-[calc(14px*var(--book-scale))] py-[calc(8px*var(--book-scale))]  shadow-xs select-none whitespace-nowrap transition-transform duration-200 border",
        className
      )}
      {...props}
    >
      <span className="font-mona-sans text-[calc(11px*var(--book-scale))] font-semibold leading-none tracking-tight text-black antialiased">
        {genre}
      </span>
    </div>
  );
};

export default GenrePill;
