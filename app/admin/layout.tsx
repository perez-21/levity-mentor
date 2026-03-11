import Link from "next/link";
import NavLink from "@/components/ui/NavLink";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { LogoutButton } from "@/components/LogoutButton";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") redirect("/dashboard");

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="font-semibold text-sm">Levity Admin</span>
            <nav className="hidden sm:flex gap-4 text-sm">
              <NavLink href="/admin">Overview</NavLink>
              <NavLink href="/admin/invite">Invite Participant</NavLink>
            </nav>
            <div className="sm:hidden"> {/* mobile */} </div>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <span>{user.email}</span>
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
