"use client";

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";
import { format, parseISO } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Entry {
  date: string;
  amount: number | string;
}

interface Props {
  revenue: Entry[];
  expenses: Entry[];
}

function buildTimeSeries(entries: Entry[]) {
  const map = new Map<string, number>();
  for (const e of entries) {
    const key = e.date.slice(0, 10);
    map.set(key, (map.get(key) ?? 0) + Number(e.amount));
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, amount]) => ({ date, amount }));
}

function fmt(v: number) {
  return `₦${v.toLocaleString("en-NG")}`;
}

export function FinancialCharts({ revenue, expenses }: Props) {
  const revSeries = buildTimeSeries(revenue);
  const expSeries = buildTimeSeries(expenses);

  // Merge into combined series for a single chart
  const allDates = [...new Set([...revSeries.map((r) => r.date), ...expSeries.map((e) => e.date)])].sort();
  const combined = allDates.map((date) => ({
    date,
    Revenue: revSeries.find((r) => r.date === date)?.amount ?? null,
    Expenses: expSeries.find((e) => e.date === date)?.amount ?? null,
  }));

  if (combined.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Financial Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 py-8 text-center">No entries yet. Add revenue or expenses to see your chart.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Revenue vs Expenses Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={combined} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="date"
              tickFormatter={(v) => format(parseISO(v), "MMM d")}
              tick={{ fontSize: 12 }}
            />
            <YAxis tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 12 }} />
            <Tooltip formatter={(v) => (typeof v === "number" ? fmt(v) : String(v))} labelFormatter={(l) => format(parseISO(l as string), "MMM d, yyyy")} />
            <Legend />
            <Line type="monotone" dataKey="Revenue" stroke="#16a34a" strokeWidth={2} dot={false} connectNulls />
            <Line type="monotone" dataKey="Expenses" stroke="#ef4444" strokeWidth={2} dot={false} connectNulls />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
