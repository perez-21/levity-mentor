import { NextRequest, NextResponse } from "next/server";
import { profileExistsForEmail } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const { email } = await request.json();

  if (!email?.trim()) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  const exists = await profileExistsForEmail(email);

  if (!exists) {
    return NextResponse.json(
      {
        error:
          "No account found for this email. Use your invitation link to register, or contact your program admin.",
      },
      { status: 403 }
    );
  }

  return NextResponse.json({ ok: true });
}
