"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function InvitePage() {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    ok: boolean;
    message: string;
    inviteUrl?: string;
  } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setResult(null);
    setLoading(true);

    const res = await fetch("/api/admin/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, fullName, businessName }),
    });

    const data = await res.json();

    if (res.ok) {
      setResult({
        ok: true,
        message: data.message ?? `Invitation has been sent to${email}. Alternatively, you can send the invite url`,
        inviteUrl: data.inviteUrl,
      });
      setEmail("");
      setFullName("");
      setBusinessName("");
    } else {
      setResult({ ok: false, message: data.error ?? "Failed to create invite" });
    }

    setLoading(false);
  }

  return (
    <div className="max-w-md space-y-6">
      <h1 className="text-2xl font-bold">Invite Participant</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Create invitation</CardTitle>
          <CardDescription>
            Generates a secure, one-time invitation link. Share it with the
            participant (email, Slack, etc.). They will sign up via magic link —
            no password required.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="inv-email">Email address</Label>
              <Input
                id="inv-email"
                type="email"
                placeholder="participant@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="inv-name">Full name</Label>
              <Input
                id="inv-name"
                placeholder="Amara Obi"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="inv-biz">Business name</Label>
              <Input
                id="inv-biz"
                placeholder="FreshBite Snacks"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
              />
            </div>
            {result && (
              <div
                className={`text-sm space-y-2 ${result.ok ? "text-green-600" : "text-red-600"}`}
              >
                <p>{result.message}</p>
                {result.inviteUrl && (
                  <div className="rounded border bg-gray-50 p-2 text-xs text-gray-800 break-all">
                    <p className="font-medium text-gray-600 mb-1">
                      Invitation link (copy and send):
                    </p>
                    <a href={result.inviteUrl} className="underline">
                      {result.inviteUrl}
                    </a>
                  </div>
                )}
              </div>
            )}
            <Button type="submit" disabled={loading}>
              {loading ? "Creating…" : "Create invitation"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
