// global imports
import type { Metadata } from "next";

// local imports
import "./globals.css";
import { monaSans } from "@/providers/font-provider";
import OverlayNavigators from "@/components/overlay-navigators";
import BookShelfAnimator from "@/components/read-book-detail/book-shelf-animator";

export const metadata: Metadata = {
  metadataBase: new URL("https://kshitijkumar.me/book-shelf"),
  alternates: {
    canonical: "./",
  },
  title: "Book Shelf | kshitijkumar.me",
  description: "A curated collection of books I love.",
  icons: {
    icon: [
      { url: "/book-shelf/favicon.ico?v=2", sizes: "any" },
      { url: "/book-shelf/icons/favicon.png?v=2", type: "image/png" },
    ],
    apple: "/book-shelf/icons/favicon.png?v=2",
  },
};

export default function RootLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal?: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${monaSans.variable} no-scrollbar antialiased`}>
      <body
        suppressHydrationWarning
        className="no-scrollbar selection:bg-neon/80 bg-neon/80 min-h-screen selection:text-black"
      >
        <OverlayNavigators />
        <BookShelfAnimator modal={modal}>{children}</BookShelfAnimator>
      </body>
    </html>
  );
}
