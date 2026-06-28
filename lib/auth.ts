import { auth, currentUser } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type Profile = {
  id: string;
  role: "participant" | "admin";
  email: string | null;
  full_name: string | null;
  business_name: string | null;
  business_description: string | null;
  initial_capital: number;
  created_at: string;
};

export async function getAuthUserId(): Promise<string | null> {
  const { userId } = await auth();
  return userId;
}

export async function requireAuthUserId(): Promise<string> {
  const userId = await getAuthUserId();
  if (!userId) {
    throw new Error("Unauthorized");
  }
  return userId;
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  return data as Profile | null;
}

export async function getCurrentProfile(): Promise<Profile | null> {
  const userId = await getAuthUserId();
  if (!userId) return null;
  return getProfile(userId);
}

export async function requireAdmin(): Promise<{ userId: string; profile: Profile }> {
  const userId = await requireAuthUserId();
  const profile = await getProfile(userId);

  if (!profile || profile.role !== "admin") {
    throw new Error("Forbidden");
  }

  return { userId, profile };
}

export async function getPrimaryEmail(): Promise<string | null> {
  const user = await currentUser();
  return user?.emailAddresses[0]?.emailAddress ?? null;
}

export async function profileExistsForEmail(email: string): Promise<boolean> {
  const supabase = createAdminClient();
  const normalized = email.trim().toLowerCase();
  const { count } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("email", normalized);

  return (count ?? 0) > 0;
}

export async function createProfileFromInvitation(params: {
  clerkUserId: string;
  email: string;
  fullName?: string | null;
  businessName?: string | null;
  businessDescription?: string | null;
  role?: "participant" | "admin";
}): Promise<void> {
  const supabase = createAdminClient();
  await supabase.from("profiles").upsert({
    id: params.clerkUserId,
    email: params.email.trim().toLowerCase(),
    role: params.role ?? "participant",
    full_name: params.fullName ?? "",
    business_name: params.businessName ?? "",
    business_description: params.businessDescription ?? "",
  });
}
