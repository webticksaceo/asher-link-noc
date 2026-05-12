import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageHeader, Panel, StatCard } from "@/components/dashboard-ui";
import { fmtCurrency } from "@/lib/mock-data";
import { fetchRevenue7d, fetchTransactions } from "@/lib/api";
import { DollarSign, TrendingUp, Wallet, CreditCard } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/_app/revenue")({
  component: RevenuePage,
});

function RevenuePage() {
  const {
    data: revenue7d,
    isLoading: revenueLoading,
    error: revenueError,
  } = useQuery({
    queryKey: ["revenue7d"],
    queryFn: fetchRevenue7d,
    enabled: typeof window !== "undefined",
  });
  const {
    data: transactions,
    isLoading: transactionsLoading,
    error: transactionsError,
  } = useQuery({
    queryKey: ["transactions"],
    queryFn: fetchTransactions,
    enabled: typeof window !== "undefined",
  });

  if (revenueLoading || transactionsLoading) {
    return <div className="p-6">Loading revenue data…</div>;
  }

  if (revenueError || transactionsError || !revenue7d || !transactions) {
    return <div className="p-6 text-destructive">Unable to load revenue data.</div>;
  }

  const total = revenue7d.reduce((s, d) => s + d.topups + d.vouchers + d.ads, 0);
  const topups = revenue7d.reduce((s, d) => s + d.topups, 0);
  const vouchers = revenue7d.reduce((s, d) => s + d.vouchers, 0);
  const adsRev = revenue7d.reduce((s, d) => s + d.ads, 0);
  return (
    <div>
      <PageHeader title="Revenue" description="Earnings from prepaid top-ups, vouchers and ads." />
      <div className="grid gap-4 p-6 md:grid-cols-4">
        <StatCard
          label="Total (7d)"
          value={fmtCurrency(total)}
          icon={<DollarSign className="h-5 w-5" />}
          delta="+18.4% WoW"
          accent="primary"
        />
        <StatCard
          label="Wallet top-ups"
          value={fmtCurrency(topups)}
          icon={<Wallet className="h-5 w-5" />}
          accent="success"
        />
        <StatCard
          label="Voucher sales"
          value={fmtCurrency(vouchers)}
          icon={<CreditCard className="h-5 w-5" />}
          accent="info"
        />
        <StatCard
          label="Ad revenue"
          value={fmtCurrency(adsRev)}
          icon={<TrendingUp className="h-5 w-5" />}
          accent="warning"
        />
      </div>
      <div className="px-6 pb-6">
        <Panel title="Daily revenue mix">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenue7d}>
                <CartesianGrid stroke="oklch(0.28 0.025 240)" strokeDasharray="2 4" />
                <XAxis dataKey="day" stroke="oklch(0.65 0.02 220)" fontSize={11} />
                <YAxis stroke="oklch(0.65 0.02 220)" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    background: "oklch(0.20 0.025 240)",
                    border: "1px solid oklch(0.28 0.025 240)",
                    borderRadius: 6,
                    fontSize: 12,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line
                  type="monotone"
                  dataKey="topups"
                  stroke="oklch(0.82 0.16 195)"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="vouchers"
                  stroke="oklch(0.78 0.18 150)"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="ads"
                  stroke="oklch(0.82 0.17 80)"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>
      <div className="px-6 pb-6">
        <Panel title="Transaction ledger">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>MAC</TableHead>
                <TableHead>Node</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Method</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((t) => (
                <TableRow key={t.id} className="font-mono text-xs">
                  <TableCell className="text-muted-foreground">{t.timestamp}</TableCell>
                  <TableCell>{t.mac}</TableCell>
                  <TableCell>{t.node}</TableCell>
                  <TableCell>
                    <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] uppercase">
                      {t.type}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground uppercase">{t.method}</TableCell>
                  <TableCell className="text-right text-success">
                    +{fmtCurrency(t.amount)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Panel>
      </div>
    </div>
  );
}
