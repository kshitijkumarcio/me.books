```tsx
// Paper-cut perforated ticket mask with see-through holes along all sides
const TICKET_MASK_STYLE: React.CSSProperties = (() => {
  const horizontalHoles = 18;
  const verticalHoles = 16;
  const holeRadius = "3.5px";

  const topGradients = Array.from({ length: horizontalHoles }).map((_, i) => {
    const position = 5 + i * (90 / (horizontalHoles - 1));
    return `radial-gradient(circle at ${position}% 0%, transparent 0, transparent ${holeRadius}, black ${holeRadius})`;
  });

  const bottomGradients = Array.from({ length: horizontalHoles }).map(
    (_, i) => {
      const position = 5 + i * (90 / (horizontalHoles - 1));
      return `radial-gradient(circle at ${position}% 100%, transparent 0, transparent ${holeRadius}, black ${holeRadius})`;
    }
  );

  const leftGradients = Array.from({ length: verticalHoles }).map((_, i) => {
    const position = 5 + i * (90 / (verticalHoles - 1));
    return `radial-gradient(circle at 0% ${position}%, transparent 0, transparent ${holeRadius}, black ${holeRadius})`;
  });

  const rightGradients = Array.from({ length: verticalHoles }).map((_, i) => {
    const position = 5 + i * (90 / (verticalHoles - 1));
    return `radial-gradient(circle at 100% ${position}%, transparent 0, transparent ${holeRadius}, black ${holeRadius})`;
  });

  const maskImage = [
    ...topGradients,
    ...bottomGradients,
    ...leftGradients,
    ...rightGradients,
  ].join(",\n  ");

  return {
    maskImage,
    WebkitMaskImage: maskImage,
    maskComposite: "intersect",
    WebkitMaskComposite: "source-in",
  };
})();
```
