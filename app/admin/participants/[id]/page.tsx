import { createAdminClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";
import { FinancialSummary } from "@/components/finances/FinancialSummary";
import { FinancialCharts } from "@/components/finances/FinancialCharts";
import { EntriesTable } from "@/components/finances/EntriesTable";
import { AdminChatLog } from "@/components/admin/AdminChatLog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ParticipantDetailPage({ params }: Props) {
  const { id } = await params;
  const admin = createAdminClient();

  const [{ data: profile }, { data: revenue }, { data: expenses }, { data: chatMessages }] =
    await Promise.all([
      admin.from("profiles").select("*").eq("id", id).single(),
      admin.from("revenue_entries").select("*").eq("user_id", id).order("date", { ascending: false }),
      admin.from("expense_entries").select("*").eq("user_id", id).order("date", { ascending: false }),
      admin.from("chat_messages").select("*").eq("user_id", id).order("created_at", { ascending: true }),
    ]);

  if (!profile) notFound();

  const totalRevenue = (revenue ?? []).reduce((s, r) => s + Number(r.amount), 0);
  const totalExpenses = (expenses ?? []).reduce((s, e) => s + Number(e.amount), 0);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin" className="text-sm text-gray-500 hover:text-gray-700">← Back to overview</Link>
        <h1 className="text-2xl font-bold mt-2">{profile.full_name || "Unnamed participant"}</h1>
        {profile.business_name && (
          <p className="text-gray-500">{profile.business_name}</p>
        )}
        {profile.business_description && (
          <p className="text-sm text-gray-400 mt-1 max-w-2xl">{profile.business_description}</p>
        )}
      </div>

      <FinancialSummary
        totalRevenue={totalRevenue}
        totalExpenses={totalExpenses}
        initialCapital={Number(profile.initial_capital ?? 500000)}
      />

      <FinancialCharts
        revenue={(revenue ?? []).map((r) => ({ date: r.date, amount: r.amount }))}
        expenses={(expenses ?? []).map((e) => ({ date: e.date, amount: e.amount }))}
      />

      <Tabs defaultValue="revenue">
        <TabsList>
          <TabsTrigger value="revenue">Revenue ({revenue?.length ?? 0})</TabsTrigger>
          <TabsTrigger value="expenses">Expenses ({expenses?.length ?? 0})</TabsTrigger>
          <TabsTrigger value="chat">Chat History ({chatMessages?.length ?? 0})</TabsTrigger>
        </TabsList>
        <TabsContent value="revenue" className="mt-4">
          <EntriesTable entries={revenue ?? []} type="revenue" />
        </TabsContent>
        <TabsContent value="expenses" className="mt-4">
          <EntriesTable entries={expenses ?? []} type="expense" />
        </TabsContent>
        <TabsContent value="chat" className="mt-4">
          <AdminChatLog messages={chatMessages ?? []} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
