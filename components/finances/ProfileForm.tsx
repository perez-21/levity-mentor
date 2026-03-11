"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface Props {
  businessName: string;
  businessDescription: string;
}

export function ProfileForm({ businessName: initialName, businessDescription: initialDesc }: Props) {
  const router = useRouter();
  const [businessName, setBusinessName] = useState(initialName);
  const [businessDescription, setBusinessDescription] = useState(initialDesc);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("profiles").update({ business_name: businessName, business_description: businessDescription }).eq("id", user.id);
    }
    setLoading(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Business Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
          <div className="space-y-2">
            <Label htmlFor="biz-name">Business name</Label>
            <Input
              id="biz-name"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="e.g. FreshBite Snacks"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="biz-desc">Business description</Label>
            <Textarea
              id="biz-desc"
              rows={5}
              value={businessDescription}
              onChange={(e) => setBusinessDescription(e.target.value)}
              placeholder="Describe what you sell, who your customers are, and how you make money."
            />
            <p className="text-xs text-gray-500">This is shared with your AI mentor for context.</p>
          </div>
          <Button type="submit" disabled={loading}>
            {saved ? "Saved!" : loading ? "Saving…" : "Save profile"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
