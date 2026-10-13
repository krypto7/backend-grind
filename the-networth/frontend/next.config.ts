import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Default proxy body limit is 10MB, which cuts off video uploads.
    proxyClientMaxBodySize: "100mb",
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:8000/api/:path*",
      },
    ];
  },
};

export default nextConfig;
