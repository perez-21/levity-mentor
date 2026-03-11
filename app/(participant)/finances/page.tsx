import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RevenueForm } from "@/components/finances/RevenueForm";
import { ExpenseForm } from "@/components/finances/ExpenseForm";
import { EntriesTable } from "@/components/finances/EntriesTable";
import { ProfileForm } from "@/components/finances/ProfileForm";

export default async function FinancesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: profile }, { data: revenue }, { data: expenses }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("revenue_entries").select("*").eq("user_id", user.id).order("date", { ascending: false }),
    supabase.from("expense_entries").select("*").eq("user_id", user.id).order("date", { ascending: false }),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Finances</h1>

      <Tabs defaultValue="revenue">
        <TabsList>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="profile">Business Profile</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-6 mt-6">
          <RevenueForm />
          <EntriesTable entries={revenue ?? []} type="revenue" />
        </TabsContent>

        <TabsContent value="expenses" className="space-y-6 mt-6">
          <ExpenseForm />
          <EntriesTable entries={expenses ?? []} type="expense" />
        </TabsContent>

        <TabsContent value="profile" className="mt-6">
          <ProfileForm
            businessName={profile?.business_name ?? ""}
            businessDescription={profile?.business_description ?? ""}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
