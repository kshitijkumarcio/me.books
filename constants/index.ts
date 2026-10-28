import images from "@/constants/images";
import icons from "@/constants/icons";
import { Easing } from "motion";

export { images, icons };

// When linking across zones (e.g., a button in /essays that takes the user to /books or back to your root portfolio /), use a standard HTML <a href="/books"> tag instead of Next.js <Link>. Because they are separate Next.js apps with separate client routers, <Link> would look for /books inside the kshitij-essays bundle and fail, whereas <a> triggers a clean browser navigation across zones.

export const linkUnderlineBlack =
  'before:absolute before:content-[" "] before:-left-0 before:bottom-[0px] before:block before:w-[98%] before:h-[1px] before:bg-black before:duration-1000 before:transition-all before:cubic-bezier(0.19, 1, 0.22, 1) before:scale-x-0 before:origin-left hover:before:scale-x-100 hover:before:delay-300';

export const linkUnderlineAfterBlack =
  'after:absolute after:content-[" "] after:left-0 after:-bottom-[1px] after:block after:w-full after:h-[1px] after:bg-black after:duration-1000 after:transition-all after:cubic-bezier(0.19, 1, 0.22, 1) after:origin-right after:delay-300 hover:after:scale-x-0 hover:after:delay-0';

export const easing016: Easing = [0.16, 1, 0.3, 1];
export const easing022: Easing = [0.22, 1, 0.36, 1];

// 9 dots morphing between a 3x3 grid (9 dots) and a 7-dot flower/hexagon (1 center + 6 outer dots, 2 hidden)
export const dotVariants = [
  // Row 0
  {
    grid: { x: 0, y: 0, scale: 1, opacity: 1 },
    moodboard: { x: 1, y: 4, scale: 1, opacity: 1 },
  },
  {
    grid: { x: 0, y: 0, scale: 1, opacity: 1 },
    moodboard: { x: 0, y: 0, scale: 1, opacity: 1 },
  },
  {
    grid: { x: 0, y: 0, scale: 1, opacity: 1 },
    moodboard: { x: -1, y: 4, scale: 1, opacity: 1 },
  },

  // Row 1
  {
    grid: { x: 0, y: 0, scale: 1, opacity: 1 },
    moodboard: { scale: 0, opacity: 0 },
  },
  {
    grid: { x: 0, y: 0, scale: 1, opacity: 1 },
    moodboard: { x: 0, y: 0, scale: 1, opacity: 1 },
  },
  {
    grid: { x: 0, y: 0, scale: 1, opacity: 1 },
    moodboard: { scale: 0, opacity: 0 },
  },

  // Row 2
  {
    grid: { x: 0, y: 0, scale: 1, opacity: 1 },
    moodboard: { x: 1, y: -4, scale: 1, opacity: 1 },
  },
  {
    grid: { x: 0, y: 0, scale: 1, opacity: 1 },
    moodboard: { x: 0, y: 0, scale: 1, opacity: 1 },
  },
  {
    grid: { x: 0, y: 0, scale: 1, opacity: 1 },
    moodboard: { x: -1, y: -4, scale: 1, opacity: 1 },
  },
];

export const dotRows = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
];

// import InfiniteCanvas from "@/components/infinite-canvas";
// import PaperBackground from "@/components/ui-components/paper-background";
// import VisibleByState from "@/components/ui-components/visible-by-state-wrapper";
// import { images } from "@/constants";
// import Image from "next/image";

// const RootPage = () => {
//   return (
//     <InfiniteCanvas>
//       <div className="bg-grid-dashed flex min-h-dvh min-w-dvw items-center justify-center">
//         <div className="h-cell-9 relative aspect-square border border-red-500">
//           <VisibleByState>
//             <div className="top- absolute w-fit cursor-pointer">
//               <Image
//                 src={images.AMonthInTheCountry}
//                 alt="test image"
//                 draggable={false}
//                 className="shadow-book w-40 origin-center object-cover"
//               />
//             </div>
//           </VisibleByState>
//           <div className="relative mt-6 max-w-78 p-2">
//             <p className="font-mona-sans relative z-10 text-[14px] leading-4.5 font-semibold text-black italic">
//               “Ah, those days... for many years afterwards{"\n"} their happiness
//               haunted me.”
//             </p>
//             <PaperBackground
//               color="#FFF27B"
//               seed={30}
//               tearStrength={5}
//               tearFrequency={0.1}
//               roughness={1}
//               lightAngle={45}
//               lightElevation={70}
//             />
//           </div>
//         </div>
//       </div>
//     </InfiniteCanvas>
//   );
// };

// export default RootPage;
