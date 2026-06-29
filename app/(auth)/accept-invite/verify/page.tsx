"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth, useUser } from "@clerk/nextjs";

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isSignedIn && !token) {
      router.push('/login');
    }
    if (!isLoaded || !user ) return;

    fetch("/api/invitations/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json();
          setError(data.error ?? "Failed to complete registration");
          return;
        }
        router.replace("/dashboard");
      })
      .catch(() => setError("Failed to complete registration"));
  }, [isLoaded, isSignedIn, user, token, router]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <p className="text-gray-500">Activating your account…</p>
    </div>
  );
}

export default function AcceptInviteVerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <p className="text-gray-500">Loading…</p>
        </div>
      }
    >
      <VerifyContent />
    </Suspense>
  );
}
