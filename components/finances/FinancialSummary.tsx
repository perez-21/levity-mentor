import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
  totalRevenue: number;
  totalExpenses: number;
  initialCapital: number;
}

function fmt(n: number) {
  return `₦${n.toLocaleString("en-NG")}`;
}

export function FinancialSummary({ totalRevenue, totalExpenses, initialCapital }: Props) {
  const profit = totalRevenue - totalExpenses;
  const capitalRemaining = initialCapital - totalExpenses;

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      <Card>
        <CardHeader className="pb-1">
          <CardTitle className="text-xs font-medium text-gray-500 uppercase tracking-wide">Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-green-600">{fmt(totalRevenue)}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-1">
          <CardTitle className="text-xs font-medium text-gray-500 uppercase tracking-wide">Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-red-500">{fmt(totalExpenses)}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-1">
          <CardTitle className="text-xs font-medium text-gray-500 uppercase tracking-wide">Profit / Loss</CardTitle>
        </CardHeader>
        <CardContent>
          <p className={`text-2xl font-bold ${profit >= 0 ? "text-green-600" : "text-red-500"}`}>
            {profit >= 0 ? "+" : ""}{fmt(profit)}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-1">
          <CardTitle className="text-xs font-medium text-gray-500 uppercase tracking-wide">Capital Left</CardTitle>
        </CardHeader>
        <CardContent>
          <p className={`text-2xl font-bold ${capitalRemaining >= 0 ? "text-gray-800" : "text-red-500"}`}>
            {fmt(capitalRemaining)}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
