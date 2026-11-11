```tsx
"use client";

import { motion } from "motion/react";
import { useMediaQuery } from "@/hooks/ui-hooks/use-media-query";
import { TransitionScreenProps } from "../types";

const itemRevealVariants = {
  initial: {
    y: "105%",
    opacity: 0,
  },
  animate: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.6,
      delay: 0.4,
      ease: [0.65, 0, 0.35, 1] as const,
    },
  },
  exit: {
    y: "105%",
    opacity: 0,
    transition: {
      duration: 0.4,
      ease: [0.65, 0, 0.35, 1] as const,
    },
  },
};

export function DefaultLettersTransition({
  progress,
  targetSlug,
}: TransitionScreenProps) {
  const isMobile = useMediaQuery("(max-width: 641px)");

  return (
    <motion.aside
      key="default-transition"
      initial={{
        y: isMobile ? "-94dvh" : "-100dvh",
        clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
      }}
      animate={{
        y: 0,
        clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
        transition: {
          duration: 1,
          ease: [0.76, 0, 0.24, 1],
        },
      }}
      exit={{
        y: isMobile ? "94dvh" : "100dvh",
        clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)",
        transition: {
          duration: 1,
          ease: [0.76, 0, 0.24, 1],
        },
      }}
      style={{
        transformOrigin: "top",
        willChange: "transform, clip-path",
      }}
      className="pointer-events-auto fixed inset-0 top-1/2 left-1/2 z-100 flex h-[115dvh] w-[115vw] origin-top -translate-x-1/2 -translate-y-1/2 flex-col justify-center overflow-x-clip border-y border-y-white bg-black select-none"
    >
      <div className="relative flex h-full w-full flex-col justify-between p-8 text-white sm:p-12">
        {/* Top Header */}
        <header className="relative flex w-full items-center justify-between overflow-hidden text-xs">
          <motion.div
            variants={itemRevealVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="flex w-full items-center justify-between"
          >
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
              </span>
              <span className="font-mona-sans font-medium tracking-wide text-white/90">
                Letters from Kshitij.
              </span>
            </div>

            <div className="hidden font-mono text-[11px] tracking-widest text-white/40 uppercase sm:block">
              Route In Transit
            </div>
          </motion.div>
        </header>

        {/* Center Stage */}
        <main className="relative my-auto flex w-full flex-col items-center justify-center text-center">
          <div className="pointer-events-none absolute h-72 w-72 rounded-full bg-white/4 blur-3xl" />

          <div className="overflow-hidden">
            <motion.div
              variants={itemRevealVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="relative flex items-baseline justify-center"
            >
              <span className="font-mona-sans text-6xl font-bold tracking-tighter text-white tabular-nums sm:text-8xl">
                {Math.round(progress).toString().padStart(2, "0")}
              </span>
              <span className="ml-1 font-mono text-xl font-light text-white/40 sm:text-3xl">
                %
              </span>
            </motion.div>
          </div>

          <div className="overflow-hidden">
            <motion.p
              variants={{
                initial: { y: "105%", opacity: 0 },
                animate: {
                  y: 0,
                  opacity: 1,
                  transition: {
                    duration: 0.6,
                    delay: 0.45,
                    ease: [0.65, 0, 0.35, 1],
                  },
                },
                exit: {
                  y: "105%",
                  opacity: 0,
                  transition: {
                    duration: 0.4,
                    ease: [0.65, 0, 0.35, 1],
                  },
                },
              }}
              initial="initial"
              animate="animate"
              exit="exit"
              className="font-mona-sans mt-4 h-5 text-xs tracking-wide text-white/70 sm:text-[13px]"
            >
              {targetSlug === "letters"
                ? "Accessing published dispatches..."
                : targetSlug === "404"
                  ? "Locating missing correspondence..."
                  : `Unsealing dispatch for /${targetSlug}...`}
            </motion.p>
          </div>

          <motion.div
            variants={{
              initial: { scaleX: 0, opacity: 0 },
              animate: {
                scaleX: 1,
                opacity: 1,
                transition: {
                  duration: 0.6,
                  delay: 0.4,
                  ease: [0.65, 0, 0.35, 1],
                },
              },
              exit: {
                scaleX: 0,
                opacity: 0,
                transition: {
                  duration: 0.3,
                  ease: [0.65, 0, 0.35, 1],
                },
              },
            }}
            initial="initial"
            animate="animate"
            exit="exit"
            className="relative mt-8 h-0.5 w-full max-w-xs origin-center overflow-hidden rounded-full bg-white/10 sm:max-w-sm"
          >
            <motion.div
              className="h-full bg-linear-to-r from-neutral-400 via-white to-amber-200"
              style={{ width: `${progress}%` }}
              transition={{ ease: "linear" }}
            />
          </motion.div>
        </main>

        {/* Bottom Footer */}
        <footer className="relative flex w-full items-center justify-between overflow-hidden font-mono text-[11px] text-white/40">
          <motion.div
            variants={itemRevealVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="flex w-full items-center justify-between"
          >
            <div>
              <span>TRANSIT: </span>
              <span className="text-white/80 uppercase">/{targetSlug}</span>
            </div>
            <div className="text-right tracking-wider uppercase">
              Kshitijkumar.me • 2026
            </div>
          </motion.div>
        </footer>
      </div>
    </motion.aside>
  );
}

export default DefaultLettersTransition;
```
