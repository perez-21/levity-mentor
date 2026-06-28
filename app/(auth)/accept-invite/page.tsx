"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSignUp, useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type InvitationInfo = {
  email: string;
  fullName: string | null;
  businessName: string | null;
};

function AcceptInviteForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") ?? "";
  const ticket = searchParams.get("__clerk_ticket");
  const { isSignedIn } = useUser();
  const { signUp, errors, fetchStatus } = useSignUp();

  const [invitation, setInvitation] = useState<InvitationInfo | null>(null);
  const [businessDescription, setBusinessDescription] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);

  if (!token) {
    setError(
      "Missing invitation token. Use the link from your invite email.",
    );
    setValidating(false);
    
  }

  if (!ticket) {
    setError(
      "Missing invitation ticket. Use the link from your invite email.",
    );
    setValidating(false);
    
  }

  useEffect(() => {
    if (isSignedIn || signUp.status === "complete") {
      router.push("/dashboard");
    }
  }, [isSignedIn, signUp.status, router]);

  useEffect(() => {

    fetch(`/api/invitations/validate?token=${encodeURIComponent(token)}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "Invalid invitation");
          return;
        }
        setInvitation({
          email: data.email,
          fullName: data.fullName || "",
          businessName: data.businessName,
        });
      })
      .catch(() => setError("Could not verify invitation"))
      .finally(() => setValidating(false));
  }, [token, ticket]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!signUp || !invitation || !token) return;

    setError("");
    setLoading(true);

    try {
      const fullNameArr = invitation.fullName?.split(" ");
      if (!Array.isArray(fullNameArr) || !ticket ) return;
      const { error: clerkError } = await signUp.ticket({
        firstName: fullNameArr[0],
        lastName: fullNameArr[1],
        ticket,
      });

      if (clerkError) {
        setError(JSON.stringify(clerkError, null, 2));
        return;
      }

      if (signUp.status === 'complete') {
        await signUp.finalize({
          navigate: ({session, decorateUrl}) => {
            if (session?.currentTask) {
              console.log(session?.currentTask);
              return;
            }

            const url = decorateUrl('/dashboard')
            if (url.startsWith('http')) {
              window.location.href = url
            }
            else {
              router.push(url)
            }
          }
        });
      }
      else {
        setError("Sign-up attempt not complete: Clerk error");
      }

      await fetch("/api/invitations/pending", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          businessDescription: businessDescription.trim(),
        }),
      });

      router.push(`/accept-invite/verify?token=${token}`);

    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to start sign-up. The email may already be registered — try signing in instead.";
      setError(message);
    }

    setLoading(false);
  }

  if (validating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Verifying your invitation…</p>
      </div>
    );
  }

  // if (sent) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
  //       <Card className="w-full max-w-md">
  //         <CardHeader className="text-center">
  //           <CardTitle className="text-2xl">Check your email</CardTitle>
  //           <CardDescription>
  //             We sent an activation link to <strong>{invitation?.email}</strong>
  //             . Click it to finish setting up your account.
  //           </CardDescription>
  //         </CardHeader>
  //       </Card>
  //     </div>
  //   );
  // }

  if (!invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-sm text-red-600 text-center">
              {error || "Invalid invitation"}
            </p>
            <Button
              variant="outline"
              className="w-full mt-4"
              onClick={() => router.push("/login")}
            >
              Go to sign in
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome to Levity</CardTitle>
          <CardDescription>
            Complete your sign up. No password needed.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={invitation.email}
                readOnly
                disabled
              />
            </div>
            {(invitation.fullName || invitation.businessName) && (
              <div className="text-sm text-gray-600 space-y-1">
                {invitation.fullName && (
                  <p>
                    <span className="font-medium">Name:</span>{" "}
                    {invitation.fullName}
                  </p>
                )}
                {invitation.businessName && (
                  <p>
                    <span className="font-medium">Business:</span>{" "}
                    {invitation.businessName}
                  </p>
                )}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="desc">
                Describe your business idea (optional)
              </Label>
              <Textarea
                id="desc"
                placeholder="e.g. I sell homemade peanut butter online targeting health-conscious students in Lagos."
                rows={4}
                value={businessDescription}
                onChange={(e) => setBusinessDescription(e.target.value)}
              />
              <p className="text-xs text-gray-500">
                This helps your AI mentor give you better advice.
              </p>
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Finishing up…" : "Complete sign up"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AcceptInvitePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <p className="text-gray-500">Loading…</p>
        </div>
      }
    >
      <AcceptInviteForm />
    </Suspense>
  );
}
