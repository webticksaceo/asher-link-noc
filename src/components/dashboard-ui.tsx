import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2 border-b border-border bg-gradient-to-b from-card/40 to-transparent px-6 py-5 md:flex-row md:items-end md:justify-between">
      <div>
        <h1 className="font-mono text-xl font-semibold tracking-wide text-foreground">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

export function StatCard({
  label,
  value,
  delta,
  icon,
  accent = "primary",
}: {
  label: string;
  value: string;
  delta?: string;
  icon?: ReactNode;
  accent?: "primary" | "success" | "warning" | "info";
}) {
  const accentClass = {
    primary: "text-primary",
    success: "text-success",
    warning: "text-warning",
    info: "text-info",
  }[accent];
  return (
    <div className="group relative overflow-hidden rounded-lg border border-border bg-card/60 p-4 backdrop-blur transition hover:border-primary/40">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
          <p className={cn("mt-2 font-mono text-2xl font-semibold", accentClass)}>{value}</p>
          {delta && <p className="mt-1 text-xs text-muted-foreground">{delta}</p>}
        </div>
        {icon && <div className={cn("opacity-70", accentClass)}>{icon}</div>}
      </div>
      <div className="pointer-events-none absolute -bottom-px left-0 h-px w-0 bg-primary transition-all duration-500 group-hover:w-full" />
    </div>
  );
}

export function StatusDot({
  status,
}: {
  status:
    | "online"
    | "offline"
    | "degraded"
    | "active"
    | "expired"
    | "suspended"
    | "paused"
    | "draft"
    | "unused"
    | "redeemed"
    | "assigned";
}) {
  const colorMap: Record<string, string> = {
    online: "bg-success text-success",
    active: "bg-success text-success",
    degraded: "bg-warning text-warning",
    paused: "bg-warning text-warning",
    unused: "bg-info text-info",
    redeemed: "bg-info text-info",
    draft: "bg-muted-foreground text-muted-foreground",
    offline: "bg-destructive text-destructive",
    suspended: "bg-destructive text-destructive",
    expired: "bg-destructive text-destructive",
  };
  const c = colorMap[status] ?? "bg-muted-foreground text-muted-foreground";
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={cn("h-1.5 w-1.5 rounded-full pulse-dot", c)} />
      <span className="text-xs uppercase tracking-wider">{status}</span>
    </span>
  );
}

export function Panel({
  title,
  children,
  actions,
}: {
  title?: string;
  children: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="rounded-lg border border-border bg-card/40 backdrop-blur">
      {title && (
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
            {title}
          </h3>
          {actions}
        </div>
      )}
      <div className="p-4">{children}</div>
    </div>
  );
}
