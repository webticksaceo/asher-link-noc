import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { PageHeader, Panel, StatCard } from "@/components/dashboard-ui";
import { fmtCurrency } from "@/lib/mock-data";
import { fetchAds } from "@/lib/api";
import { Megaphone, Eye, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/_app/ads")({
  component: AdsPage,
});

function AdsPage() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const {
    data: ads,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["ads"],
    queryFn: fetchAds,
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
        queryClient.invalidateQueries({ queryKey: ['ads'] });
      }
    };
    return () => ws.close();
  }, [queryClient]);

  const handleNewCampaign = async (formData: FormData) => {
    const data = Object.fromEntries(formData);
    try {
      const response = await fetch('/api/advertisements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (response.ok) {
        setModalOpen(false);
        queryClient.invalidateQueries({ queryKey: ['ads'] });
        toast.success('Campaign created');
      } else {
        toast.error('Failed to create campaign');
      }
    } catch (error) {
      toast.error('Error creating campaign');
    }
  };

  if (isLoading) {
    return <div className="p-6">Loading ads…</div>;
  }

  if (error || !ads) {
    return <div className="p-6 text-destructive">Unable to load ads.</div>;
  }

  const totalImpr = ads.reduce((s, a) => s + a.impressions, 0);
  const totalBudget = ads.reduce((s, a) => s + a.budget, 0);
  const totalActive = ads.filter((a) => a.active).length;
  const avgCpv = ads.length ? ads.reduce((s, a) => s + a.cpv_rate, 0) / ads.length : 0;

  return (
    <div>
      <PageHeader
        title="Ads"
        description="Manage active ad campaigns and portal creative from the advertisements collection."
        actions={
          <Dialog open={modalOpen} onOpenChange={setModalOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-1.5 h-3.5 w-3.5" /> New campaign
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden flex flex-col">
              <DialogHeader className="shrink-0">
                <DialogTitle>Create New Campaign</DialogTitle>
                <DialogDescription>
                  Add a new advertisement campaign to the portal.
                </DialogDescription>
              </DialogHeader>
              <form action={handleNewCampaign} className="space-y-4 overflow-y-auto flex-1 pr-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="ad_id">Ad ID</Label>
                    <Input id="ad_id" name="ad_id" required />
                  </div>
                  <div>
                    <Label htmlFor="ad_title">Ad Title</Label>
                    <Input id="ad_title" name="ad_title" required />
                  </div>
                </div>
                <div>
                  <Label htmlFor="campaign">Campaign</Label>
                  <Input id="campaign" name="campaign" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="campaign_start">Start Date</Label>
                    <Input id="campaign_start" name="campaign_start" type="datetime-local" required />
                  </div>
                  <div>
                    <Label htmlFor="campaign_end">End Date</Label>
                    <Input id="campaign_end" name="campaign_end" type="datetime-local" required />
                  </div>
                </div>
                <div>
                  <Label htmlFor="target_nodes">Target Nodes</Label>
                  <Input id="target_nodes" name="target_nodes" placeholder="all or node ids" required />
                </div>
                <div>
                  <Label htmlFor="ad_url">Ad URL</Label>
                  <Input id="ad_url" name="ad_url" placeholder="/ads/filename.mp4" required />
                </div>
                <div>
                  <Label htmlFor="target_url">Target URL</Label>
                  <Input id="target_url" name="target_url" placeholder="https://example.com" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="ad_type">Ad Type</Label>
                    <Select name="ad_type">
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="banner">Banner</SelectItem>
                        <SelectItem value="video">Video</SelectItem>
                        <SelectItem value="interstitial">Interstitial</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="ad_duration">Duration (seconds)</Label>
                    <Input id="ad_duration" name="ad_duration" type="number" required />
                  </div>
                </div>
                <div>
                  <Label htmlFor="custom_button_text">Button Text</Label>
                  <Input id="custom_button_text" name="custom_button_text" required />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="active" name="active" defaultChecked />
                  <Label htmlFor="active">Active</Label>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="cpv_rate">CPV Rate</Label>
                    <Input id="cpv_rate" name="cpv_rate" type="number" step="0.01" required />
                  </div>
                  <div>
                    <Label htmlFor="budget">Budget</Label>
                    <Input id="budget" name="budget" type="number" step="0.01" required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="total_limit">Total Limit</Label>
                    <Input id="total_limit" name="total_limit" type="number" required />
                  </div>
                  <div>
                    <Label htmlFor="daily_limit">Daily Limit</Label>
                    <Input id="daily_limit" name="daily_limit" type="number" required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="bill_id">Bill ID</Label>
                    <Input id="bill_id" name="bill_id" required />
                  </div>
                  <div>
                    <Label htmlFor="bill_date">Bill Date</Label>
                    <Input id="bill_date" name="bill_date" type="number" required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="bill_type">Bill Type</Label>
                    <Select name="bill_type">
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="recurring">Recurring</SelectItem>
                        <SelectItem value="one-time">One-time</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="bill_paid" name="bill_paid" />
                    <Label htmlFor="bill_paid">Bill Paid</Label>
                  </div>
                </div>
                <div>
                  <Label htmlFor="cpn">CPN</Label>
                  <Input id="cpn" name="cpn" required />
                </div>
                <div className="flex justify-end space-x-2 sticky bottom-0 bg-gradient-to-t from-background to-background/80 pt-4 mt-4">
                  <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Create Campaign</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        }
      />
      <div className="grid gap-4 p-6 md:grid-cols-4">
        <StatCard
          label="Active campaigns"
          value={totalActive.toLocaleString()}
          icon={<Megaphone className="h-5 w-5" />}
          accent="primary"
        />
        <StatCard
          label="Impressions"
          value={totalImpr.toLocaleString()}
          icon={<Eye className="h-5 w-5" />}
          accent="success"
        />
        <StatCard
          label="Avg CPV"
          value={`R ${avgCpv.toFixed(2)}`}
          accent="info"
        />
        <StatCard
          label="Budget"
          value={fmtCurrency(totalBudget)}
          accent="warning"
        />
      </div>
      <div className="px-6 pb-6">
        <Panel title="Campaigns">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campaign</TableHead>
                <TableHead>Ad title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Target nodes</TableHead>
                <TableHead className="text-right">Impr.</TableHead>
                <TableHead className="text-right">Daily</TableHead>
                <TableHead className="text-right">Limit</TableHead>
                <TableHead className="w-40">Budget</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ads.map((a) => (
                <TableRow key={a.id} className="text-xs">
                  <TableCell className="font-medium">
                    <div>{a.campaign}</div>
                    <div className="text-muted-foreground text-[11px]">{a.campaign_start} → {a.campaign_end}</div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{a.ad_title}</TableCell>
                  <TableCell>
                    <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] uppercase">
                      {a.ad_type}
                    </span>
                  </TableCell>
                  <TableCell className="font-mono text-[11px] text-muted-foreground">
                    {a.target_nodes}
                  </TableCell>
                  <TableCell className="text-right font-mono">{a.impressions.toLocaleString()}</TableCell>
                  <TableCell className="text-right font-mono">{a.daily_count.toLocaleString()}</TableCell>
                  <TableCell className="text-right font-mono">{a.total_limit.toLocaleString()}</TableCell>
                  <TableCell>{fmtCurrency(a.budget)}</TableCell>
                  <TableCell>
                    <div className="whitespace-nowrap text-xs font-medium">
                      {a.active ? "Active" : "Inactive"}
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
