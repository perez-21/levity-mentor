"use client";

import { useEffect, useState } from "react";
import { useSignIn } from "@clerk/nextjs/legacy";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function LoginPage() {
  const { isLoaded, signIn } = useSignIn();
  const { isSignedIn } = useUser();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (isSignedIn)
      router.push("/dashboard");
  }, [isSignedIn, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isLoaded || !signIn) return;

    setError("");
    setLoading(true);

    const checkRes = await fetch("/api/auth/check-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (!checkRes.ok) {
      const data = await checkRes.json();
      setError(data.error ?? "Unable to sign in with this email");
      setLoading(false);
      return;
    }

    try {
      await signIn.create({
        identifier: email.trim().toLowerCase(),
        strategy: "email_link",
        redirectUrl: `${window.location.origin}/login/verify`,
      });

      const factor = signIn.supportedFirstFactors?.find(
        (f) => f.strategy === "email_link"
      );

      if (!factor || factor.strategy !== "email_link") {
        setError("Magic link sign-in is not available. Check Clerk settings.");
        setLoading(false);
        return;
      }

      await signIn.prepareFirstFactor({
        strategy: "email_link",
        emailAddressId: factor.emailAddressId,
        redirectUrl: `${window.location.origin}/login/verify`,
      });

      setSent(true);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to send magic link";
      setError(message);
    }

    setLoading(false);
  }

  if (isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Already signed in</CardTitle>
            <CardDescription>
              Redirecting you to your dashboard...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Check your email</CardTitle>
            <CardDescription>
              We sent a secure sign-in link to <strong>{email}</strong>. Click
              the link to access your account. It expires shortly.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setSent(false);
                setError("");
              }}
            >
              Use a different email
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Levity Mentor</CardTitle>
          <CardDescription>
            Enter your email to receive a secure sign-in link. No password
            required.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Sending link…" : "Email me a sign-in link"}
            </Button>
            <p className="text-xs text-center text-gray-500">
              New to Levity? Use the invitation link from your program admin.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
