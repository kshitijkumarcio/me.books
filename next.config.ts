// Repo: me.books
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: "/book-shelf",
  assetPrefix: "/book-shelf-static",
  async redirects() {
    return [
      {
        source: "/",
        destination: "/book-shelf",
        basePath: false,
        permanent: false,
      },
      {
        source: "/favicon.ico",
        destination: "/book-shelf/favicon.ico",
        basePath: false,
        permanent: false,
      },
    ];
  },
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
