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
      <main className="bg-grid-dashed relative min-h-dvh min-w-dvw">
        <GridCursorHighlighter />

        <Introduction />
        <ShelfGrid books={allBooks} blockSize={8} gapSize={0} />

        <CurrentReads />

        <Wishlist />
      </main>
    </InfiniteCanvas>
  );
};

export default RootPage;
