import { NextResponse } from "next/server";
import { getAuthUserId, getProfile } from "@/lib/auth";

export async function GET() {
  const userId = await getAuthUserId();

  if (!userId) {
    return NextResponse.json({ redirectTo: "/login" });
  }

  const profile = await getProfile(userId);

  return NextResponse.json({
    redirectTo: profile?.role === "admin" ? "/admin" : "/dashboard",
  });
}
