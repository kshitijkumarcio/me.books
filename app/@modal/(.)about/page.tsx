import { Suspense } from "react";
import AboutDetail from "@/components/about/about-detail";

export const ensureStatic = "navigation";

export default function InterceptedAboutPage() {
  return (
    <Suspense fallback={null}>
      <AboutDetail isIntercepted={true} />
    </Suspense>
  );
}
