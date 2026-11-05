"use client";

import type { CSSProperties } from "react";
import PaperBackground from "@/components/ui-components/paper-background";
import { cn } from "@/lib/utils";
import type { QuoteTextColor } from "@/books/books-index";

interface BookQuoteProps {
  quote: string;
  author?: string;
  color?: string;
  textColor?: QuoteTextColor;
  seed?: number;
  tearStrength?: number;
  tearFrequency?: number;
  roughness?: number;
  lightAngle?: number;
  lightElevation?: number;
  rotation?: string;
  className?: string;
  maxWidthClass?: string;
}

const getTextStyleAndClass = (
  textColor?: string
): { className?: string; style?: CSSProperties } => {
  if (!textColor) return { className: "text-neutral-900" };

  const trimmed = textColor.trim();

  if (trimmed === "white") {
    return { className: "text-white" };
  }
  if (trimmed === "black") {
    return { className: "text-neutral-900" };
  }

  // If provided as a Tailwind class like 'text-[#124356]' or 'text-blue-500'
  if (trimmed.startsWith("text-")) {
    const hexMatch = trimmed.match(/^text-\[(#[0-9a-fA-F]{3,8})\]$/);
    return {
      className: trimmed,
      style: hexMatch ? { color: hexMatch[1] } : undefined,
    };
  }

  // Direct hex or color function: '#124356', 'rgb(...)', 'hsl(...)'
  if (
    trimmed.startsWith("#") ||
    trimmed.startsWith("rgb") ||
    trimmed.startsWith("hsl")
  ) {
    return {
      style: { color: trimmed },
    };
  }

  // Raw hex string without '#': '124356'
  if (/^([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(trimmed)) {
    return {
      style: { color: `#${trimmed}` },
    };
  }

  return {
    className: trimmed,
  };
};

const BookQuote = ({
  quote,
  color = "#FFF27B",
  textColor = "black",
  seed = 42,
  tearStrength = 6,
  tearFrequency = 0.08,
  roughness = 1.5,
  lightAngle = 45,
  lightElevation = 70,
  rotation = "rotate-0",
  className,
  maxWidthClass = "max-w-[260px] md:max-w-[300px]",
}: BookQuoteProps) => {
  const { className: textClass, style: textStyle } =
    getTextStyleAndClass(textColor);

  return (
    <div className={cn("relative select-none", rotation, className)}>
      <div className={cn("relative px-2.5 py-2.5", maxWidthClass)}>
        <p
          className={cn(
            "font-mona-sans relative z-10 text-[12px] leading-snug font-semibold italic",
            textClass
          )}
          style={textStyle}
        >
          {quote}
        </p>

        <PaperBackground
          color={color}
          seed={seed}
          tearStrength={tearStrength}
          tearFrequency={tearFrequency}
          roughness={roughness}
          lightAngle={lightAngle}
          lightElevation={lightElevation}
        />
      </div>
    </div>
  );
};

export default BookQuote;
