import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone",
  sassOptions: {
    includePaths: [path.join(__dirname)],
  },
  // Use Turbopack (default in Next.js 16)
  turbopack: {
    resolveAlias: {
      "@": path.resolve(__dirname),
    },
  },
  // Proxy API requests to backend
  async rewrites() {
    return [
      {
        source: '/app/api/:path*',
        destination: 'http://backend:8080/app/api/:path*',
      },
    ];
  },
};

export default nextConfig;
