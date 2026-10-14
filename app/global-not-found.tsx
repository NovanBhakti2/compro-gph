import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

// 404 for URLs that match no route at all. The app has two root layouts
// (app/[lang] and app/(admin)), so Next renders this standalone page instead.
export const metadata: Metadata = {
  title: "404 | Gama Putra Harmoni",
  robots: { index: false },
};

export default function GlobalNotFound() {
  return (
    <html lang="en">
      <body className={inter.className}>
        <main className="flex min-h-screen items-center justify-center bg-[#0f1932] px-6 text-center text-white">
          <div className="max-w-lg space-y-5">
            <p className="text-7xl font-extrabold tracking-tight text-[#C7974C]">404</p>
            <h1 className="text-2xl font-extrabold sm:text-3xl">Page not found</h1>
            <p className="text-sm text-slate-300">Halaman tidak ditemukan.</p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link
                href="/"
                className="rounded-xl bg-[#C7974C] px-5 py-2.5 text-sm font-semibold text-[#0f1932] hover:bg-[#d8bd8d]"
              >
                Home
              </Link>
              <Link
                href="/id"
                className="rounded-xl border border-white/20 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
              >
                Beranda
              </Link>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
