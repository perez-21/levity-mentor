import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(request: NextRequest) {
  const db = await createClient();
  const userId = db.userId;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { businessName, businessDescription } = await request.json();

  const { error } = await db.supabase
    .from("profiles")
    .update({
      business_name: businessName ?? "",
      business_description: businessDescription ?? "",
    })
    .eq("id", userId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
