import { randomBytes } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";

export type InvitationRow = {
  id: string;
  token: string;
  email: string;
  full_name: string | null;
  business_name: string | null;
  business_description: string | null;
  expires_at: string;
  is_used: boolean;
  used_by: string | null;
};

export function generateInvitationToken(): string {
  return randomBytes(32).toString("hex");
}

export function invitationExpiresAt(days = 7): string {
  const expires = new Date();
  expires.setDate(expires.getDate() + days);
  return expires.toISOString();
}

function getSiteUrl(): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL;

  if (!base) {
    if (process.env.NODE_ENV !== "development") {
      throw new Error("NEXT_PUBLIC_SITE_URL must be set");
    }
    return "http://localhost:3000";
  }

  return base.replace(/\/$/, "");
}

export function buildInviteUrl(token: string): string {
  return `${getSiteUrl()}/accept-invite?token=${token}`;
}

export function baseInviteUrl(): string {
  return `${getSiteUrl()}/accept-invite`;
}

export async function getInvitationByToken(
  token: string,
): Promise<{ invitation: InvitationRow | null; error?: string }> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("invitations")
    .select("*")
    .eq("token", token)
    .maybeSingle();

  if (error) {
    return { invitation: null, error: error.message };
  }

  if (!data) {
    return { invitation: null, error: "Invalid invitation link" };
  }

  const invitation = data as InvitationRow;

  if (invitation.is_used) {
    return { invitation: null, error: "This invitation has already been used" };
  }

  if (new Date(invitation.expires_at) < new Date()) {
    return { invitation: null, error: "This invitation has expired" };
  }

  return { invitation };
}

export async function markInvitationUsed(
  token: string,
  clerkUserId: string,
): Promise<void> {
  const supabase = createAdminClient();
  const {data, error} = await supabase
    .from("invitations")
    .update({ is_used: true, used_by: clerkUserId })
    .eq("token", token)
    .eq("is_used", false)
    .select("token")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error("Invitation is invalid or has already been used");
  }
}
