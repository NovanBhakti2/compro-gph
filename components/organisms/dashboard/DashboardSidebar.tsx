"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { logout } from "@/app/actions/auth";
import { Icon, type IconName } from "./ui";

type Props = { user: { name: string; email: string; role: string } };

const NAV: { section: string; items: { href: string; label: string; icon: IconName; external?: boolean }[] }[] = [
  {
    section: "Konten",
    items: [
      { href: "/dashboard", label: "Ringkasan", icon: "home" },
      { href: "/dashboard/articles", label: "Semua Artikel", icon: "articles" },
      { href: "/dashboard/articles/new", label: "Tulis Artikel", icon: "pen" },
      { href: "/dashboard/categories", label: "Kategori", icon: "tag" },
    ],
  },
  {
    section: "Pengaturan",
    items: [{ href: "/dashboard/account", label: "Akun saya", icon: "user" }],
  },
  {
    section: "Website",
    items: [{ href: "/news", label: "Lihat halaman News", icon: "external", external: true }],
  },
];

function isActive(pathname: string, href: string) {
  if (href === "/dashboard/articles") {
    // Edit pages (/dashboard/articles/[id]) belong to "Semua Artikel"
    return pathname.startsWith(href) && pathname !== "/dashboard/articles/new";
  }
  return pathname === href;
}

export function DashboardSidebar({ user }: Props) {
  const pathname = usePathname();
  // The mobile drawer stays open only on the page it was opened on,
  // so navigating closes it
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn === pathname;
  const setOpen = (value: boolean) => setOpenOn(value ? pathname : null);

  return (
    <>
      {/* Mobile top bar */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white/95 px-4 py-2.5 backdrop-blur lg:hidden">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <img src="/gph-logo.png" alt="GPH" className="h-7 w-auto" />
          <span className="text-sm font-extrabold text-[#0f1932]">Dashboard</span>
        </Link>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Buka menu"
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
        >
          <Icon name="menu" className="h-5 w-5" />
        </button>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-40 bg-[#0b1329]/50 backdrop-blur-sm lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-[#0b1329] text-slate-300 transition-transform duration-200 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center gap-3 px-5 py-5">
          <div className="rounded-xl bg-white p-1.5 shadow-sm">
            <img src="/gph-logo.png" alt="GPH" className="h-7 w-auto" />
          </div>
          <div className="min-w-0 leading-tight">
            <p className="truncate text-sm font-extrabold text-white">Gama Putra Harmoni</p>
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#C7974C]">
              Content Dashboard
            </p>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Tutup menu"
            className="ml-auto rounded-lg p-1.5 text-slate-400 hover:bg-white/5 lg:hidden"
          >
            <Icon name="x" />
          </button>
        </div>

        <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-3">
          {NAV.map((group) => (
            <div key={group.section} className="space-y-1">
              <p className="px-3 pb-1 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
                {group.section}
              </p>
              {group.items.map((item) => {
                const active = !item.external && isActive(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    target={item.external ? "_blank" : undefined}
                    aria-current={active ? "page" : undefined}
                    className={`relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      active
                        ? "bg-white/[0.07] text-white"
                        : "text-slate-400 hover:bg-white/[0.04] hover:text-white"
                    }`}
                  >
                    {active && (
                      <span className="absolute inset-y-1.5 left-0 w-[3px] rounded-r-full bg-[#C7974C]" />
                    )}
                    <Icon
                      name={item.icon}
                      className={`h-[18px] w-[18px] ${active ? "text-[#C7974C]" : ""}`}
                    />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="border-t border-white/10 p-3">
          <div className="flex items-center gap-1 rounded-lg">
            <Link
              href="/dashboard/account"
              title="Akun saya"
              className="flex min-w-0 flex-1 items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-white/[0.04]"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#e0b673] to-[#C7974C] text-sm font-bold text-[#0b1329]">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1 leading-tight">
                <p className="truncate text-sm font-semibold text-white">{user.name}</p>
                <p className="truncate text-[11px] text-slate-400">{user.role}</p>
              </div>
            </Link>
            <form action={logout}>
              <button
                type="submit"
                title="Keluar"
                aria-label="Keluar"
                className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white"
              >
                <Icon name="logout" className="h-[18px] w-[18px]" />
              </button>
            </form>
          </div>
        </div>
      </aside>
    </>
  );
}
