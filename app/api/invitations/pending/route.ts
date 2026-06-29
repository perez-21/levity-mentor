import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getInvitationByToken } from "@/lib/invitations";

/** Store optional business description on the invitation before magic link completes. */
export async function POST(request: NextRequest) {
  const { token, businessDescription } = await request.json();

  if (!token) {
    return NextResponse.json({ error: "Token is required" }, { status: 400 });
  }

  const { invitation, error } = await getInvitationByToken(token);

  if (!invitation) {
    return NextResponse.json({ error }, { status: 400 });
  }

  const supabase = createAdminClient();
  await supabase
    .from("invitations")
    .update({
      business_description: businessDescription?.trim() || null,
    })
    .eq("token", token);

  return NextResponse.json({ ok: true });
}
