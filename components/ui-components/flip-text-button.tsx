"use client";

import {
  useState,
  useMemo,
  useRef,
  useEffect,
  isValidElement,
  cloneElement,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from "react";
import { motion, type Variants } from "motion/react";

import { cn } from "@/lib/utils";
import { easing016 } from "@/constants";
import { useMediaQuery } from "@/hooks/ui-hooks/use-media-query";

export interface FlipTextButtonProps extends ComponentPropsWithoutRef<"div"> {
  children: ReactNode;
  /**
   * Optional text or element to show when hovered.
   * If omitted, `children` is used for both resting and hover states.
   */
  hoverText?: ReactNode;
  /** Optional controlled hover state override */
  isHovered?: boolean;
  /** @deprecated Use `isHovered` instead */
  propHovered?: boolean;
  /** Duration of each letter's transition in seconds (defaults to 0.7) */
  duration?: number;
  /** Delay between each consecutive letter in seconds (defaults to 0.01) */
  stagger?: number;
}

function getTextFromChildren(children: ReactNode): string {
  if (typeof children === "string") return children;
  if (typeof children === "number") return children.toString();
  if (Array.isArray(children))
    return children.map(getTextFromChildren).join("");
  if (
    isValidElement(children) &&
    children.props &&
    typeof children.props === "object" &&
    "children" in children.props
  ) {
    return getTextFromChildren(
      (children.props as { children?: ReactNode }).children
    );
  }
  return "";
}

const FlipTextButton = ({
  children,
  hoverText,
  isHovered,
  propHovered,
  duration = 0.7,
  stagger = 0.01,
  className,
  onPointerEnter,
  onPointerLeave,
  onClick,
  ...props
}: FlipTextButtonProps) => {
  const [internalHovered, setInternalHovered] = useState<boolean>(false);
  const [isClickLocked, setIsClickLocked] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useMediaQuery("(max-width: 841px)");

  const baseHovered = propHovered ?? isHovered ?? internalHovered;
  const activeHovered = baseHovered && !isClickLocked;

  useEffect(() => {
    // If hover is controlled via props, skip DOM listeners
    if (isHovered !== undefined || propHovered !== undefined) return;

    const el = containerRef.current;
    if (!el) return;

    // Automatically bind to the closest interactive parent container if one exists
    const interactiveTarget =
      el.closest<HTMLElement>(".cursor-pointer, [role='button'], button, a") ??
      el;

    const handleEnter = () => {
      setIsClickLocked(false);
      setInternalHovered(true);
    };

    const handleLeave = () => {
      setIsClickLocked(false);
      setInternalHovered(false);
    };

    const handleClick = () => {
      if (hoverText) {
        setIsClickLocked(true);
      }
    };

    interactiveTarget.addEventListener("pointerenter", handleEnter);
    interactiveTarget.addEventListener("pointerleave", handleLeave);
    interactiveTarget.addEventListener("click", handleClick);

    return () => {
      interactiveTarget.removeEventListener("pointerenter", handleEnter);
      interactiveTarget.removeEventListener("pointerleave", handleLeave);
      interactiveTarget.removeEventListener("click", handleClick);
    };
  }, [isHovered, propHovered, hoverText]);

  const animDuration = isClickLocked ? 0 : duration;
  const animStagger = isClickLocked ? 0 : stagger;

  const variants = useMemo<{ primary: Variants; secondary: Variants }>(
    () => ({
      primary: {
        initial: (i: number) => ({
          y: "0%",
          transition: {
            duration: animDuration,
            ease: easing016,
            delay: i * animStagger,
          },
        }),
        hovered: (i: number) => ({
          y: "-100%",
          transition: {
            duration: animDuration,
            ease: easing016,
            delay: i * animStagger,
          },
        }),
      },
      secondary: {
        initial: (i: number) => ({
          y: "100%",
          transition: {
            duration: animDuration,
            ease: easing016,
            delay: i * animStagger,
          },
        }),
        hovered: (i: number) => ({
          y: "0%",
          transition: {
            duration: animDuration,
            ease: easing016,
            delay: i * animStagger,
          },
        }),
      },
    }),
    [animDuration, animStagger]
  );

  if (isMobile) {
    return (
      <div
        className={cn("inline-flex items-center justify-center", className)}
        {...props}
      >
        {children}
      </div>
    );
  }

  const rawPrimaryText = getTextFromChildren(children);
  const rawSecondaryText = hoverText
    ? getTextFromChildren(hoverText)
    : rawPrimaryText;

  // If children has no text content (e.g. an icon or empty), render with default block animation
  if (!rawPrimaryText) {
    return (
      <div
        ref={containerRef}
        onPointerEnter={(e) => {
          setInternalHovered(true);
          onPointerEnter?.(e);
        }}
        onPointerLeave={(e) => {
          setInternalHovered(false);
          onPointerLeave?.(e);
        }}
        className={cn("relative inline-flex overflow-hidden", className)}
        {...props}
      >
        <motion.div
          initial="initial"
          animate={activeHovered ? "hovered" : "initial"}
          variants={{
            initial: { y: "0%", transition: { duration, ease: easing016 } },
            hovered: { y: "-100%", transition: { duration, ease: easing016 } },
          }}
          className="inline-flex items-center justify-center"
        >
          {children}
        </motion.div>
        <motion.div
          aria-hidden="true"
          initial="initial"
          animate={activeHovered ? "hovered" : "initial"}
          variants={{
            initial: { y: "100%", transition: { duration, ease: easing016 } },
            hovered: { y: "0%", transition: { duration, ease: easing016 } },
          }}
          className="pointer-events-none absolute inset-0 inline-flex items-center justify-center select-none"
        >
          {hoverText || children}
        </motion.div>
      </div>
    );
  }

  // Helper to render letter-by-letter staggered spans
  const renderStaggered = (
    text: string,
    variantType: "primary" | "secondary"
  ) => {
    let globalCharIndex = 0;
    const words = text.split(" ");

    return words.map((word, wordIndex) => {
      const letters = word.split("");
      const isLastWord = wordIndex === words.length - 1;

      return (
        <span
          key={wordIndex}
          className="inline-flex leading-[120%] whitespace-nowrap"
        >
          {letters.map((char, letterIndex) => {
            const charIndex = globalCharIndex++;
            return (
              <span
                key={letterIndex}
                className="relative inline-flex overflow-hidden leading-[120%]"
              >
                <motion.span
                  custom={charIndex}
                  initial="initial"
                  animate={activeHovered ? "hovered" : "initial"}
                  variants={variants[variantType]}
                  className="inline-block leading-[120%]"
                >
                  {char}
                </motion.span>
              </span>
            );
          })}

          {!isLastWord &&
            (() => {
              const spaceIndex = globalCharIndex++;
              return (
                <span
                  key={`space-${wordIndex}`}
                  className="relative inline-flex overflow-hidden leading-[120%]"
                >
                  <motion.span
                    custom={spaceIndex}
                    initial="initial"
                    animate={activeHovered ? "hovered" : "initial"}
                    variants={variants[variantType]}
                    className="inline-block leading-[120%]"
                  >
                    &nbsp;
                  </motion.span>
                </span>
              );
            })()}
        </span>
      );
    });
  };

  const primaryRendered = renderStaggered(rawPrimaryText, "primary");
  const secondaryRendered = renderStaggered(rawSecondaryText, "secondary");

  const wrappedPrimaryContent = isValidElement<
    React.HTMLAttributes<HTMLElement>
  >(children) ? (
    cloneElement(
      children,
      {
        ...(children.props as Record<string, unknown>),
        className: cn(
          "leading-[120%]",
          (children.props as { className?: string })?.className,
          "leading-[120%]"
        ),
        "aria-label": rawPrimaryText,
      },
      primaryRendered
    )
  ) : (
    <span aria-label={rawPrimaryText} className="inline-flex leading-[120%]">
      {primaryRendered}
    </span>
  );

  const wrappedSecondaryContent =
    hoverText &&
    isValidElement<React.HTMLAttributes<HTMLElement>>(hoverText) ? (
      cloneElement(
        hoverText,
        {
          ...(hoverText.props as Record<string, unknown>),
          className: cn(
            "leading-[120%]",
            (hoverText.props as { className?: string })?.className,
            "leading-[120%]"
          ),
          "aria-label": rawSecondaryText,
        },
        secondaryRendered
      )
    ) : isValidElement<React.HTMLAttributes<HTMLElement>>(children) ? (
      cloneElement(
        children,
        {
          ...(children.props as Record<string, unknown>),
          className: cn(
            "leading-[120%]",
            (children.props as { className?: string })?.className,
            "leading-[120%]"
          ),
          "aria-label": rawSecondaryText,
        },
        secondaryRendered
      )
    ) : (
      <span
        aria-label={rawSecondaryText}
        className="inline-flex leading-[120%]"
      >
        {secondaryRendered}
      </span>
    );

  return (
    <div
      ref={containerRef}
      onPointerEnter={(e) => {
        setIsClickLocked(false);
        setInternalHovered(true);
        onPointerEnter?.(e);
      }}
      onPointerLeave={(e) => {
        setIsClickLocked(false);
        setInternalHovered(false);
        onPointerLeave?.(e);
      }}
      onClick={(e) => {
        if (hoverText) {
          setIsClickLocked(true);
        }
        onClick?.(e);
      }}
      className={cn(
        "relative inline-grid grid-cols-1 grid-rows-1 items-center justify-items-center overflow-hidden leading-[120%]",
        className
      )}
      {...props}
    >
      {/* Primary resting layer */}
      <div className="col-start-1 row-start-1 inline-flex items-center justify-center leading-[120%]">
        {wrappedPrimaryContent}
      </div>

      {/* Secondary hovered layer */}
      <div
        aria-hidden="true"
        className="pointer-events-none col-start-1 row-start-1 inline-flex items-center justify-center leading-[120%] select-none"
      >
        {wrappedSecondaryContent}
      </div>
    </div>
  );
};

export default FlipTextButton;
