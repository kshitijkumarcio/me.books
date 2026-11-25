import { Suspense } from "react";
import UseCaseDetail from "@/components/use-case/use-case-detail";

export const ensureStatic = "navigation";

export default function InterceptedUseCasePage() {
  return (
    <Suspense fallback={null}>
      <UseCaseDetail isIntercepted={true} />
    </Suspense>
  );
}
