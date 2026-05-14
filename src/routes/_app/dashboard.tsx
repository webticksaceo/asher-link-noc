import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import {
  Activity,
  Users,
  Wallet,
  Wifi,
  Radio,
  AlertTriangle,
  ArrowUpRight,
  DollarSign,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { PageHeader, StatCard, Panel, StatusDot } from "@/components/dashboard-ui";
import { fmtCurrency } from "@/lib/mock-data";
import { fetchDashboardData, generateAlerts } from "@/lib/api";

export type DashboardData = Awaited<ReturnType<typeof fetchDashboardData>>;

export const Route = createFileRoute("/_app/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery<DashboardData>({
    queryKey: ["dashboard"],
    queryFn: fetchDashboardData,
    enabled: typeof window !== "undefined",
    refetchInterval: 5000, // Fallback polling
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${protocol}//${window.location.host}/ws`);
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'update') {
        queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      }
    };
    return () => ws.close();
  }, [queryClient]);

  if (isLoading) {
    return <div className="p-6">Loading dashboard data…</div>;
  }

  if (error || !data) {
    return (
      <div className="p-6 text-destructive">
        Unable to load dashboard data: {error instanceof Error ? error.message : "Unknown error"}
      </div>
    );
  }

  const onlineNodes = data.nodes.filter((n) => n.status === "online").length;
  const totalRevenue = data.revenue7d.reduce((s, d) => s + d.topups + d.vouchers + d.ads, 0);
  const totalBalance = data.users.reduce((s, u) => s + u.balance, 0);
  const alerts = generateAlerts(data.nodes, data.users);

  return (
    <div>
      <PageHeader
        title="Network Operations Center"
        description="Live overview of the prepaid WiFi mesh."
        actions={
          <div className="flex items-center gap-2 rounded-md border border-border bg-card/60 px-3 py-1.5 text-[11px] font-mono text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-success pulse-dot" /> live · refreshed now
          </div>
        }
      />

      <div className="grid gap-4 p-6 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Active Sessions"
          value={String(data.activeSessions.length)}
          delta="+12% vs yesterday"
          icon={<Activity className="h-5 w-5" />}
          accent="primary"
        />
        <StatCard
          label="Online Nodes"
          value={`${onlineNodes} / ${data.nodes.length}`}
          delta="2 backhauls · 6 APs"
          icon={<Radio className="h-5 w-5" />}
          accent="success"
        />
        <StatCard
          label="Revenue (7d)"
          value={fmtCurrency(totalRevenue)}
          delta="+18.4% WoW"
          icon={<DollarSign className="h-5 w-5" />}
          accent="info"
        />
        <StatCard
          label="Wallet Float"
          value={fmtCurrency(totalBalance)}
          delta={`${data.users.length} active wallets`}
          icon={<Wallet className="h-5 w-5" />}
          accent="warning"
        />
      </div>

      <div className="grid gap-4 px-6 pb-6 lg:grid-cols-3">
        <Panel
          title="Revenue · last 7 days"
          actions={
            <Link to="/revenue" className="text-xs text-primary hover:underline">
              Details →
            </Link>
          }
        >
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.revenue7d}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.82 0.16 195)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="oklch(0.82 0.16 195)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.78 0.18 150)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="oklch(0.78 0.18 150)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="g3" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.82 0.17 80)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="oklch(0.82 0.17 80)" stopOpacity={0} />
                  </linearGradient>
                </defs>
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
                <Area
                  type="monotone"
                  dataKey="topups"
                  stroke="oklch(0.82 0.16 195)"
                  fill="url(#g1)"
                />
                <Area
                  type="monotone"
                  dataKey="vouchers"
                  stroke="oklch(0.78 0.18 150)"
                  fill="url(#g2)"
                />
                <Area type="monotone" dataKey="ads" stroke="oklch(0.82 0.17 80)" fill="url(#g3)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Sessions per hour">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.sessionsHourly}>
                <CartesianGrid stroke="oklch(0.28 0.025 240)" strokeDasharray="2 4" />
                <XAxis dataKey="h" stroke="oklch(0.65 0.02 220)" fontSize={11} />
                <YAxis stroke="oklch(0.65 0.02 220)" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    background: "oklch(0.20 0.025 240)",
                    border: "1px solid oklch(0.28 0.025 240)",
                    borderRadius: 6,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="v" fill="oklch(0.82 0.16 195)" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      <div className="grid gap-4 px-6 pb-6 lg:grid-cols-3">
        <Panel
          title="Node health"
          actions={
            <Link to="/nodes" className="text-xs text-primary hover:underline">
              All nodes →
            </Link>
          }
        >
          <div className="space-y-2">
            {data.nodes.slice(0, 5).map((n) => (
              <div
                key={n.id}
                className="flex items-center justify-between rounded-md border border-border/50 bg-background/30 px-3 py-2 text-xs"
              >
                <div className="flex items-center gap-3">
                  <Wifi className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-mono">{n.name}</div>
                    <div className="text-[10px] text-muted-foreground">{n.location}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-mono text-muted-foreground">{n.clients} clients</span>
                  <StatusDot status={n.status} />
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel
          title="Latest transactions"
          actions={
            <Link to="/revenue" className="text-xs text-primary hover:underline">
              Ledger →
            </Link>
          }
        >
          <div className="space-y-2">
            {data.transactions.slice(0, 6).map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between border-b border-border/40 pb-2 text-xs last:border-0"
              >
                <div>
                  <div className="font-mono">{t.mac}</div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    {t.type} · {t.method}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-success">+{fmtCurrency(t.amount)}</div>
                  <div className="text-[10px] text-muted-foreground">
                    {t.timestamp.split(" ")[1]}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Alerts">
          <div className="space-y-2 text-xs">
            {alerts.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                No active alerts
              </div>
            ) : (
              alerts.map((alert) => {
                const icon = alert.severity === 'critical' ? AlertTriangle : 
                           alert.severity === 'warning' ? AlertTriangle : Users;
                const borderColor = alert.severity === 'critical' ? 'border-destructive/30' :
                                  alert.severity === 'warning' ? 'border-warning/30' : 'border-info/30';
                const bgColor = alert.severity === 'critical' ? 'bg-destructive/5' :
                              alert.severity === 'warning' ? 'bg-warning/5' : 'bg-info/5';
                const iconColor = alert.severity === 'critical' ? 'text-destructive' :
                                alert.severity === 'warning' ? 'text-warning' : 'text-info';
                
                return (
                  <div key={alert.id} className={`flex items-start gap-2 rounded-md border ${borderColor} ${bgColor} p-2.5`}>
                    <AlertTriangle className={`mt-0.5 h-4 w-4 shrink-0 ${iconColor}`} />
                    <div>
                      <div className="font-medium">{alert.title}</div>
                      <div className="text-[10px] text-muted-foreground">{alert.description}</div>
                    </div>
                  </div>
                );
              })
            )}
            <Link
              to="/notifications"
              className="mt-2 inline-flex items-center gap-1 text-xs text-primary hover:underline"
            >
              Send broadcast <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
        </Panel>
      </div>
    </div>
  );
}
