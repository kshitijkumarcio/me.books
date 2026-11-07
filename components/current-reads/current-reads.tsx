"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { currentReads } from "@/books/books-index";
import type { CurrentlyReadingBook } from "@/books/books-index";
import CRBlock from "./cr-block";

export interface CurrentReadsProps {
  books?: CurrentlyReadingBook[];
  className?: string;
}

const CurrentReads = ({
  books = currentReads,
  className,
}: CurrentReadsProps) => {
  // 3 blocks in row 1, 2 blocks in row 2 (placed centrally)
  const row1Books = books.slice(0, 3);
  const row2Books = books.slice(3, 5);

  return (
    <div
      id="current-reads"
      className={cn("mt-cell-2.75 relative min-h-dvh w-full", className)}
    >
      <div className="pointer-events-none sticky left-0 w-screen px-9 lg:px-5">
        <div className="flex w-full items-center justify-between">
          <p className="font-mona-sans text-[calc(12px+4dvw)] leading-[calc(12px+5dvw)] font-medium text-black uppercase">
            (CURRENTLY
          </p>
          <div className="mx-8 h-1 w-full bg-black" />
          <p className="font-mona-sans text-[calc(12px+4dvw)] leading-[calc(12px+5dvw)] font-medium text-black uppercase">
            READING)
          </p>
        </div>

        {/* 3 blocks in row 1, 2 blocks in row 2, placed centrally with 1 cell gaps */}
        <div
          className="mt-cell-0.75 pointer-events-auto flex flex-col items-center justify-center"
          style={{
            rowGap: "calc(var(--cell-size) * 0)",
          }}
        >
          {/* Row 1: 3 blocks */}
          <div
            className="flex flex-row items-end justify-center"
            style={{
              columnGap: "calc(var(--cell-size) * 2)",
            }}
          >
            {row1Books.map((book) => (
              <CRBlock key={book.id} book={book} />
            ))}
          </div>

          {/* Row 2: 2 blocks (placed centrally) */}
          <div
            className="flex flex-row items-end justify-center"
            style={{
              columnGap: "calc(var(--cell-size) * 2)",
            }}
          >
            {row2Books.map((book) => (
              <CRBlock key={book.id} book={book} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurrentReads;
