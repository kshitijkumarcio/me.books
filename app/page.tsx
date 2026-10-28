import InfiniteCanvas from "@/components/infinite-canvas";

const RootPage = () => {
  return (
    <InfiniteCanvas>
      <div className="bg-grid-dashed flex h-[200vh] min-h-dvh w-[200vw] min-w-dvw items-center justify-center">
        <p className="text-sm font-bold text-black">+ Ready to design +</p>
      </div>
    </InfiniteCanvas>
  );
};

export default RootPage;
