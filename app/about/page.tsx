import type { Metadata } from "next";
import { Suspense } from "react";
import AboutDetail from "@/components/about/about-detail";

export const ensureStatic = "navigation";

export const metadata: Metadata = {
  title: "About | kshelf. by Kshitijkumar",
  description:
    "About kshelf — a curated personal library and bookshelf by Kshitijkumar.",
};

export default function AboutStandalonePage() {
  return (
    <Suspense fallback={null}>
      <AboutDetail isIntercepted={false} />
    </Suspense>
  );
}
