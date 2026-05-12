import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageHeader, Panel, StatCard, StatusDot } from "@/components/dashboard-ui";
import { fetchUsers } from "@/lib/api";
import { fmtCurrency } from "@/lib/mock-data";
import { Wallet, UserCheck, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/_app/users")({
  component: UsersPage,
});

function UsersPage() {
  const {
    data: users,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
    enabled: typeof window !== "undefined",
    refetchInterval: 5000, // Poll every 5 seconds for real-time updates
  });

  if (isLoading) {
    return <div className="p-6">Loading users…</div>;
  }

  if (error || !users) {
    return <div className="p-6 text-destructive">Unable to load users.</div>;
  }

  const float = users.reduce((s, u) => s + u.balance, 0);
  const lowBal = users.filter((u) => u.balance < 10).length;
  return (
    <div>
      <PageHeader
        title="Users & Wallets"
        description="Balances tracked per device MAC address."
        actions={
          <>
            <Input placeholder="Search MAC…" className="h-9 w-56 bg-card/60 font-mono text-xs" />
            <Button size="sm" variant="outline">
              Export CSV
            </Button>
            <Button size="sm">Top up wallet</Button>
          </>
        }
      />
      <div className="grid gap-4 p-6 md:grid-cols-3">
        <StatCard
          label="Active wallets"
          value={String(users.filter((u) => u.status === "active").length)}
          icon={<UserCheck className="h-5 w-5" />}
          accent="success"
        />
        <StatCard
          label="Wallet float"
          value={fmtCurrency(float)}
          icon={<Wallet className="h-5 w-5" />}
          accent="primary"
        />
        <StatCard
          label="Low balance (<10)"
          value={String(lowBal)}
          icon={<AlertCircle className="h-5 w-5" />}
          accent="warning"
        />
      </div>
      <div className="px-6 pb-6">
        <Panel>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>MAC</TableHead>
                <TableHead>Device</TableHead>
                <TableHead>Last node</TableHead>
                <TableHead className="text-right">Balance</TableHead>
                <TableHead className="text-right">Lifetime</TableHead>
                <TableHead className="text-right">Data</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last seen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id} className="font-mono text-xs">
                  <TableCell className="font-semibold">{u.mac}</TableCell>
                  <TableCell className="text-muted-foreground">{u.device}</TableCell>
                  <TableCell>{u.node}</TableCell>
                  <TableCell className="text-right">{fmtCurrency(u.balance)}</TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {fmtCurrency(u.lifetimeSpend)}
                  </TableCell>
                  <TableCell className="text-right">
                    {(u.dataUsedMb / 1024).toFixed(2)} GB
                  </TableCell>
                  <TableCell>
                    <StatusDot status={u.status} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">{u.lastSeen}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Panel>
      </div>
    </div>
  );
}
