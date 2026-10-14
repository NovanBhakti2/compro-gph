import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, decrypt } from "@/lib/session";
import { DEFAULT_LOCALE, LOCALES } from "@/lib/i18n/config";

export default async function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // Dashboard auth: optimistic check only (cookie, no DB).
  // The real check lives in lib/dal.ts.
  if (pathname === "/login" || pathname === "/dashboard" || pathname.startsWith("/dashboard/")) {
    const session = await decrypt(req.cookies.get(SESSION_COOKIE)?.value);

    if (pathname.startsWith("/dashboard") && !session?.userId) {
      const loginUrl = new URL("/login", req.nextUrl);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (pathname === "/login" && session?.userId) {
      return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
    }
    return NextResponse.next();
  }

  // Public pages live under app/[lang]. English has no prefix in the URL:
  // "/news" is served from "/en/news", and "/en/news" redirects to "/news"
  // so each page has a single English URL.
  const defaultPrefix = `/${DEFAULT_LOCALE}`;
  if (pathname === defaultPrefix || pathname.startsWith(`${defaultPrefix}/`)) {
    const url = req.nextUrl.clone();
    url.pathname = pathname.slice(defaultPrefix.length) || "/";
    return NextResponse.redirect(url, 308);
  }

  const hasLocale = LOCALES.some((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`));
  if (hasLocale) return NextResponse.next();

  return NextResponse.rewrite(new URL(`${defaultPrefix}${pathname === "/" ? "" : pathname}${search}`, req.url));
}

export const config = {
  matcher: [
    // Everything except API routes, Next internals, uploaded images, the
    // generated share image and files with an extension (robots.txt,
    // sitemap.xml, /public assets)
    "/((?!api/|_next/|__nextjs|uploads/|opengraph-image|.*\\..*).*)",
  ],
};
