import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone",
  sassOptions: {
    includePaths: [path.join(__dirname)],
  },
  // Optimize webpack for Docker
  webpack: (config, { dev }) => {
    if (dev) {
      // Better file watching in Docker
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      };
    }
    return config;
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
