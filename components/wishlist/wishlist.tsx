"use client";

import { cn } from "@/lib/utils";

const Wishlist = () => {
  return (
    <div id="wishlist" className={cn("mt-cell-[1.7] relative h-dvh w-full")}>
      <div className="pointer-events-none sticky left-0 w-screen px-9 lg:px-5">
        <div className="flex w-full items-center justify-between">
          <p className="font-mona-sans text-[calc(12px+4dvw)] leading-[calc(12px+5dvw)] font-medium text-black uppercase">
            (WISHLIST
          </p>
          <div className="mx-8 h-1 w-full bg-black" />
          <p className="font-mona-sans text-[calc(12px+4dvw)] leading-[calc(12px+5dvw)] -translate-y-1 font-medium text-black lowercase">
            muhehe)
          </p>
        </div>

        <div className="">
          {/* here we will insert the wishlist grid, which will take the same number of columns as the dynamically columns taken by BooksRead Grid, so we match the width of the page */}

          {/* create such WishListBlock, we will decide the components in it later, but for now add a book cover, and keep the brick layout in the grid */}
        </div>
      </div>
    </div>
  );
};

export default Wishlist;
