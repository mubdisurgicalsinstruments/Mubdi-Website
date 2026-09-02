import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Product images live in public/ and are served as static assets. Exclude them
  // from serverless output tracing so each route does not bundle ~1.4 GB of PNGs.
  outputFileTracingExcludes: {
    "/*": ["./public/images/**/*", "./public/logo.png"],
  },
  async rewrites() {
    return [{ source: "/icon", destination: "/icon.png" }];
  },
  async redirects() {
    return [
      {
        source: "/products",
        destination: "/#categories",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
