"use client";

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const path = usePathname();
  const isActive = path === href || path?.startsWith(href + "/");

  return (
    <Link
      href={href}
      className={`text-sm px-3 py-1 rounded-md transition-colors ${
        isActive
          ? "text-primary bg-secondary font-medium"
          : "text-muted-foreground hover:text-foreground hover:bg-muted"
      }`}
    >
      {children}
    </Link>
  );
}
