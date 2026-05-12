import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { PageHeader, Panel } from "@/components/dashboard-ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/lib/auth";
import { ShieldCheck, User, Plus } from "lucide-react";
import { toast } from "@/components/ui/toast";

export const Route = createFileRoute("/_app/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const { user, hasRole } = useAuth();
  const isAdmin = hasRole("admin");
  const queryClient = useQueryClient();
  const { data: settings, isLoading } = useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const response = await fetch("/api/settings");
      const data = await response.json();
      // Handle both array and single object returns
      return Array.isArray(data) ? data[0] : data;
    },
    enabled: typeof window !== "undefined",
  });

  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  const handleSave = async () => {
    try {
      const { _id, ...dataToSend } = formData;
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend),
      });
      if (response.ok) {
        queryClient.invalidateQueries({ queryKey: ['settings'] });
        toast.success('Settings saved');
      } else {
        toast.error('Failed to save settings');
      }
    } catch (error) {
      toast.error('Failed to save settings');
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${protocol}//${window.location.host}/ws`);
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'update') {
        queryClient.invalidateQueries({ queryKey: ['settings'] });
      }
    };
    return () => ws.close();
  }, [queryClient]);

  if (isLoading) return <div>Loading settings…</div>;

  return (
    <div>
      <PageHeader title="Settings" description="System configuration & access control." />
      <div className="grid gap-4 p-6 lg:grid-cols-2">
        <Panel title="Profile">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 font-mono text-primary">
                {user?.username.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="font-medium">{user?.username}</div>
                <div className="text-xs text-muted-foreground">{user?.email}</div>
              </div>
              <span className="ml-auto rounded bg-primary/10 px-2 py-0.5 text-[10px] uppercase text-primary">
                {user?.role}
              </span>
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                Email
              </Label>
              <Input defaultValue={user?.email} className="mt-1.5 font-mono" />
            </div>
            <Button size="sm" variant="outline">
              Save profile
            </Button>
          </div>
        </Panel>

        <Panel
          title="Operators & roles"
          actions={
            isAdmin && (
              <Button size="sm" variant="outline">
                <Plus className="mr-1.5 h-3.5 w-3.5" /> Invite
              </Button>
            )
          }
        >
          <div className="space-y-2">
            {[
              { name: "admin", role: "admin", email: "admin@noc.local" },
              { name: "operator", role: "operator", email: "ops@noc.local" },
              { name: "field-tech-1", role: "operator", email: "tech1@noc.local" },
            ].map((u) => (
              <div
                key={u.name}
                className="flex items-center justify-between rounded-md border border-border/50 bg-background/30 px-3 py-2 text-sm"
              >
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-mono text-xs">{u.name}</div>
                    <div className="text-[10px] text-muted-foreground">{u.email}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded px-2 py-0.5 text-[10px] uppercase ${u.role === "admin" ? "bg-primary/10 text-primary" : "bg-info/10 text-info"}`}
                  >
                    {u.role}
                  </span>
                  {isAdmin && (
                    <Button size="sm" variant="ghost" className="h-7 text-xs">
                      Edit
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
          {!isAdmin && (
            <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5" /> Admin role required to modify operators.
            </p>
          )}
        </Panel>

        <Panel title="System preferences">
          <div className="space-y-3">
            {[
              { key: "auto_disconnect_zero_balance", label: "Auto-disconnect zero balance" },
              { key: "show_ads_to_paying_users", label: "Show ads to paying users" },
              { key: "email_daily_revenue_report", label: "Email daily revenue report" },
              { key: "slack_alerts_offline_nodes", label: "Slack alerts for offline nodes" },
            ].map((row) => (
              <div
                key={row.key}
                className="flex items-center justify-between border-b border-border/40 py-3 last:border-0"
              >
                <div className="text-sm">{row.label}</div>
                <Switch
                  checked={formData[row.key] || false}
                  onCheckedChange={(checked) => setFormData({ ...formData, [row.key]: checked })}
                />
              </div>
            ))}
            <Button onClick={handleSave} size="sm">Save Preferences</Button>
          </div>
        </Panel>

        <Panel title="Pricing & currency">
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                Currency
              </Label>
              <Input
                value={formData.currency || ""}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="mt-1.5 font-mono"
              />
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                Default rate / MB
              </Label>
              <Input
                type="number"
                step="0.01"
                value={formData.default_rate_mb || ""}
                onChange={(e) => setFormData({ ...formData, default_rate_mb: parseFloat(e.target.value) })}
                className="mt-1.5 font-mono"
              />
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                Idle timeout (min)
              </Label>
              <Input
                type="number"
                value={formData.idle_timeout_min || ""}
                onChange={(e) => setFormData({ ...formData, idle_timeout_min: parseInt(e.target.value) })}
                className="mt-1.5 font-mono"
              />
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                Session cap (hours)
              </Label>
              <Input
                type="number"
                value={formData.session_cap_hours || ""}
                onChange={(e) => setFormData({ ...formData, session_cap_hours: parseInt(e.target.value) })}
                className="mt-1.5 font-mono"
              />
            </div>
          </div>
          <Button onClick={handleSave} size="sm" className="mt-3">Save Pricing</Button>
        </Panel>
      </div>
    </div>
  );
}
