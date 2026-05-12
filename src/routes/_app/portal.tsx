import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { PageHeader, Panel } from "@/components/dashboard-ui";
import { Wifi, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/toast";

export const Route = createFileRoute("/_app/portal")({
  component: PortalPage,
});

function PortalPage() {
  const queryClient = useQueryClient();
  const { data: settings, isLoading } = useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const response = await fetch("/api/settings");
      const data = await response.json();
      return Array.isArray(data) ? data[0] : data;
    },
    enabled: typeof window !== "undefined",
  });

  const [formData, setFormData] = useState<any>({});

  const previewHtml = (() => {
    const template = formData.portal_html?.trim() || `
      <div style="min-height: 360px; padding: 28px; background: #09020f; color: #f8e34a; font-family: Inter, ui-sans-serif, system-ui, sans-serif;">
        <div style="max-width: 420px; margin: 0 auto; border: 1px solid rgba(248,227,74,.18); border-radius: 22px; padding: 24px; background: rgba(15,7,27,.95); box-shadow: 0 0 40px rgba(158,95,255,.12);">
          <div style="margin-bottom: 18px; color: #c084fc; font-size: 1.25rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase;">
            ${formData.network_name || "MeshGrid Free WiFi"}
          </div>
          <h1 style="margin: 0 0 14px; font-size: 2rem; color: #f8e34a;">${formData.welcome_message || "Welcome! Sign in or top up your wallet to get connected."}</h1>
          <p style="margin: 0 0 24px; color: #d6c46a; line-height: 1.6;">Connect securely over hotspot access, unlock premium passes, or pay with M-Pesa.</p>
          <a href="#" style="display: inline-block; padding: 12px 22px; background: #9d4edd; color: #0b0215; border-radius: 999px; font-weight: 700; text-decoration: none;">Start browsing</a>
          <div style="margin-top: 22px; padding: 16px; border-radius: 14px; background: rgba(255, 214, 90, 0.08); color: #fef3c7;">
            <strong>Terms</strong> <a href="${formData.terms_url || "#"}" style="color: #fde047;">${formData.terms_url || "https://example.com/terms"}</a>
          </div>
        </div>
      </div>
    `;

    return template
      .replace(/{{network_name}}/g, formData.network_name || "MeshGrid Free WiFi")
      .replace(/{{welcome_message}}/g, formData.welcome_message || "Welcome! Sign in or top up your wallet to get connected.")
      .replace(/{{terms_url}}/g, formData.terms_url || "https://example.com/terms");
  })();

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
        toast.success('Portal settings saved');
      } else {
        toast.error('Failed to save portal settings');
      }
    } catch (error) {
      toast.error('Failed to save portal settings');
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

  if (isLoading) return <div>Loading portal settings…</div>;
  return (
    <div>
      <PageHeader
        title="Captive Portal"
        description="Customize what users see when they connect to the WiFi."
      />
      <div className="grid gap-4 p-6 lg:grid-cols-5">
        <div className="space-y-4 lg:col-span-3">
          <Panel title="Branding">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                  Network name
                </Label>
                <Input
                  value={formData.network_name || ""}
                  onChange={(e) => setFormData({ ...formData, network_name: e.target.value })}
                  className="mt-1.5 font-mono"
                />
              </div>
              <div>
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                  Primary color
                </Label>
                <div className="mt-1.5 flex items-center gap-2">
                  <div className="h-9 w-9 rounded-md bg-primary" />
                  <Input
                    value={formData.primary_color || ""}
                    onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                    className="font-mono"
                  />
                </div>
              </div>
              <div className="md:col-span-2">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                  Welcome message
                </Label>
                <Textarea
                  value={formData.welcome_message || ""}
                  onChange={(e) => setFormData({ ...formData, welcome_message: e.target.value })}
                  className="mt-1.5"
                  rows={3}
                />
              </div>
              <div className="md:col-span-2">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                  Terms URL
                </Label>
                <Input
                  value={formData.terms_url || ""}
                  onChange={(e) => setFormData({ ...formData, terms_url: e.target.value })}
                  className="mt-1.5 font-mono"
                />
              </div>
            </div>
          </Panel>

          <Panel title="Portal HTML">
            <div className="space-y-3">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                HTML template
              </Label>
              <Textarea
                value={formData.portal_html || ""}
                onChange={(e) => setFormData({ ...formData, portal_html: e.target.value })}
                className="mt-1.5 bg-black/95 text-yellow-300 font-mono border border-yellow-500/20"
                rows={10}
              />
              <p className="text-xs text-muted-foreground">
                Use <code className="rounded bg-muted px-1 py-0.5">{'{{network_name}}'}</code>, <code className="rounded bg-muted px-1 py-0.5">{'{{welcome_message}}'}</code>, and <code className="rounded bg-muted px-1 py-0.5">{'{{terms_url}}'}</code> placeholders.
              </p>
            </div>
          </Panel>

          <Panel title="Authentication methods">
            {[
              {
                k: "mac_auto_login",
                label: "MAC auto-login",
                desc: "Skip portal if MAC has active wallet balance",
              },
              { k: "voucher_code", label: "Voucher code", desc: "Accept prepaid voucher codes" },
              { k: "mpesa_stk_push", label: "M-Pesa STK push", desc: "On-portal mobile money payment" },
              {
                k: "watch_ad_unlock",
                label: "Watch ad to unlock",
                desc: "Free 5-minute pass after viewing video ad",
              },
              { k: "social_login", label: "Social login", desc: "Sign in with Google / Facebook for free tier" },
            ].map((row) => (
              <div
                key={row.k}
                className="flex items-center justify-between border-b border-border/40 py-3 last:border-0"
              >
                <div>
                  <div className="text-sm font-medium">{row.label}</div>
                  <div className="text-xs text-muted-foreground">{row.desc}</div>
                </div>
                <Switch
                  checked={formData[row.k] || false}
                  onCheckedChange={(checked) => setFormData({ ...formData, [row.k]: checked })}
                />
              </div>
            ))}
          </Panel>

          <Panel title="MikroTik integration">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                  Hotspot host
                </Label>
                <Input
                  value={formData.hotspot_host || ""}
                  onChange={(e) => setFormData({ ...formData, hotspot_host: e.target.value })}
                  className="mt-1.5 font-mono"
                />
              </div>
              <div>
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                  RADIUS shared secret
                </Label>
                <Input
                  type="password"
                  value={formData.radius_shared_secret || ""}
                  onChange={(e) => setFormData({ ...formData, radius_shared_secret: e.target.value })}
                  className="mt-1.5 font-mono"
                />
              </div>
              <div>
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                  API port
                </Label>
                <Input defaultValue="8728" className="mt-1.5 font-mono" />
              </div>
              <div className="flex items-end">
                <Button variant="outline" size="sm" className="w-full">
                  Test connection
                </Button>
              </div>
            </div>
          </Panel>
        </div>

        <div className="space-y-4 lg:col-span-2">
          <Panel title="Live preview">
            <div className="overflow-hidden rounded-lg border border-yellow-500/20 bg-black/90">
              <div className="p-4">
                <div className="overflow-hidden rounded-3xl border border-yellow-400/10 bg-[#0b0415] p-4 shadow-[0_0_60px_rgba(158,95,255,0.2)]">
                  <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
                </div>
              </div>
            </div>
          </Panel>
          <Button onClick={handleSave} className="w-full">Publish portal changes</Button>
        </div>
      </div>
    </div>
  );
}
