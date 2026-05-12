import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { PageHeader, Panel, StatusDot, StatCard } from "@/components/dashboard-ui";
import { fetchVouchers } from "@/lib/api";
import { fmtCurrency } from "@/lib/mock-data";
import { Ticket, Layers, Plus, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/toast";

export const Route = createFileRoute("/_app/vouchers")({
  component: VouchersPage,
});

function VouchersPage() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const {
    data: vouchers,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["vouchers"],
    queryFn: fetchVouchers,
    enabled: typeof window !== "undefined",
  });

  const handleGenerateBatch = async (formData: FormData) => {
    const data = Object.fromEntries(formData);
    try {
      const response = await fetch('/api/vouchers/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (response.ok) {
        setModalOpen(false);
        queryClient.invalidateQueries({ queryKey: ['vouchers'] });
        toast.success('Batch generated successfully');
      } else {
        toast.error('Failed to generate batch');
      }
    } catch (error) {
      toast.error('Error generating batch');
    }
  };

  if (isLoading) {
    return <div className="p-6">Loading vouchers…</div>;
  }

  if (error || !vouchers) {
    return <div className="p-6 text-destructive">Unable to load vouchers.</div>;
  }

  const unused = vouchers.filter((v) => v.status === "unused").length;
  const value = vouchers.filter((v) => v.status === "unused").reduce((s, v) => s + v.amount, 0);
  return (
    <div>
      <PageHeader
        title="Vouchers"
        description="Generate and track prepaid access codes."
        actions={
          <>
            <Button size="sm" variant="outline">
              <Download className="mr-1.5 h-3.5 w-3.5" /> Export PDF
            </Button>
            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="mr-1.5 h-3.5 w-3.5" /> Generate batch
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Generate Voucher Batch</DialogTitle>
                  <DialogDescription>
                    Create a new batch of prepaid vouchers with specific denominations and quantities.
                  </DialogDescription>
                </DialogHeader>
                <form action={handleGenerateBatch} className="space-y-4">
                  <div>
                    <Label htmlFor="batch_name">Batch Name</Label>
                    <Input id="batch_name" name="batch_name" placeholder="e.g., June-2024-Campaign" required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="denomination">Denomination</Label>
                      <Select name="denomination" defaultValue="100">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="20">R20 (1 Hour)</SelectItem>
                          <SelectItem value="100">R100 (1 Day)</SelectItem>
                          <SelectItem value="500">R500 (1 Week)</SelectItem>
                          <SelectItem value="1500">R1500 (1 Month)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="quantity">Quantity</Label>
                      <Input id="quantity" name="quantity" type="number" placeholder="100" min="1" required />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="provider">Provider</Label>
                    <Select name="provider" defaultValue="internal">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="internal">Internal</SelectItem>
                        <SelectItem value="partner-a">Partner A</SelectItem>
                        <SelectItem value="partner-b">Partner B</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="notes">Notes (optional)</Label>
                    <Input id="notes" name="notes" placeholder="Additional batch info" />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Generate Batch</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </>
        }
      />
      <div className="grid gap-4 p-6 md:grid-cols-3">
        <StatCard
          label="Unused vouchers"
          value={String(unused)}
          icon={<Ticket className="h-5 w-5" />}
          accent="info"
        />
        <StatCard
          label="Float in pool"
          value={fmtCurrency(value)}
          icon={<Layers className="h-5 w-5" />}
          accent="primary"
        />
        <StatCard label="Redeemed (week)" value="248" delta="+12% vs last week" accent="success" />
      </div>

      <div className="grid gap-4 px-6 pb-6 lg:grid-cols-4">
        {[
          { name: "1 Hour", price: 20, data: "500 MB", color: "text-info" },
          { name: "1 Day", price: 100, data: "2 GB", color: "text-primary" },
          { name: "1 Week", price: 500, data: "10 GB", color: "text-success" },
          { name: "1 Month", price: 1500, data: "50 GB", color: "text-warning" },
        ].map((p) => (
          <Panel key={p.name}>
            <div className="space-y-1">
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                {p.name} plan
              </p>
              <p className={`font-mono text-2xl font-semibold ${p.color}`}>
                {fmtCurrency(p.price)}
              </p>
              <p className="text-xs text-muted-foreground">{p.data} cap</p>
            </div>
          </Panel>
        ))}
      </div>

      <div className="px-6 pb-6">
        <Panel title="Voucher pool">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pin</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Remaining</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vouchers.map((v) => (
                <TableRow key={v._id.$oid} className="font-mono text-xs">
                  <TableCell className="font-semibold tracking-wider">{v.pin}</TableCell>
                  <TableCell className="text-muted-foreground">{v.provider}</TableCell>
                  <TableCell className="text-right">{fmtCurrency(v.amount)}</TableCell>
                  <TableCell className="text-right">{fmtCurrency(v.remaining_value)}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(v.created_at.$date).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{v.user_id ?? "—"}</TableCell>
                  <TableCell>
                    <StatusDot status={v.status} />
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
