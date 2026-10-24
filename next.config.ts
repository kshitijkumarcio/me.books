// Repo: me.books
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: "/books",
  assetPrefix: "/books-static",
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: "/books-static/_next/:path+",
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
