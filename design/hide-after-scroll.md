```tsx
// HideAfterScroll.tsx

"use client";

import { useState } from "react";
import { motion, useScroll, useMotionValueEvent } from "motion/react";
import { easing065 } from "@/constants/anim-config";

interface Props {
  children: React.ReactNode;
  hideAfter: number; // The scroll distance in pixels
  hideDirection: "up" | "down";
}

const HideAfterScroll = ({ children, hideAfter, hideDirection }: Props) => {
  const [hidden, setHidden] = useState(false);

  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (latest > hideAfter) {
      setHidden(true);
    } else {
      setHidden(false);
    }
  });

  return (
    <div className="overflow-hidden">
      <motion.div
        initial="visible"
        variants={{
          hidden: {
            y: hideDirection === "up" ? "-110%" : "110%",
            transition: { duration: 0.9, ease: easing065 },
          },
          visible: { y: 0, transition: { duration: 0.9, ease: easing065 } },
        }}
        animate={hidden ? "hidden" : "visible"}
        transition={{ duration: 0.4, ease: "easeInOut" }}
      >
        {children}
      </motion.div>
    </div>
  );
};

export default HideAfterScroll;
```
