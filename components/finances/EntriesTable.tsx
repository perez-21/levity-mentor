import { format, parseISO } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface Entry {
  id: string;
  amount: number | string;
  description?: string | null;
  category?: string | null;
  date: string;
}

interface Props {
  entries: Entry[];
  type: "revenue" | "expense";
}

export function EntriesTable({ entries, type }: Props) {
  if (entries.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-sm text-gray-500">
          No {type} entries yet.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base capitalize">{type} History</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              {type === "expense" && <TableHead>Category</TableHead>}
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map((e) => (
              <TableRow key={e.id}>
                <TableCell className="text-sm text-gray-500 whitespace-nowrap">
                  {format(parseISO(e.date), "MMM d, yyyy")}
                </TableCell>
                <TableCell className="text-sm">{e.description || "—"}</TableCell>
                {type === "expense" && (
                  <TableCell>
                    {e.category ? (
                      <Badge variant="secondary" className="text-xs">{e.category}</Badge>
                    ) : "—"}
                  </TableCell>
                )}
                <TableCell className="text-right font-medium text-sm">
                  ₦{Number(e.amount).toLocaleString("en-NG")}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
