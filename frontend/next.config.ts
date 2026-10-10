import type { NextConfig } from "next";

/**
 * NEXT_PUBLIC_API_URL — the URL of the Express backend server.
 * Defaults to http://localhost:4000 for local development.
 * Set this in your deployment environment for production.
 *
 * Example: NEXT_PUBLIC_API_URL=https://api.larptech.io
 */
const nextConfig: NextConfig = {
  // Surfaces effects that are not cleanup-safe and other unsafe patterns in development, by
  // double-invoking render and effect phases. Off in production builds.
  reactStrictMode: true,

  // Removes the `X-Powered-By: Next.js` response header. It advertises the framework and
  // version to anyone scanning for known-vulnerable deployments, and nothing legitimate
  // depends on it. The real defence is keeping Next patched — which CI enforces — but
  // there is no upside to announcing the version.
  poweredByHeader: false,
};

export default nextConfig;
