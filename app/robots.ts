import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Admin area and endpoints aren't meant for search results
      disallow: ["/dashboard", "/login", "/api/"],
    },
    sitemap: `${SITE.url}/sitemap.xml`,
  };
}
