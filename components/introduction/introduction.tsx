import { images } from "@/constants";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import FlipTextButton from "../ui-components/flip-text-button";

const Introduction = () => {
  return (
    <div className="pt-cell-2 lg:pt-cell-[1.7] lg:pb-cell w-full">
      <div className="pointer-events-none sticky left-0 w-screen">
        {" "}
        {/* Mobile / Touch View */}
        <div className="block lg:hidden">
          {/* Row 1: BOOKS  YOU  CAN */}
          <div className="relative flex w-dvw items-center justify-between px-4 sm:px-6">
            <p className="font-mona-sans text-[clamp(24px,9vw,44px)] leading-[clamp(24px,10vw,36px)] font-medium text-black uppercase">
              BOOKS
            </p>
            <p className="font-mona-sans text-[clamp(24px,9vw,44px)] leading-[clamp(24px,10vw,44px)] font-medium text-black uppercase">
              YOU
            </p>
            <p className="font-mona-sans text-right text-[clamp(24px,9vw,44px)] leading-[clamp(24px,10vw,44px)] font-medium text-black uppercase">
              CAN
            </p>
          </div>

          {/* Row 2: BORROW  FROM */}
          <div className="mt-4 flex w-dvw items-center justify-between px-4 sm:mt-6 sm:px-6">
            <p className="font-mona-sans text-[clamp(24px,9vw,44px)] leading-[clamp(24px,10vw,44px)] font-medium text-black uppercase">
              BORROW
            </p>
            <p className="font-mona-sans text-right text-[clamp(24px,9vw,44px)] leading-[clamp(24px,10vw,44px)] font-medium text-black uppercase">
              FROM
            </p>
          </div>

          {/* Row 3: (  MY  ) with photo directly underneath */}
          <div className="relative mt-4 flex flex-col items-center justify-center sm:mt-7">
            {/* Parentheses and MY */}
            <div className="relative flex w-cell-4 max-w-[44vw] items-center justify-between select-none">
              <span className="font-mona-sans -ml-3 text-[clamp(24px,9vw,44px)] leading-[clamp(24px,10vw,44px)] font-medium text-black uppercase">
                (
              </span>
              <span className="font-mona-sans absolute left-1/2 -translate-x-1/2 text-[clamp(24px,9vw,44px)] leading-[clamp(24px,10vw,44px)] font-medium text-black uppercase">
                MY
              </span>
              <span className="font-mona-sans -mr-3 text-[clamp(24px,9vw,44px)] leading-[clamp(24px,10vw,44px)] font-medium text-black uppercase">
                )
              </span>
            </div>

            {/* Photo centered directly under MY */}
            <div className="relative -mt-2 sm:-mt-1.5">
              <Image
                src={images.Kshitij}
                alt="kshitijkumar"
                className="aspect-[1.3/1] w-cell-4 max-w-[44vw] object-cover object-top"
                priority
              />
            </div>
          </div>

          {/* Row 4: BOOK  SHELF */}
          <div className="mt-1 flex w-dvw items-center justify-between px-4 sm:mt-8 sm:px-6">
            <p className="font-mona-sans text-[clamp(24px,9vw,44px)] leading-[clamp(24px,10vw,44px)] font-medium text-black uppercase">
              BOOK
            </p>
            <p className="font-mona-sans text-right text-[clamp(24px,9vw,44px)] leading-[clamp(24px,10vw,44px)] font-medium text-black uppercase">
              SHELF
            </p>
          </div>

          {/* Row 5: (move to explore) */}
          <div className="mt-6.5 flex items-center justify-center sm:mt-16">
            <p className="font-mona-sans text-[14px] font-semibold text-black select-none">
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
            <div className="pointer-events-auto">
              <Link href={"#current-reads"} className="block cursor-pointer">
                <FlipTextButton>
                  <p className="font-mona-sans relative text-[14px] font-semibold">
                    (current reads)
                  </p>
                </FlipTextButton>
              </Link>
            </div>
            <div className="absolute left-1/2 flex max-w-120 -translate-x-1/2 items-center justify-center">
              <p className="font-mona-sans relative pl-1.5 text-[14px] font-semibold">
                A small library of books that I have collected so far. Feel free
                to explore and borrow whatever sparks your curiosity!
              </p>
            </div>
            <div className="pointer-events-auto">
              <Link href={"#waitlist"} className="block cursor-pointer">
                <FlipTextButton>
                  <p className="font-mona-sans relative text-[14px] font-semibold">
                    (waitlist)
                  </p>
                </FlipTextButton>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Introduction;
