// Repo: me.books
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: "/book-shelf",
  assetPrefix: "/book-shelf-static",
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: "/book-shelf-static/_next/:path+",
          destination: "/_next/:path+",
        },
      ],
    };
  },
  cacheComponents: true,
  partialPrefetching: true,
  reactCompiler: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
