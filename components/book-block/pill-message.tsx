"use client";

import React from "react";
import { cn } from "@/lib/utils";
import type { ClassValue } from "clsx";

interface PillMessageProps extends React.HTMLAttributes<HTMLDivElement> {
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
        "inline-flex items-center justify-center rounded-full px-4 py-2.5 whitespace-nowrap transition-transform duration-200 select-none",
        pill_classnames,
        className
      )}
      {...props}
    >
      <span
        className={cn(
          "font-mona-sans text-[12px] leading-none text-white antialiased",
          text_classnames
        )}
      >
        {text ?? children}
      </span>
    </div>
  );
};

export default PillMessage;
