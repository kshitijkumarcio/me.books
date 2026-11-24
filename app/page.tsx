"use client";

import InfiniteCanvas from "@/components/infinite-canvas";
import ShelfGrid from "@/components/shelf-grid";
import CurrentReads from "@/components/current-reads/current-reads";
import Wishlist from "@/components/wishlist/wishlist";
import GridCursorHighlighter from "@/components/ui-components/grid-cursor-highlighter";
import { allBooks } from "@/books/books-index";
import { useCanvasNavigation } from "@/hooks/layout-hooks/usecanvasnavigation";
import Introduction from "@/components/introduction/introduction";

const RootPage = () => {
  const { setPanToFn } = useCanvasNavigation();

  return (
    <InfiniteCanvas onPanToReady={setPanToFn} initialCenter="horizontal">
      <main className="bg-grid-dashed pb-cell-[1.24] relative min-h-screen min-w-dvw overflow-clip">
        <GridCursorHighlighter />
        <Introduction />
        <ShelfGrid
          books={allBooks}
          blockSize={8}
          horizontalGap={0.75}
          verticalGap={1}
          showGridSize={false}
        />
        <CurrentReads />
        <Wishlist horizontalGap={0.25} verticalGap={1} />
      </main>
    </InfiniteCanvas>
  );
};

export default RootPage;
