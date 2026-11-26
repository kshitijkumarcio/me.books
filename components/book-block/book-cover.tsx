"use client";

import { useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PrefetchKind } from "next/dist/client/components/router-reducer/router-reducer-types";
import type { StaticImageData } from "next/image";
import { cn } from "@/lib/utils";
import { parseCellUnit } from "./book-block-utils";
import type { BookFormat } from "@/books/books-index";
import {
  COVER_FORMAT_SIZES,
  getReadBookById,
  getCurrentReadBookById,
  getWishlistBookById,
} from "@/books/books-index";
import { useReadBookModal } from "@/hooks/layout-hooks/use-read-book-modal";

interface BookCoverProps {
  src?: StaticImageData;
  alt: string;
  className?: string;
  rotation?: string;
  widthClass?: string;
  format?: BookFormat;
  id?: string;
  href?: string;
}

const BookCover = ({
  src,
  alt,
  className,
  rotation = "rotate-0",
  widthClass = "w-40",
  format = "standard",
  id,
  href,
}: BookCoverProps) => {
  const router = useRouter();
  const {
    openModal,
    startCoverTransition,
    activeBookId,
    transitionPhase,
    isCoverLayerPainted,
  } = useReadBookModal();
  const coverInnerRef = useRef<HTMLDivElement>(null);

  const effectiveId =
    id ||
    (href ? href.split("/").filter(Boolean).pop()?.split("?")[0] : undefined);

  // Stay visible during the first frame of "entering" until the transition layer paints,
  // then stay hidden continuously through "entered" and "exiting".
  const isTransitioningCurrent = Boolean(
    effectiveId &&
      activeBookId === effectiveId &&
      (transitionPhase === "entered" ||
        transitionPhase === "exiting" ||
        (transitionPhase === "entering" && isCoverLayerPainted))
  );

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
        return; // Allow new tab navigation
      }
      if (!href) return;
      e.preventDefault();

      const el = coverInnerRef.current;
      const rect = el?.getBoundingClientRect();
      const bookId = effectiveId;

      if (rect && bookId && src && el) {
        // The clicked book cover in the grid is hovered at scale 1.1
        // We compute its true 1.0 resting dimensions and position:
        const HOVER_SCALE = 1.1;
        const restingWidth = rect.width / HOVER_SCALE;
        const restingHeight = rect.height / HOVER_SCALE;
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const restingRect = {
          top: centerY - restingHeight / 2,
          left: centerX - restingWidth / 2,
          width: restingWidth,
          height: restingHeight,
        };

        // Grab the exact already-decoded URL from the grid <img>
        const imgEl = el.querySelector("img");
        const coverResolvedSrc = imgEl?.currentSrc || imgEl?.src || undefined;

        // DO NOT set el.style.visibility = "hidden" here—let isTransitioningCurrent handle it
        // once SharedBookCoverTransitionLayer confirms its first paint.
        startCoverTransition({
          bookId,
          initialRect: {
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
          },
          restingRect,
          coverImage: src,
          coverResolvedSrc,
          coverAlt: alt,
          format,
          rotation,
        });
      }

      if (href.includes("/read/")) {
        const readId = id || href.split("/read/")[1]?.split("?")[0];
        const book = getReadBookById(readId);
        if (book) {
          openModal({ type: "read", book, href });
          router.push(href, { scroll: false });
          return;
        }
      } else if (href.includes("/reading/")) {
        const readingId = id || href.split("/reading/")[1]?.split("?")[0];
        const book = getCurrentReadBookById(readingId);
        if (book) {
          openModal({ type: "reading", book, href });
          router.push(href, { scroll: false });
          return;
        }
      } else if (href.includes("/wishlist/")) {
        const wishlistId = id || href.split("/wishlist/")[1]?.split("?")[0];
        const book = getWishlistBookById(wishlistId);
        if (book) {
          openModal({ type: "wishlist", book, href });
          router.push(href, { scroll: false });
          return;
        }
      }

      router.push(href, { scroll: false });
    },
    [
      alt,
      effectiveId,
      format,
      href,
      id,
      openModal,
      rotation,
      router,
      src,
      startCoverTransition,
    ]
  );

  if (!src) return null;
  const effectiveWidthClass =
    widthClass || COVER_FORMAT_SIZES[format] || "w-40";
  const cellWidth = parseCellUnit(effectiveWidthClass);

  const content = (
    <div
      className={cn(
        "group/cover relative cursor-pointer transition-all duration-500 ease-out",
        "hover:z-30 hover:scale-[1.1]",
        rotation,
        className
      )}
    >
      <div
        ref={coverInnerRef}
        data-book-id={effectiveId}
        style={{
          ...(cellWidth ? { width: cellWidth } : {}),
          visibility: isTransitioningCurrent ? "hidden" : "visible",
          opacity: isTransitioningCurrent ? 0 : 1,
        }}
        className={cn(
          "shadow-book relative overflow-hidden",
          !cellWidth && effectiveWidthClass
        )}
      >
        <Image
          src={src}
          alt={alt}
          draggable={false}
          priority
          sizes="(min-width: 1024px) 240px, 200px"
          className={cn("h-auto w-full origin-center object-cover select-none")}
        />
        {/* Subtle spine glare effect */}
        <div className="pointer-events-none absolute inset-y-0 -left-0.5 w-[calc(8px*var(--book-scale))] bg-linear-to-r from-black/25 via-white/20 to-transparent" />
        {/* Subtle border outline */}
        <div className="pointer-events-none absolute inset-0 ring-1 ring-black/10 ring-inset" />
      </div>
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        scroll={false}
        prefetch={true}
        onClick={handleClick}
        onMouseEnter={() => {
          try {
            router.prefetch(href, { kind: PrefetchKind.FULL });
          } catch {
            router.prefetch(href);
          }
        }}
        onPointerDown={() => {
          try {
            router.prefetch(href, { kind: PrefetchKind.FULL });
          } catch {
            router.prefetch(href);
          }
        }}
        className="inline-block ring-transparent outline-none focus:ring-0 focus:ring-transparent focus:outline-none focus-visible:ring-0 focus-visible:ring-transparent focus-visible:outline-none"
      >
        {content}
      </Link>
    );
  }

  return content;
};

export default BookCover;
