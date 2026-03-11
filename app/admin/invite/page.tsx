"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function InvitePage() {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setResult(null);
    setLoading(true);

    const res = await fetch("/api/admin/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, fullName, businessName }),
    });

    if (res.ok) {
      setResult({ ok: true, message: `Invite sent to ${email}` });
      setEmail("");
      setFullName("");
      setBusinessName("");
    } else {
      const data = await res.json();
      setResult({ ok: false, message: data.error ?? "Failed to send invite" });
    }

    setLoading(false);
  }

  return (
    <div className="max-w-md space-y-6">
      <h1 className="text-2xl font-bold">Invite Participant</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Send invite email</CardTitle>
          <CardDescription>
            The participant will receive an email to set their password and access the platform.
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
              <Label htmlFor="inv-biz">Business name (optional)</Label>
              <Input
                id="inv-biz"
                placeholder="FreshBite Snacks"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
              />
            </div>
            {result && (
              <p className={`text-sm ${result.ok ? "text-green-600" : "text-red-600"}`}>
                {result.message}
              </p>
            )}
            <Button type="submit" disabled={loading}>
              {loading ? "Sending…" : "Send invite"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
