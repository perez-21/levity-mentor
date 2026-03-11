"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import NavLink from "./NavLink";

export default function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="sm:hidden">
      <button
        aria-label="Open menu"
        onClick={() => setOpen(true)}
        className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:text-foreground hover:bg-muted"
      >
        <Menu className="size-5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />
          <aside className="relative w-64 bg-card p-4 border-r border-border">
            <div className="flex items-center justify-between mb-4">
              <div className="font-semibold">Menu</div>
              <button
                aria-label="Close menu"
                onClick={() => setOpen(false)}
                className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                <X className="size-5" />
              </button>
            </div>
            <nav className="flex flex-col gap-2">
              <NavLink href="/dashboard">Dashboard</NavLink>
              <NavLink href="/chat">AI Mentor</NavLink>
              <NavLink href="/finances">Finances</NavLink>
              <NavLink href="/admin">Admin</NavLink>
            </nav>
          </aside>
        </div>
      )}
    </div>
  );
}
