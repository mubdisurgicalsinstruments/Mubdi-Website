import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
