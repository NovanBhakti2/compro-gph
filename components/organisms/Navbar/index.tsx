"use client";

import React, { useEffect, useState } from "react";
import {
  Navbar as HeroNavbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
} from "@heroui/navbar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import NavLink from "@/components/molecules/Navlink";
import Image from "next/image";

const serviceItems = [
  { label: "Hospitality Consulting", href: "/services/hospitality" },
  { label: "Food Safety System", href: "/services/food-safety" },
  { label: "Quality Management (ISO)", href: "/services/quality-management" },
  { label: "In-House Training", href: "/services/training" },
];

export const Navbar: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isServiceDropdownOpen, setIsServiceDropdownOpen] = useState(false);
  const [isMobileServiceOpen, setIsMobileServiceOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 640) {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isServiceActive = pathname.startsWith("/services");

  return (
    <>
      <HeroNavbar
        isBordered
        maxWidth="xl"
        className="p-4 bg-[#0f1932] backdrop-blur-xl border-b border-slate-800 sticky top-0 z-40 transition-all shadow-xs"
      >
        <NavbarContent className="gap-3">
          <button
            type="button"
            aria-label="Buka Menu"
            onClick={() => setIsSidebarOpen(true)}
            className="sm:hidden p-2 -ml-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 active:scale-95 transition"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          <NavbarBrand>
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-transparent p-0.5 overflow-hidden flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                <Image
                  src="/gph-logo.png"
                  alt="Gama Putra Harmoni Logo"
                  width={100}
                  height={100}
                  className="object-contain w-full h-full scale-150 object-center"
                />
              </div>

              <div className="flex flex-col">
                <span className="font-bold text-lg tracking-tight text-[#C7974C] leading-tight">
                  Gama Putra Harmoni
                </span>
                <span className="text-[10px] tracking-widest uppercase font-semibold text-white/70 leading-tight">
                  Consulting & Training
                </span>
              </div>
            </Link>
          </NavbarBrand>
        </NavbarContent>

        <NavbarContent className="hidden sm:flex gap-6" justify="center">
          <NavbarItem className="text-white/70 hover:text-[#C7974C]">
            <NavLink href="/#home" label="Home" />
          </NavbarItem>
          <NavbarItem className="text-white/70 hover:text-[#C7974C]">
            <NavLink href="/#about" label="About" />
          </NavbarItem>

          {/* <NavbarItem
            className="relative flex items-center"
            onMouseEnter={() => setIsServiceDropdownOpen(true)}
            onMouseLeave={() => setIsServiceDropdownOpen(false)}
          >
            <button
              type="button"
              suppressHydrationWarning
              className={`flex items-center gap-1 text-sm font-medium transition-colors duration-200 cursor-pointer mt-0.5 ${
                isServiceActive
                  ? "text-[#C7974C]"
                  : "text-white/70 hover:text-[#C7974C]"
              }`}
            >
              <span className="text-white">Services</span>
              <svg
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  isServiceDropdownOpen ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {isServiceDropdownOpen && (
              <div className="absolute top-full left-0 w-64 pt-2 z-50">
                <div className="bg-[#0f1932] rounded-2xl p-2 shadow-2xl border border-slate-700/60 flex flex-col gap-1 backdrop-blur-xl">
                  {serviceItems.map((service) => (
                    <Link
                      key={service.href}
                      href={service.href}
                      className={`px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                        pathname === service.href
                          ? "text-[#C7974C] bg-slate-50 font-semibold shadow-xs"
                          : "text-white hover:text-[#C7974C] hover:bg-slate-50"
                      }`}
                    >
                      {service.label}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </NavbarItem> */}

          <NavbarItem className="text-white/70 hover:text-[#C7974C]">
            <NavLink href="/#team" label="Team" />
          </NavbarItem>
          <NavbarItem className="text-white/70 hover:text-[#C7974C]">
            <NavLink href="/#contact" label="Contact" />
          </NavbarItem>
        </NavbarContent>

        {!isSidebarOpen && (
          <NavbarContent justify="end" className="gap-3">
            <NavbarItem className="hidden sm:flex">
              <Link
                href="/#contact"
                className="inline-flex items-center justify-center text-sm font-semibold px-4 py-2 rounded-xl text-white bg-gradient-to-r from-[#C7974C] to-[#a88c5a] hover:from-[#d4b88a] hover:to-[#b89c6a] shadow-md shadow-[#C7974C]/20 hover:shadow-[#C7974C]/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
              >
                Get in Touch
              </Link>
            </NavbarItem>
          </NavbarContent>
        )}
      </HeroNavbar>

      <div
        className={`fixed inset-0 z-50 transition-all duration-300 sm:hidden ${
          isSidebarOpen
            ? "visible opacity-100"
            : "invisible opacity-0 pointer-events-none"
        }`}
      >
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
        />

        <aside
          className={`absolute top-0 left-0 bottom-0 w-3/4 max-w-xs bg-white shadow-2xl flex flex-col justify-between p-6 transition-transform duration-300 ease-in-out ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div>
            <div className="flex items-center justify-between pb-6 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-transparent p-0.5 overflow-hidden flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Image
                    src="/gph-logo.png"
                    alt="Gama Putra Harmoni Logo"
                    width={100}
                    height={100}
                    className="object-contain w-full h-full scale-150 object-center"
                  />
                </div>
                <span className="font-bold text-lg text-[#C7974C]">
                  Gama Putra Harmoni<span className="text-slate-400">.</span>
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsSidebarOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <nav className="flex flex-col gap-1.5 mt-6">
              <Link
                href="/#home"
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  pathname === "/"
                    ? "bg-[#C7974C] text-white shadow-md shadow-[#C7974C]/20"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <span>Home</span>
                {pathname === "/" && (
                  <span className="w-1.5 h-1.5 rounded-full bg-white" />
                )}
              </Link>

              <Link
                href="/#about"
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  pathname === "/about"
                    ? "bg-[#C7974C] text-white shadow-md shadow-[#C7974C]/20"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <span>About</span>
                {pathname === "/about" && (
                  <span className="w-1.5 h-1.5 rounded-full bg-white" />
                )}
              </Link>

              {/* <div>
                <button
                  type="button"
                  onClick={() => setIsMobileServiceOpen(!isMobileServiceOpen)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    isServiceActive
                      ? "text-[#C7974C] bg-[#C7974C]/10"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <span>Services</span>
                  <svg
                    className={`w-4 h-4 transition-transform duration-200 ${
                      isMobileServiceOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {isMobileServiceOpen && (
                  <div className="pl-4 pr-1 py-1 flex flex-col gap-1 border-l-2 border-slate-100 ml-3.5 mt-1">
                    {serviceItems.map((service) => (
                      <Link
                        key={service.href}
                        href={service.href}
                        onClick={() => setIsSidebarOpen(false)}
                        className={`text-xs py-2 px-3 rounded-lg font-medium transition-all ${
                          pathname === service.href
                            ? "bg-[#C7974C] text-white font-semibold shadow-sm"
                            : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                        }`}
                      >
                        {service.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div> */}

              <Link
                href="/#team"
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  pathname === "/team"
                    ? "bg-[#C7974C] text-white shadow-md shadow-[#C7974C]/20"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <span>Team</span>
                {pathname === "/team" && (
                  <span className="w-1.5 h-1.5 rounded-full bg-white" />
                )}
              </Link>

              <Link
                href="/#contact"
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  pathname === "/#contact"
                    ? "bg-[#C7974C] text-white shadow-md shadow-[#C7974C]/20"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <span>Contact</span>
                {pathname === "/#contact" && (
                  <span className="w-1.5 h-1.5 rounded-full bg-white" />
                )}
              </Link>
            </nav>
          </div>

          {/* <div className="pt-4 border-t border-slate-100">
            <Link
              href="#contact"
              className="hidden sm:inline-flex items-center justify-center px-4 py-2 bg-[#c5aa7a] hover:bg-[#b39768] text-white font-semibold rounded-xl text-sm transition whitespace-nowrap"
            >
              Get in Touch
            </Link>
          </div> */}
        </aside>
      </div>
    </>
  );
};

export default Navbar;
