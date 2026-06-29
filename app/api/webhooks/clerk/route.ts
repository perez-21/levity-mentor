import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "svix";
import { createAdminClient } from "@/lib/supabase/admin";
import { createProfileFromInvitation } from "@/lib/auth";

type ClerkUserEvent = {
  type: string;
  data: {
    id: string;
    email_addresses: { email_address: string }[];
    first_name?: string | null;
    last_name?: string | null;
  };
};

export async function POST(request: NextRequest) {
  const secret = process.env.CLERK_WEBHOOK_SECRET;

  if (!secret) {
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  const payload = await request.text();
  const headers = {
    "svix-id": request.headers.get("svix-id") ?? "",
    "svix-timestamp": request.headers.get("svix-timestamp") ?? "",
    "svix-signature": request.headers.get("svix-signature") ?? "",
  };

  let event: ClerkUserEvent;

  try {
    const wh = new Webhook(secret);
    event = wh.verify(payload, headers) as ClerkUserEvent;
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type !== "user.created") {
    return NextResponse.json({ ok: true });
  }

  const email = event.data.email_addresses[0]?.email_address;

  if (!email) {
    return NextResponse.json({ ok: true });
  }

  const supabase = createAdminClient();
  const normalized = email.trim().toLowerCase();

  const { data: invitation } = await supabase
    .from("invitations")
    .select("*")
    .eq("email", normalized)
    .eq("is_used", false)
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", event.data.id)
    .maybeSingle();

  if (!existingProfile && !invitation) {
    return NextResponse.json({ ok: true });
  }
  if (!existingProfile) {
    await createProfileFromInvitation({
      clerkUserId: event.data.id,
      email: normalized,
      fullName: invitation?.full_name ?? null,
      businessName: invitation?.business_name ?? null,
      businessDescription: invitation?.business_description ?? null,
    });
  }

  if (invitation) {
    const { error } = await supabase
      .from("invitations")
      .update({ is_used: true, used_by: event.data.id })
      .eq("id", invitation.id)
      .eq("is_used", false);

      if (error) {
        return NextResponse.json({ error: "Could not consume invitation" }, { status: 500 });
      }
  }

  return NextResponse.json({ ok: true });
}
