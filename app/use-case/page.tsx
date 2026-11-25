import type { Metadata } from "next";
import { Suspense } from "react";
import UseCaseDetail from "@/components/use-case/use-case-detail";

export const ensureStatic = "navigation";

export const metadata: Metadata = {
  title: "Use Case | kshelf. by Kshitijkumar",
  description:
    "How to navigate, filter, and borrow books on kshelf — by Kshitijkumar.",
};

export default function UseCaseStandalonePage() {
  return (
    <Suspense fallback={null}>
      <UseCaseDetail isIntercepted={false} />
    </Suspense>
  );
}
