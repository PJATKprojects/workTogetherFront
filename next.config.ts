import type { NextConfig } from "next";

const apiProxyTarget = process.env.API_PROXY_TARGET?.replace(/\/$/, "");
const upgradeInsecureRequests =
  process.env.NODE_ENV === "production" && process.env.CSP_UPGRADE_INSECURE_REQUESTS !== "false";
const browserApiTarget = (process.env.NEXT_PUBLIC_API_URL ?? apiProxyTarget ?? "").replace(
  /\/$/,
  ""
);
const apiOrigin = (() => {
  try {
    return browserApiTarget ? new URL(browserApiTarget).origin : "";
  } catch {
    return "";
  }
})();
const apiWebSocketOrigin = (() => {
  try {
    const realtimeTarget = (process.env.NEXT_PUBLIC_REALTIME_URL ?? browserApiTarget).replace(
      /\/$/,
      ""
    );
    if (!realtimeTarget) return "";
    const url = new URL(realtimeTarget);
    url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
    return url.origin;
  } catch {
    return "";
  }
})();
const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  `script-src 'self' 'unsafe-inline'${
    process.env.NODE_ENV === "production" ? "" : " 'unsafe-eval'"
  }`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: https://avatars.githubusercontent.com https://lh3.googleusercontent.com${
    apiOrigin ? ` ${apiOrigin}` : ""
  }`,
  "font-src 'self' data:",
  `connect-src 'self'${apiOrigin ? ` ${apiOrigin}` : ""}${
    apiWebSocketOrigin ? ` ${apiWebSocketOrigin}` : ""
  }`,
  "manifest-src 'self'",
  "worker-src 'self' blob:",
  "media-src 'self' blob:",
  ...(upgradeInsecureRequests ? ["upgrade-insecure-requests"] : []),
].join("; ");

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
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: contentSecurityPolicy },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-XSS-Protection", value: "0" },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
          {
            key: "Permissions-Policy",
            value:
              "camera=(), geolocation=(), microphone=(), payment=(), usb=(), publickey-credentials-get=(self), publickey-credentials-create=(self)",
          },
          ...(process.env.NODE_ENV === "production"
            ? [
                {
                  key: "Strict-Transport-Security",
                  value: "max-age=31536000; includeSubDomains",
                },
              ]
            : []),
        ],
      },
    ];
  },
};

export default nextConfig;
