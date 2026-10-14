import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // app/global-not-found.tsx: needed because the app has two root layouts
    // (public app/[lang] and dashboard app/(admin))
    globalNotFound: true,
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
