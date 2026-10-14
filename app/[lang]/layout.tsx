import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RootDocument } from "@/components/templates/RootDocument";
import { Navbar } from "@/components/organisms/Navbar";
import { Footer } from "@/components/organisms/Footer";
import { SITE } from "@/lib/site";
import { LOCALES, getDictionary, isLocale, languageAlternates, localizePath } from "@/lib/i18n";

type Props = { children: React.ReactNode; params: Promise<{ lang: string }> };

// /en (served at "/" through proxy.ts) and /id are prerendered; any other
// value 404s through the isLocale check below. (Not `dynamicParams = false`:
// with it, revalidatePath() makes /en/news and /id/news throw NoFallbackError.)
export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const dict = getDictionary(lang);

  return {
    // Makes relative URLs (og:image, canonical) absolute in share previews
    metadataBase: new URL(SITE.url),
    title: {
      default: `${SITE.name} | Consulting & Training`,
      template: `%s | ${SITE.name}`,
    },
    description: dict.meta.description,
    applicationName: SITE.name,
    icons: { icon: "/gph-logo.png" },
    alternates: {
      canonical: isLocale(lang) ? localizePath(lang, "/") : "/",
      languages: languageAlternates("/"),
    },
    // Pages override title/description/images; the default image comes from
    // app/opengraph-image.tsx
    openGraph: {
      type: "website",
      siteName: SITE.name,
      locale: dict.meta.ogLocale,
      url: isLocale(lang) ? localizePath(lang, "/") : "/",
    },
    twitter: { card: "summary_large_image" },
  };
}

export default async function PublicRootLayout({ children, params }: Props) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);

  return (
    <RootDocument lang={lang}>
      <Navbar lang={lang} dict={dict.nav} />
      <main className="min-h-screen">{children}</main>
      <Footer lang={lang} dict={dict.footer} />
    </RootDocument>
  );
}
