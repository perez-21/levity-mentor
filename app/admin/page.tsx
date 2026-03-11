import { createAdminClient } from "@/lib/supabase/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import Link from "next/link";

function fmt(n: number) {
  return `₦${n.toLocaleString("en-NG")}`;
}

export default async function AdminOverviewPage() {
  const admin = createAdminClient();

  // Fetch all participants with their financial totals
  const { data: participants } = await admin
    .from("profiles")
    .select("id, full_name, business_name, initial_capital")
    .eq("role", "participant")
    .order("created_at", { ascending: false });

  const ids = (participants ?? []).map((p) => p.id);

  const [{ data: revenue }, { data: expenses }] = await Promise.all([
    admin.from("revenue_entries").select("user_id, amount").in("user_id", ids),
    admin.from("expense_entries").select("user_id, amount").in("user_id", ids),
  ]);

  // Aggregate per participant
  const revenueByUser = new Map<string, number>();
  const expensesByUser = new Map<string, number>();
  for (const r of revenue ?? []) {
    revenueByUser.set(r.user_id, (revenueByUser.get(r.user_id) ?? 0) + Number(r.amount));
  }
  for (const e of expenses ?? []) {
    expensesByUser.set(e.user_id, (expensesByUser.get(e.user_id) ?? 0) + Number(e.amount));
  }

  const rows = (participants ?? []).map((p) => {
    const rev = revenueByUser.get(p.id) ?? 0;
    const exp = expensesByUser.get(p.id) ?? 0;
    return { ...p, totalRevenue: rev, totalExpenses: exp, profit: rev - exp };
  });

  // Cohort totals
  const cohortRevenue = rows.reduce((s, r) => s + r.totalRevenue, 0);
  const cohortExpenses = rows.reduce((s, r) => s + r.totalExpenses, 0);
  const profitable = rows.filter((r) => r.profit > 0).length;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Cohort Overview</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-xs font-medium text-gray-500 uppercase tracking-wide">Participants</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{rows.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{fmt(cohortRevenue)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-500">{fmt(cohortExpenses)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-xs font-medium text-gray-500 uppercase tracking-wide">Profitable</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{profitable} <span className="text-base font-normal text-gray-400">/ {rows.length}</span></p>
          </CardContent>
        </Card>
      </div>

      {/* Participant table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Participants</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {rows.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">No participants yet. <Link href="/admin/invite" className="underline">Invite one.</Link></p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Business</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                  <TableHead className="text-right">Expenses</TableHead>
                  <TableHead className="text-right">Profit / Loss</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.full_name || "—"}</TableCell>
                    <TableCell className="text-gray-600">{p.business_name || "—"}</TableCell>
                    <TableCell className="text-right text-green-600">{fmt(p.totalRevenue)}</TableCell>
                    <TableCell className="text-right text-red-500">{fmt(p.totalExpenses)}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant={p.profit >= 0 ? "default" : "destructive"}>
                        {p.profit >= 0 ? "+" : ""}{fmt(p.profit)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Link href={`/admin/participants/${p.id}`} className="text-sm text-blue-600 hover:underline">
                        View
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
