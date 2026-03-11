"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export default function ProfilePills({
  name,
  business,
  role,
}: {
  name?: string | null;
  business?: string | null;
  role?: string | null;
}) {
  const initials = (name || "")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <div
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-medium text-muted-foreground",
            "ring-1 ring-border",
          )}
        >
          {initials || "U"}
        </div>

        {business ? (
          <div className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground text-xs font-medium max-w-[12rem] truncate">
            {business}
          </div>
        ) : role ? (
          <div className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground text-xs font-medium">
            {role}
          </div>
        ) : (
          <div className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground text-xs font-medium truncate">
            {name}
          </div>
        )}
      </div>
    </div>
  );
}
