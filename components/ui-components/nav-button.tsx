"use client";

import React from "react";
import FlipTextButton from "./flip-text-button";
import { useCanvasNavigation } from "@/hooks/layout-hooks/usecanvasnavigation";
import { cn } from "@/lib/utils";

export interface NavButtonProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "title"
> {
  title?: string;
  targetId: string;
  duration?: number;
  lerp?: number;
  offset?: number;
  className?: string;
  children?: React.ReactNode;
}

export type LinkNavProps = NavButtonProps;

export const NavButton = ({
  title,
  targetId,
  duration,
  lerp,
  offset,
  className,
  children,
  onClick,
  ...props
}: NavButtonProps) => {
  const { scrollToTarget } = useCanvasNavigation();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(e);
    if (!e.defaultPrevented) {
      scrollToTarget(targetId, { duration, lerp, offset });
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        "pointer-events-auto cursor-pointer outline-none select-none",
        className ??
          "block border-none bg-transparent p-0 text-left focus:outline-none focus-visible:outline-none"
      )}
      {...props}
    >
      <FlipTextButton>
        {children || (
          <p className="font-mona-sans relative text-[14px] font-semibold">
            {title}
          </p>
        )}
      </FlipTextButton>
    </button>
  );
};

export const LinkNav = NavButton;
