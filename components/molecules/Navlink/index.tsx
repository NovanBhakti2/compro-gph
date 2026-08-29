'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavLinkProps {
  href: string;
  label: string;
}

export const NavLink: React.FC<NavLinkProps> = ({ href, label }) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={`relative px-3.5 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${
        isActive
          ? 'text-[#c5aa7a] bg-slate-50 font-semibold shadow-xs'
          : 'text-white hover:text-[#c5aa7a] hover:bg-slate-50'
      }`}
    >
      {label}
      {isActive && (
        <span />
      )}
    </Link>
  );
};

export default NavLink;