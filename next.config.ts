import type { NextConfig } from "next";

// In production the browser calls /api/v1/* on the frontend's own domain and Next
// forwards it to the API. That keeps the login cookie first-party, so it is sent
// and visible to the middleware even when the API lives on a different host.
// Locally NEXT_PUBLIC_API_URL points straight at the API and this is unused.
const API_PROXY_URL = process.env.API_PROXY_URL ?? "http://localhost:4000";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${API_PROXY_URL}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
