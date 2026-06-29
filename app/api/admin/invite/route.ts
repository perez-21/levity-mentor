import { NextRequest, NextResponse, userAgent } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth";
import {
  buildInviteUrl,
  generateInvitationToken,
  invitationExpiresAt,
} from "@/lib/invitations";
import { clerkClient } from "@clerk/nextjs/server";

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { email, fullName, businessName } = await request.json();

  if (!email?.trim()) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  const client = await clerkClient();



  const normalized = email.trim().toLowerCase();
  const token = generateInvitationToken();
  const inviteUrl = buildInviteUrl(token);
  const EXPIRES_AT = 7;


  const invitation = await client.invitations.createInvitation({
    emailAddress: normalized,
    redirectUrl: inviteUrl + '&',
    expiresInDays: EXPIRES_AT

  });

  const supabase = createAdminClient();

  const { error } = await supabase.from("invitations").insert({
    token,
    email: invitation.emailAddress,
    status: invitation.status, 
    full_name: fullName?.trim() || null,
    business_name: businessName?.trim() || null,
    expires_at: invitationExpiresAt(EXPIRES_AT),
    created_at: new Date(invitation.createdAt).toISOString(),
  });

  if (error) {
    await client.invitations.revokeInvitation(invitation.id);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }


  return NextResponse.json({
    success: true,
    inviteUrl: invitation.url,
    invitationStatus: invitation.status,
    message: `Invitation created for ${normalized} has been sent. Alternatively, share the invite link with the participant.`,
  });
}
