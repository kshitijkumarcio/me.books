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
  title: "Kshelf | kshitijkumar.me",
  description: "A curated collection of books I love.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${monaSans.variable} mx-auto h-full max-w-[1920px] antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <OverlayNavigators />
        {children}
      </body>
    </html>
  );
}
