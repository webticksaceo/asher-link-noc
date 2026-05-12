import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { PageHeader, Panel, StatusDot } from "@/components/dashboard-ui";
import { fetchNodes } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, RefreshCw, Power, Settings2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/toast";

export const Route = createFileRoute("/_app/nodes")({
  component: NodesPage,
});

function NodesPage() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const {
    data: nodes,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["nodes"],
    queryFn: fetchNodes,
    enabled: typeof window !== "undefined",
  });

  const handleProvisionAP = async (formData: FormData) => {
    const data = Object.fromEntries(formData);
    try {
      const response = await fetch('/api/nodes/provision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (response.ok) {
        setModalOpen(false);
        queryClient.invalidateQueries({ queryKey: ['nodes'] });
        toast.success('Access Point provisioned successfully');
      } else {
        toast.error('Failed to provision Access Point');
      }
    } catch (error) {
      toast.error('Error provisioning Access Point');
    }
  };

  if (isLoading) {
    return <div className="p-6">Loading nodes…</div>;
  }

  if (error || !nodes) {
    return <div className="p-6 text-destructive">Unable to load nodes.</div>;
  }

  const aps = nodes.filter((n) => n.type === "AP");
  return (
    <div>
      <PageHeader
        title="Access Points"
        description="MikroTik hotspot nodes serving captive portals."
        actions={
          <>
            <Input placeholder="Filter…" className="h-9 w-48 bg-card/60 font-mono text-xs" />
            <Button size="sm" variant="outline">
              <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Sync
            </Button>
            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="mr-1.5 h-3.5 w-3.5" /> Provision AP
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Provision New Access Point</DialogTitle>
                  <DialogDescription>
                    Add a new MikroTik access point to your hotspot network.
                  </DialogDescription>
                </DialogHeader>
                <form action={handleProvisionAP} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="node_name">Node Name</Label>
                      <Input id="node_name" name="node_name" placeholder="e.g., AP-DOWNTOWN-01" required />
                    </div>
                    <div>
                      <Label htmlFor="node_location">Location</Label>
                      <Input id="node_location" name="node_location" placeholder="e.g., Downtown Mall" required />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="ip_address">IP Address</Label>
                      <Input id="ip_address" name="ip_address" placeholder="192.168.1.100" required />
                    </div>
                    <div>
                      <Label htmlFor="mac_address">MAC Address</Label>
                      <Input id="mac_address" name="mac_address" placeholder="00:0C:42:1A:2B:3C" required />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="router_model">Router Model</Label>
                      <Select name="router_model" defaultValue="hap-ac2">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hap-ac2">HAP ac²</SelectItem>
                          <SelectItem value="hap-ac3">HAP ac³</SelectItem>
                          <SelectItem value="cap">CAP</SelectItem>
                          <SelectItem value="crs-305">CRS-305</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="firmware_version">Firmware Version</Label>
                      <Input id="firmware_version" name="firmware_version" placeholder="7.x" required />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="uplink_interface">Uplink Interface</Label>
                      <Input id="uplink_interface" name="uplink_interface" placeholder="e.g., ether1" required />
                    </div>
                    <div>
                      <Label htmlFor="ssid">WiFi SSID</Label>
                      <Input id="ssid" name="ssid" placeholder="Asher-WiFi" required />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="notes">Setup Notes (optional)</Label>
                    <Input id="notes" name="notes" placeholder="e.g., Installed on roof, connected to main trunk" />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Provision Access Point</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </>
        }
      />
      <div className="p-6">
        <Panel>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Node</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>IP / MAC</TableHead>
                <TableHead className="text-right">Clients</TableHead>
                <TableHead className="text-right">Throughput</TableHead>
                <TableHead className="text-right">Signal</TableHead>
                <TableHead className="text-right">CPU / RAM</TableHead>
                <TableHead>Firmware</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {aps.map((n) => (
                <TableRow key={n.id} className="font-mono text-xs">
                  <TableCell className="font-semibold text-foreground">{n.name}</TableCell>
                  <TableCell className="text-muted-foreground">{n.location}</TableCell>
                  <TableCell>
                    <div>{n.ip}</div>
                    <div className="text-[10px] text-muted-foreground">{n.mac}</div>
                  </TableCell>
                  <TableCell className="text-right">{n.clients}</TableCell>
                  <TableCell className="text-right">{n.throughputMbps} Mbps</TableCell>
                  <TableCell className="text-right">{n.signal} dBm</TableCell>
                  <TableCell className="text-right">
                    {n.cpu}% / {n.memory}%
                  </TableCell>
                  <TableCell>{n.firmware}</TableCell>
                  <TableCell>
                    <StatusDot status={n.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button size="icon" variant="ghost" className="h-7 w-7">
                        <Settings2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7">
                        <Power className="h-3.5 w-3.5" />
                      </Button>
                    </div>
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
