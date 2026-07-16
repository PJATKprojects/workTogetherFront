import type { NextConfig } from "next";

const apiProxyTarget = process.env.API_PROXY_TARGET?.replace(/\/$/, "");

const nextConfig: NextConfig = {
  experimental: {
    // Tree-shake heavyweight named-export packages at build time.
    optimizePackageImports: ["framer-motion", "@tiptap/react", "@tiptap/starter-kit"],
  },
  async rewrites() {
    if (!apiProxyTarget) return [];

    // Production option for split hosting (for example Vercel + Azure Container Apps):
    // the browser talks only to the frontend origin, so refresh cookies stay first-party.
    return [
      {
        source: "/api/:path*",
        destination: `${apiProxyTarget}/api/:path*`,
      },
      {
        source: "/health/:path*",
        destination: `${apiProxyTarget}/health/:path*`,
      },
    ];
  },
};

export default nextConfig;
