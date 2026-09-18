import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone",
  sassOptions: {
    includePaths: [path.join(__dirname)],
  },
  experimental: {
    serverActions: {
      // Banner uploads go through the uploadImage server action, so the whole file travels in
      // the action's request body. The default cap is 1 MB, which rejected the request during
      // body parsing — before the action ran — surfacing as an opaque 500 on POST /events
      // rather than any error the action could catch. Kept above the API's own 5 MB image
      // limit (plus multipart overhead) so an oversized file gets the API's message instead.
      bodySizeLimit: "6mb",
    },
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
