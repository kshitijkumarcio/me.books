```tsx
"use client";

// global imports
import { AnimatePresence, motion } from "motion/react";

// local imports
import { useMenu } from "@/hooks/layout-hooks/useMenu";
import LandingMenu from "./landing-menu";
import { useMediaQuery } from "@/hooks/layout-hooks/useMediaQuery";

const MenuAnimator = ({ children }: { children: React.ReactNode }) => {
  const { isOpen } = useMenu();
  const isMobile = useMediaQuery("(max-width: 641px)");
  // const lenis = useLenis();
  // const scrollPositionRef = useRef(0);

  // useEffect(() => {
  // 	if (isOpen) {
  // 		// Store the current scroll position before stopping Lenis
  // 		scrollPositionRef.current = window.scrollY;
  // 		lenis?.stop();
  // 	} else {
  // 		// Restart Lenis and restore scroll position
  // 		lenis?.start();
  // 		// Scroll back to the stored position
  // 		if (scrollPositionRef.current > 0) {
  // 			window.scrollTo(0, scrollPositionRef.current);
  // 		}
  // 	}

  // 	// Additional mobile-specific handling
  // 	if (isOpen && isMobile) {
  // 		// Prevent mobile browser from scrolling the page
  // 		document.documentElement.style.overflow = 'hidden';
  // 	} else {
  // 		document.documentElement.style.overflow = '';
  // 	}

  // 	// Cleanup function to ensure Lenis is restarted when component unmounts
  // 	return () => {
  // 		lenis?.start();
  // 		document.documentElement.style.overflow = '';
  // 	};
  // }, [isOpen, lenis, isMobile]);

  return (
    <div>
      <AnimatePresence>{isOpen && <LandingMenu />}</AnimatePresence>

      <motion.div
        initial="closed"
        animate={isOpen === true ? "opened" : "closed"}
        variants={{
          opened: {
            y: isMobile === true ? "65dvh" : "76dvh",
            transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] },
          },
          closed: {
            y: 0,
            x: 0,
            scale: 1,
            rotate: 0,
            transition: { duration: 0.8, delay: 0.4, ease: [0.76, 0, 0.24, 1] },
          },
        }}
        className="relative"
      >
        {children}
      </motion.div>
    </div>
  );
};

export default MenuAnimator;
```

```tsx
return (
  <motion.div
    initial={{
      y: isMobile === true ? "-94dvh" : "-80dvh",
      clipPath: "polygon(0 0, 100% 0, 100% 0, 0 0)",
    }}
    animate={{
      scale: 1,
      y: 0,
      clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
      transition: {
        duration: 0.8,
        ease: [0.76, 0, 0.24, 1],
      },
    }}
    exit={{
      y: isMobile === true ? "-50dvh" : "-80dvh",
      scale: 1,
      clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
      transition: {
        duration: 0.8,
        delay: 0.4,
        ease: [0.76, 0, 0.24, 1],
      },
    }}
    style={{ transformOrigin: "top" }}
    className="bg-menu-background fixed top-0 left-0 z-998 h-dvh w-screen origin-top overflow-x-clip"
  >
    <div
      ref={scrollContainerRef}
      className="h-full overflow-hidden"
      style={{
        // Override Lenis for touch devices
        touchAction: "auto",
      }}
    >
      <div className="relative z-997 flex h-full w-full flex-col"></div>
    </div>
  </motion.div>
);
```
