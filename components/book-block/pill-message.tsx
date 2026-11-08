"use client";

import React from "react";
import { cn } from "@/lib/utils";
import type { ClassValue } from "clsx";

export interface PillMessageProps extends React.HTMLAttributes<HTMLDivElement> {
  text?: React.ReactNode;
  children?: React.ReactNode;
  pill_classnames?: ClassValue;
  text_classnames?: ClassValue;
}

const PillMessage = ({
  text,
  children,
  pill_classnames,
  text_classnames,
  className,
  ...props
}: PillMessageProps) => {
  return (
    <div
      className={cn(
        "inline-flex items-center justify-center rounded-full px-[calc(16px*var(--book-scale))] py-[calc(10px*var(--book-scale))] whitespace-nowrap transition-transform duration-200 select-none",
        pill_classnames,
        className
      )}
      {...props}
    >
      <span
        className={cn(
          "font-mona-sans text-[calc(12px*var(--book-scale))] leading-none font-medium text-white antialiased",
          typeof text_classnames === "string"
            ? text_classnames.replace(
                /text-\[([0-9.]+)px\]/g,
                "text-[calc($1px*var(--book-scale))]"
              )
            : text_classnames
        )}
      >
        {text ?? children}
      </span>
    </div>
  );
};

export default PillMessage;
