import Link from "next/link";
import NavLink from "@/components/ui/NavLink";
import MobileNav from "@/components/ui/MobileNav";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { LogoutButton } from "@/components/LogoutButton";

export default async function ParticipantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, business_name")
    .eq("id", user.id)
    .single();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="font-semibold text-sm">Levity Mentor</span>
            <nav className="hidden sm:flex gap-4 text-sm">
              <NavLink href="/dashboard">Dashboard</NavLink>
              <NavLink href="/chat">AI Mentor</NavLink>
              <NavLink href="/finances">Finances</NavLink>
            </nav>
            <div className="sm:hidden">
              {/* Mobile nav drawer */}
              <MobileNav />
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <span>
              {profile?.business_name || profile?.full_name || user.email}
            </span>
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
