import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageHeader, Panel, StatCard } from "@/components/dashboard-ui";
import { fetchActiveSessions } from "@/lib/api";
import { Activity, Gauge, HardDrive } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_app/sessions")({
  component: SessionsPage,
});

function SessionsPage() {
  const {
    data: activeSessions,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["activeSessions"],
    queryFn: fetchActiveSessions,
    enabled: typeof window !== "undefined",
  });

  if (isLoading) {
    return <div className="p-6">Loading active sessions…</div>;
  }

  if (error || !activeSessions) {
    return <div className="p-6 text-destructive">Unable to load live sessions.</div>;
  }

  const totalRate = activeSessions.reduce((s, x) => s + x.rateMbps, 0);
  const totalData = activeSessions.reduce((s, x) => s + x.dataMb, 0);
  return (
    <div>
      <PageHeader
        title="Active Sessions"
        description="Live view of every connected device on the mesh."
        actions={
          <div className="flex items-center gap-2 rounded-md border border-success/30 bg-success/10 px-2.5 py-1 text-[11px] font-mono uppercase tracking-wider text-success">
            <span className="h-1.5 w-1.5 rounded-full bg-success pulse-dot" /> streaming
          </div>
        }
      />
      <div className="grid gap-4 p-6 md:grid-cols-3">
        <StatCard
          label="Concurrent users"
          value={String(activeSessions.length)}
          icon={<Activity className="h-5 w-5" />}
          accent="primary"
        />
        <StatCard
          label="Aggregate throughput"
          value={`${totalRate.toFixed(1)} Mbps`}
          icon={<Gauge className="h-5 w-5" />}
          accent="info"
        />
        <StatCard
          label="Data this hour"
          value={`${(totalData / 1024).toFixed(2)} GB`}
          icon={<HardDrive className="h-5 w-5" />}
          accent="success"
        />
      </div>
      <div className="px-6 pb-6">
        <Panel>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>MAC</TableHead>
                <TableHead>Device</TableHead>
                <TableHead>Node</TableHead>
                <TableHead>IP</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Started</TableHead>
                <TableHead className="text-right">Duration</TableHead>
                <TableHead className="text-right">Data</TableHead>
                <TableHead className="text-right">Rate</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activeSessions.map((s) => (
                <TableRow key={s.id} className="font-mono text-xs">
                  <TableCell className="font-semibold">{s.mac}</TableCell>
                  <TableCell className="text-muted-foreground">{s.device}</TableCell>
                  <TableCell>{s.node}</TableCell>
                  <TableCell>{s.ip}</TableCell>
                  <TableCell>
                    <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] uppercase">
                      {s.plan}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{s.startedAt}</TableCell>
                  <TableCell className="text-right">{s.durationMin}m</TableCell>
                  <TableCell className="text-right">{s.dataMb} MB</TableCell>
                  <TableCell className="text-right text-primary">{s.rateMbps} Mbps</TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs text-destructive hover:text-destructive"
                    >
                      Disconnect
                    </Button>
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
