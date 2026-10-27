import { Easing } from "motion";

// When linking across zones (e.g., a button in /essays that takes the user to /books or back to your root portfolio /), use a standard HTML <a href="/books"> tag instead of Next.js <Link>. Because they are separate Next.js apps with separate client routers, <Link> would look for /books inside the kshitij-essays bundle and fail, whereas <a> triggers a clean browser navigation across zones.

export const linkUnderlineBlack =
  'before:absolute before:content-[" "] before:-left-0 before:bottom-[0px] before:block before:w-[98%] before:h-[1px] before:bg-black before:duration-1000 before:transition-all before:cubic-bezier(0.19, 1, 0.22, 1) before:scale-x-0 before:origin-left hover:before:scale-x-100 hover:before:delay-300';

export const linkUnderlineAfterBlack =
  'after:absolute after:content-[" "] after:left-0 after:-bottom-[1px] after:block after:w-full after:h-[1px] after:bg-black after:duration-1000 after:transition-all after:cubic-bezier(0.19, 1, 0.22, 1) after:origin-right after:delay-300 hover:after:scale-x-0 hover:after:delay-0';

export const easing016: Easing = [0.16, 1, 0.3, 1];
