"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { easing016 } from "@/constants";
import icons from "@/constants/icons";
import { AmazonIcon } from "./icons";
import FlipTextButton from "../ui-components/flip-text-button";

interface BookModalBottomButtonsProps {
  isWishlistRoute: boolean;
  isReadingRoute: boolean;
  wishlistAmazonUrl: string;
  wishlistGoodreadsUrl: string;
  crGoodreadsUrl: string;
  borrowUrl: string;
  readGoodreadsUrl: string;
}

export const BookModalBottomButtons = ({
  isWishlistRoute,
  isReadingRoute,
  wishlistAmazonUrl,
  wishlistGoodreadsUrl,
  crGoodreadsUrl,
  borrowUrl,
  readGoodreadsUrl,
}: BookModalBottomButtonsProps) => {
  if (isWishlistRoute) {
    return (
      <motion.div
        key="wishlist-bottom-buttons"
        initial={{ opacity: 0 }}
        animate={{
          opacity: 1,
          transition: { duration: 0.3, ease: easing016 },
        }}
        exit={{
          opacity: 0,
          transition: { duration: 0.3, delay: 0.2, ease: easing016 },
        }}
        className="flex items-center justify-center gap-x-3"
      >
        {/* first button: Amazon */}
        <a
          href={wishlistAmazonUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group/ab pointer-events-auto flex cursor-pointer gap-x-1"
        >
          <div className="flex aspect-square w-10 items-center justify-center rounded-sm bg-black">
            <Image
              src={icons.AmazonIcon}
              alt="amazon icon"
              className="h-5 w-5 bg-blend-difference filter"
            />
          </div>
          <div className="flex h-10 items-center justify-center rounded-sm bg-black px-4">
            <FlipTextButton>
              <p className="font-mona-sans text-[14px] font-semibold text-white">
                Amazon
              </p>
            </FlipTextButton>
          </div>
        </a>

        {/* second button: Goodreads */}
        <a
          href={wishlistGoodreadsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group/gb pointer-events-auto flex cursor-pointer gap-x-1"
        >
          <div className="group-hover/gb:bg-neon flex aspect-square w-10 items-center justify-center rounded-sm border border-black bg-white transition-colors duration-200">
            <Image
              src={icons.GoodreadsIcon}
              alt="goodreads"
              width={20}
              height={20}
              className="h-4.5 w-4.5 object-contain"
            />
          </div>
          <div className="group-hover/gb:bg-neon flex h-10 items-center justify-center rounded-sm border border-black bg-white px-4 transition-colors duration-200">
            <FlipTextButton>
              <p className="font-mona-sans text-[14px] font-semibold text-black">
                Goodreads
              </p>
            </FlipTextButton>
          </div>
        </a>
      </motion.div>
    );
  }

  if (isReadingRoute) {
    return (
      <motion.div
        key="cr-bottom-buttons"
        initial={{ opacity: 0 }}
        animate={{
          opacity: 1,
          transition: { duration: 0.3, ease: easing016 },
        }}
        exit={{
          opacity: 0,
          transition: { duration: 0.3, delay: 0.2, ease: easing016 },
        }}
        className="flex items-center justify-center gap-x-3"
      >
        {/* Single button: Goodreads */}
        <a
          href={crGoodreadsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group/gb pointer-events-auto flex cursor-pointer gap-x-1"
        >
          <div className="group-hover/gb:bg-neon flex aspect-square w-10 items-center justify-center rounded-sm border border-black bg-white transition-colors duration-200">
            <Image
              src={icons.GoodreadsIcon}
              alt="goodreads"
              width={20}
              height={20}
              className="h-4.5 w-4.5 object-contain"
            />
          </div>
          <div className="group-hover/gb:bg-neon flex h-10 items-center justify-center rounded-sm border border-black bg-white px-4 transition-colors duration-200">
            <FlipTextButton>
              <p className="font-mona-sans text-[14px] font-semibold text-black">
                Goodreads
              </p>
            </FlipTextButton>
          </div>
        </a>
      </motion.div>
    );
  }

  return (
    <motion.div
      key="book-bottom-buttons"
      initial={{ opacity: 0 }}
      animate={{
        opacity: 1,
        transition: { duration: 0.3, ease: easing016 },
      }}
      exit={{
        opacity: 0,
        transition: { duration: 0.3, delay: 0.2, ease: easing016 },
      }}
      className="flex items-center justify-center gap-x-3"
    >
      {/* first button: borrow this book */}
      <a
        href={borrowUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group/bb pointer-events-auto flex cursor-pointer gap-x-1"
      >
        <div className="flex aspect-square w-10 items-center justify-center rounded-sm bg-black">
          <Image
            src={icons.WhatsappIcon}
            alt="whatsapp"
            width={20}
            height={20}
            className="h-4.5 w-4.5 object-contain"
          />
        </div>
        <div className="flex h-10 items-center justify-center rounded-sm bg-black px-4">
          <FlipTextButton>
            <p className="font-mona-sans text-[14px] font-semibold text-white">
              Borrow this book
            </p>
          </FlipTextButton>
        </div>
      </a>

      {/* second button: Goodreads */}
      <a
        href={readGoodreadsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group/gb pointer-events-auto flex cursor-pointer gap-x-1"
      >
        <div className="group-hover/gb:bg-neon flex aspect-square w-10 items-center justify-center rounded-sm border border-black bg-white transition-colors duration-200">
          <Image
            src={icons.GoodreadsIcon}
            alt="goodreads"
            width={20}
            height={20}
            className="h-4.5 w-4.5 object-contain"
          />
        </div>
        <div className="group-hover/gb:bg-neon flex h-10 items-center justify-center rounded-sm border border-black bg-white px-4 transition-colors duration-200">
          <FlipTextButton>
            <p className="font-mona-sans text-[14px] font-semibold text-black">
              Goodreads
            </p>
          </FlipTextButton>
        </div>
      </a>
    </motion.div>
  );
};
