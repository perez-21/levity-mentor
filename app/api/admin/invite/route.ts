import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  // Verify caller is an admin
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { email, fullName, businessName } = await request.json();

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  const adminClient = createAdminClient();

  // Send Supabase invite email — this creates the auth.users row
  const { data: inviteData, error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(
    email,
    {
      data: {
        role: "participant",
        full_name: fullName || "",
        business_name: businessName || "",
        business_description: "",
      },
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/accept-invite`,
    }
  );

  if (inviteError) {
    return NextResponse.json({ error: inviteError.message }, { status: 500 });
  }

  // The trigger handle_new_user() auto-creates the profiles row from metadata.
  // Optionally patch the profile if the trigger doesn't fire in time:
  if (inviteData.user) {
    await adminClient.from("profiles").upsert({
      id: inviteData.user.id,
      role: "participant",
      full_name: fullName || "",
      business_name: businessName || "",
    });
  }

  return NextResponse.json({ success: true });
}
