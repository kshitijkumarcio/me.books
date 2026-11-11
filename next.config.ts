// Repo: me.books
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: "/book-shelf",
  async redirects() {
    return [
      {
        source: "/",
        destination: "/book-shelf",
        basePath: false,
        permanent: false,
      },
    ];
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
