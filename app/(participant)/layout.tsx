import NavLink from "@/components/ui/NavLink";
import MobileNav from "@/components/ui/MobileNav";
import { createClient } from "@/lib/supabase/server";
import { getPrimaryEmail } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LogoutButton } from "@/components/LogoutButton";
import ProfilePills from "@/components/ui/ProfilePills";

export default async function ParticipantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { supabase, userId } = await createClient();

  if (!userId) redirect("/login");

  const [{ data: profile }, email] = await Promise.all([
    supabase.from("profiles").select("full_name, business_name").eq("id", userId).single(),
    getPrimaryEmail(),
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <MobileNav />
            <span className="font-semibold text-sm">Levity Mentor</span>
            <nav className="hidden sm:flex gap-4 text-sm ml-4">
              <NavLink href="/dashboard">Dashboard</NavLink>
              <NavLink href="/chat">AI Mentor</NavLink>
              <NavLink href="/finances">Finances</NavLink>
            </nav>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <ProfilePills
              name={profile?.full_name || email || "Participant"}
              business={profile?.business_name}
            />
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
