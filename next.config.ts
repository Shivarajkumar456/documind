import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdf-parse"],
  // Proxy buffers request bodies up to this limit before the route handler
  // ever sees them (default 10MB) — /api/documents needs to accept uploads
  // up to the app's own 50MB file-size limit, so this must be raised too.
  experimental: {
    proxyClientMaxBodySize: "55mb",
  },
};

export default nextConfig;
