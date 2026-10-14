import type { Metadata } from "next";
import { RootDocument } from "@/components/templates/RootDocument";
import { SITE } from "@/lib/site";

// Root layout for /login and /dashboard (Indonesian UI, never indexed)
export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: SITE.name, template: `%s | ${SITE.name}` },
  icons: { icon: "/gph-logo.png" },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <RootDocument lang="id">{children}</RootDocument>;
}
