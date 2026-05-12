import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageHeader, Panel, StatusDot, StatCard } from "@/components/dashboard-ui";
import { fetchNodes } from "@/lib/api";
import { Network, Activity, Gauge } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/_app/backhauls")({
  component: BackhaulsPage,
});

function BackhaulsPage() {
  const {
    data: nodes,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["nodes"],
    queryFn: fetchNodes,
    enabled: typeof window !== "undefined",
  });

  if (isLoading) {
    return <div className="p-6">Loading backhauls…</div>;
  }

  if (error || !nodes) {
    return <div className="p-6 text-destructive">Unable to load backhaul links.</div>;
  }

  const bh = nodes.filter((n) => n.type === "Backhaul");
  const totalThroughput = bh.reduce((s, n) => s + n.throughputMbps, 0);
  const online = bh.filter((n) => n.status === "online").length;
  return (
    <div>
      <PageHeader title="Backhauls" description="Point-to-point links carrying mesh traffic." />
      <div className="grid gap-4 p-6 md:grid-cols-3">
        <StatCard
          label="Backhauls online"
          value={`${online} / ${bh.length}`}
          icon={<Network className="h-5 w-5" />}
          accent="success"
        />
        <StatCard
          label="Aggregate throughput"
          value={`${totalThroughput.toLocaleString()} Mbps`}
          icon={<Activity className="h-5 w-5" />}
          accent="primary"
        />
        <StatCard
          label="Worst link"
          value="-68 dBm"
          delta="BH-EST-03 · degraded"
          icon={<Gauge className="h-5 w-5" />}
          accent="warning"
        />
      </div>
      <div className="px-6 pb-6">
        <Panel>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Link</TableHead>
                <TableHead>Site</TableHead>
                <TableHead>IP</TableHead>
                <TableHead className="text-right">Throughput</TableHead>
                <TableHead className="text-right">Signal</TableHead>
                <TableHead className="text-right">Uptime</TableHead>
                <TableHead>Firmware</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bh.map((n) => (
                <TableRow key={n.id} className="font-mono text-xs">
                  <TableCell className="font-semibold">{n.name}</TableCell>
                  <TableCell className="text-muted-foreground">{n.location}</TableCell>
                  <TableCell>{n.ip}</TableCell>
                  <TableCell className="text-right">{n.throughputMbps} Mbps</TableCell>
                  <TableCell className="text-right">{n.signal} dBm</TableCell>
                  <TableCell className="text-right">{n.uptime}</TableCell>
                  <TableCell>{n.firmware}</TableCell>
                  <TableCell>
                    <StatusDot status={n.status} />
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
