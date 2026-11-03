"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface WishlistProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

const Wishlist = ({ className, ...props }: WishlistProps) => {
  return (
    <div
      id="wishlist"
      className={cn("relative h-dvh", className)}
      {...props}
    >
      <div className="">
        <div className=""></div>
      </div>
    </div>
  );
};

export default Wishlist;
