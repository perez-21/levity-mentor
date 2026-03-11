"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const path = usePathname();
  const isActive = path === href || path?.startsWith(href + "/");

  return (
    <Link
      href={href}
      className={`text-sm px-2 py-1 rounded ${isActive ? "text-gray-900 font-medium" : "text-gray-600 hover:text-gray-900"}`}
    >
      {children}
    </Link>
  );
}
