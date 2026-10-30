import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The Docker build sets this to get a self-contained server; local
  // `next start` keeps working because it is off by default.
  output: process.env.NEXT_STANDALONE ? "standalone" : undefined,
  cacheComponents: true,
  partialPrefetching: true,
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
