"use client";

import InfiniteCanvas from "@/components/infinite-canvas";
import ShelfGrid from "@/components/shelf-grid";
import WelcomeBlock from "@/components/welcome-block";
import { allBooks } from "@/books/books-index";
import { useCanvasNavigation } from "@/hooks/layout-hooks/usecanvasnavigation";

const RootPage = () => {
  const { setPanToFn } = useCanvasNavigation();

  return (
    <InfiniteCanvas onPanToReady={setPanToFn} initialCenter="horizontal">
      <main className="bg-grid-dashed p-cell min-h-dvh min-w-dvw">
        <ShelfGrid
          books={allBooks}
          blockSize={8}
          gapSize={0}
          centerWelcomeSlot={<WelcomeBlock />}
        />
      </main>
    </InfiniteCanvas>
  );
};

export default RootPage;
