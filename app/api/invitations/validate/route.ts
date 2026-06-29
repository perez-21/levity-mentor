import { NextRequest, NextResponse } from "next/server";
import { getInvitationByToken } from "@/lib/invitations";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Token is required" }, { status: 400 });
  }

  const { invitation, error } = await getInvitationByToken(token);

  if (!invitation) {
    return NextResponse.json({ error }, { status: 400 });
  }

  return NextResponse.json({
    email: invitation.email,
    fullName: invitation.full_name,
    businessName: invitation.business_name,
  });
}
