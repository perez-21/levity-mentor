"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";

export default function LoginVerifyPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;

    if (isSignedIn) {
      fetch("/api/auth/redirect-role")
        .then((res) => res.json())
        .then((data) => {
          router.replace(data.redirectTo ?? "/dashboard");
        })
        .catch(() => router.replace("/dashboard"));
    }
  }, [isLoaded, isSignedIn, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <p className="text-gray-500">Completing sign-in…</p>
    </div>
  );
}
