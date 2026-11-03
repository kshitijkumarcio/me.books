import { ImageResponse } from "next/og";
import { join } from "path";
import { readFileSync } from "fs";

// Image metadata
export const size = {
  width: 64,
  height: 64,
};

export const contentType = "image/png";

// Image generation
export default function Icon() {
  // Read the image file from the public directory
  // Note: We use process.cwd() to get the root directory
  const filePath = join(process.cwd(), "public/icons/favicon.png");
  const file = readFileSync(filePath);

  // Convert buffer to base64 data URI
  const src = `data:image/png;base64,${file.toString("base64")}`;

  return new ImageResponse(
    // ImageResponse JSX element
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "50%", // Circular shape
        overflow: "hidden",
        background: "transparent",
      }}
    >
      {/* Render the image filling the circle */}
      <img
        alt=""
        src={src}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: "scale(1)",
        }}
      />
    </div>,
    // ImageResponse options
    {
      ...size,
    }
  );
}
