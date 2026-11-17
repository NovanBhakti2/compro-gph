import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // A phone on the same Wi-Fi may open the dev server when NEXT_PUBLIC_SITE_URL
  // points to this machine (set in .env.local); has no effect in production
  allowedDevOrigins: process.env.NEXT_PUBLIC_SITE_URL?.startsWith("http://")
    ? [new URL(process.env.NEXT_PUBLIC_SITE_URL).hostname]
    : [],
  experimental: {
    // app/global-not-found.tsx: needed because the app has two root layouts
    // (public app/[lang] and dashboard app/(admin))
    globalNotFound: true,
  },
  // Certificate template and fonts are read from disk by the PDF route
  outputFileTracingIncludes: {
    "/api/certificates/*": ["./assets/certificate/**/*"],
  },
  images: {
    // Next 16 only serves listed qualities (60: hero background, 75: default)
    qualities: [60, 75],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        // Images uploaded from the dashboard (Vercel Blob)
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
  },
};

export default nextConfig;
