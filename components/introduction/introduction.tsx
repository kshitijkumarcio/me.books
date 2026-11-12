"use client";

import { images } from "@/constants";
import Image from "next/image";
import React from "react";
import FlipTextButton from "../ui-components/flip-text-button";
import { useCanvasNavigation } from "@/hooks/layout-hooks/usecanvasnavigation";
import { cn } from "@/lib/utils";

export interface NavButtonProps {
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
}: NavButtonProps) => {
  const { scrollToTarget } = useCanvasNavigation();

  const handleClick = () => {
    scrollToTarget(targetId, { duration, lerp, offset });
  };

  return (
    <div className={cn("pointer-events-auto", className)}>
      <button
        type="button"
        onClick={handleClick}
        className="block cursor-pointer border-none bg-transparent p-0 text-left outline-none select-none focus:outline-none focus-visible:outline-none"
      >
        <FlipTextButton>
          {children || (
            <p className="font-mona-sans relative text-[14px] font-semibold">
              {title}
            </p>
          )}
        </FlipTextButton>
      </button>
    </div>
  );
};

export const LinkNav = NavButton;

const Introduction = () => {
  return (
    <div className="pt-cell-2 lg:pt-cell-[1.7] lg:pb-cell-[0.4] w-full">
      <div className="pointer-events-none sticky left-0 w-screen">
        {/* Mobile / Touch View */}
        <div className="pb-cell block lg:hidden">
          {/* Row 1: BOOKS  YOU  CAN */}
          <div className="relative flex w-dvw items-center justify-between px-9">
            <p className="font-mona-sans text-[clamp(24px,8vw,44px)] leading-[130%] font-semibold text-black uppercase">
              BOOKS YOU CAN
              <br />
              BORROW FROM
              <br />
              MY SHELF
            </p>
          </div>

          {/* Photo centered directly under MY */}
          <div className="mt-cell-[0.6] relative flex items-end justify-between px-9">
            <Image
              src={images.Kshitij}
              alt="kshitijkumar"
              className="w-cell-3.5 aspect-[1.3/1] max-w-[44vw] object-cover object-top"
              priority
            />

            <p className="font-mona-sans translate-y-1 text-[14px] font-semibold text-black select-none">
              (move to explore)
            </p>
          </div>
        </div>
        {/* Desktop View */}
        <div className="hidden lg:block">
          <div className="pb-cell-3">
            <div className="flex w-dvw items-center justify-between px-4 lg:px-6">
              <p className="font-mona-sans text-[calc(12px+4dvw)] leading-[calc(12px+5dvw)] font-medium text-black uppercase">
                BOOKS YOU
              </p>
              <p className="font-mona-sans text-right text-[calc(12px+4dvw)] leading-[calc(12px+5dvw)] font-medium text-black uppercase">
                CAN BORROW
              </p>
            </div>
            <div className="relative flex w-dvw items-center justify-between px-4 lg:px-6">
              <p className="font-mona-sans text-[calc(12px+4dvw)] leading-[calc(12px+5dvw)] font-medium text-black uppercase">
                FROM
              </p>
              <div className="absolute left-1/2 flex -translate-x-1/2 items-center justify-center">
                <p className="font-mona-sans text-[calc(12px+4dvw)] leading-[calc(12px+5dvw)] font-medium text-black uppercase">
                  (&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;MY&nbsp;&nbsp;&nbsp;&nbsp;)
                </p>
                <Image
                  src={images.Kshitij}
                  alt="kshitijkumar"
                  className="w-cell-4 absolute top-[80%] left-1/2 aspect-[1.3/1] -translate-x-1/2 object-cover object-top"
                />
              </div>
              <p className="font-mona-sans text-right text-[calc(12px+4dvw)] leading-[calc(12px+5dvw)] font-medium text-black uppercase">
                SHELF
              </p>
            </div>
          </div>

          <div className="mt-cell-[0.4] relative flex items-start justify-between px-4 lg:px-6">
            <NavButton
              title="(current reads)"
              targetId="#current-reads"
              duration={2}
              lerp={1}
              offset={-72}
            />
            <div className="absolute left-1/2 flex max-w-120 -translate-x-1/2 items-center justify-center">
              <p className="font-mona-sans relative pl-1.5 text-[14px] font-semibold">
                My small collection of books. Feel free to explore and borrow
                whatever sparks your curiosity! [Some might not be up for swap!]
              </p>
            </div>
            <NavButton
              title="(wishlist)"
              targetId="#wishlist"
              duration={2.5}
              lerp={1.5}
              offset={-72}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Introduction;
