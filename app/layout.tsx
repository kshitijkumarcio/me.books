// global imports
import type { Metadata } from "next";

// local imports
import "./globals.css";
import { monaSans } from "@/providers/font-provider";
import OverlayNavigators from "@/components/overlay-navigators";

export const metadata: Metadata = {
  metadataBase: new URL("https://kshitijkumar.me"),
  alternates: {
    canonical: "./", // Automatically resolves to https://kshitijkumar.me/book-shelf/[current-path]
  },
  title: "Book Shelf | kshitijkumar.me",
  description: "A curated collection of books I love.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${monaSans.variable} no-scrollbar antialiased`}>
      <body className="no-scrollbar selection:bg-neon/80 bg-neon/80 min-h-screen selection:text-black">
        <OverlayNavigators />
        {children}
      </body>
    </html>
  );
}
