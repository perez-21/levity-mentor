import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import {
  createProfileFromInvitation,
  getProfile,
} from "@/lib/auth";
import {
  getInvitationByToken,
  markInvitationUsed,
} from "@/lib/invitations";

export async function POST(request: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await currentUser();
  const email = user?.emailAddresses[0]?.emailAddress;

  if (!email) {
    return NextResponse.json({ error: "No email on account" }, { status: 400 });
  }

  const { token } = await request.json();

  if (!token) {
    return NextResponse.json({ error: "Token is required" }, { status: 400 });
  }

  const { invitation, error } = await getInvitationByToken(token);

  if (!invitation) {
    return NextResponse.json({ error }, { status: 400 });
  }

  if (email.trim().toLowerCase() !== invitation.email.trim().toLowerCase()) {
    return NextResponse.json(
      { error: "Email does not match this invitation" },
      { status: 403 }
    );
  }

  const existing = await getProfile(userId);

  if (!existing) {
    await createProfileFromInvitation({
      clerkUserId: userId,
      email,
      fullName: invitation.full_name,
      businessName: invitation.business_name,
      businessDescription: invitation.business_description,
    });
  }

  await markInvitationUsed(token, userId);

  return NextResponse.json({ ok: true });
}
