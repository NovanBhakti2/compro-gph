import { Inter } from "next/font/google";
import "@/app/globals.css";
import { Providers } from "@/app/providers";

const inter = Inter({ subsets: ["latin"] });

/**
 * <html>/<body> shell shared by the app's root layouts: the public site
 * (app/[lang]/layout.tsx, lang = page language) and the dashboard
 * (app/(admin)/layout.tsx).
 */
export function RootDocument({ lang, children }: { lang: string; children: React.ReactNode }) {
  return (
    <html lang={lang}>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
