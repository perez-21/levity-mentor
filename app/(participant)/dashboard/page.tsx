import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { FinancialSummary } from "@/components/finances/FinancialSummary";
import { FinancialCharts } from "@/components/finances/FinancialCharts";
import Link from "next/link";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: profile }, { data: revenue }, { data: expenses }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("revenue_entries").select("*").eq("user_id", user.id).order("date", { ascending: true }),
    supabase.from("expense_entries").select("*").eq("user_id", user.id).order("date", { ascending: true }),
  ]);

  const totalRevenue = (revenue ?? []).reduce((sum, r) => sum + Number(r.amount), 0);
  const totalExpenses = (expenses ?? []).reduce((sum, e) => sum + Number(e.amount), 0);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          {profile?.business_name && (
            <p className="text-gray-500 text-sm mt-1">{profile.business_name}</p>
          )}
        </div>
        <Link
          href="/chat"
          className="inline-flex items-center rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/80 transition-colors"
        >
          Ask AI Mentor
        </Link>
      </div>

      <FinancialSummary
        totalRevenue={totalRevenue}
        totalExpenses={totalExpenses}
        initialCapital={Number(profile?.initial_capital ?? 500000)}
      />

      <FinancialCharts revenue={revenue ?? []} expenses={expenses ?? []} />

      {!profile?.business_description && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <strong>Tip:</strong> Add your business description in your profile so your AI mentor can give you better advice.{" "}
          <Link href="/finances" className="underline">Go to finances</Link>
        </div>
      )}
    </div>
  );
}
