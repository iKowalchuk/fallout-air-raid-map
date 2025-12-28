import type { NextConfig } from "next";

const securityHeaders = [
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "X-XSS-Protection",
    value: "1; mode=block",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
];

const nextConfig: NextConfig = {
  reactCompiler: true,

  async headers() {
    return [
      {
        // Apply security headers to all API routes
        source: "/api/:path*",
        headers: securityHeaders,
      },
      {
        // Apply security headers to all pages
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
