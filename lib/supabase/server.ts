import { auth } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase/admin";

/** Server-side Supabase client scoped to the signed-in Clerk user. */
export async function createClient() {
  const { userId } = await auth();
  const supabase = createAdminClient();

  return {
    supabase,
    userId: userId ?? null,
    async requireUserId() {
      if (!userId) {
        throw new Error("Unauthorized");
      }
      return userId;
    },
  };
}
