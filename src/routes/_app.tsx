import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { useAuth } from "@/lib/auth";
import { Bell, Search, ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AppLayout() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (typeof window !== "undefined" && !isLoading && !isAuthenticated) navigate({ to: "/login" });
  }, [isAuthenticated, isLoading, navigate]);

  if (typeof window === "undefined") {
    // In SSR, assume authenticated to render the dashboard
    return (
      <SidebarProvider>
        <div className="flex min-h-screen w-full bg-background">
          <AppSidebar />
          <div className="flex flex-1 flex-col">
            <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur">
              <SidebarTrigger />
              <div className="hidden flex-1 md:block">
                <div className="relative max-w-md">
                  <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search MAC, voucher code, node..."
                    className="h-9 border-border bg-card/60 pl-8 font-mono text-xs"
                  />
                </div>
              </div>
              <div className="ml-auto flex items-center gap-3">
                <div className="hidden items-center gap-1.5 rounded-full border border-success/30 bg-success/10 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-success md:flex">
                  <span className="h-1.5 w-1.5 rounded-full bg-success pulse-dot" />
                  All systems
                </div>
                <button className="relative rounded-md border border-border bg-card/60 p-2 text-muted-foreground transition hover:text-foreground">
                  <Bell className="h-4 w-4" />
                  <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-primary" />
                </button>
                <div className="flex items-center gap-2 rounded-md border border-border bg-card/60 px-2.5 py-1.5">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  <span className="font-mono text-xs">admin</span>
                </div>
              </div>
            </header>
            <main className="flex-1 overflow-auto">
              <Outlet />
            </main>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  if (isLoading || !isAuthenticated) return null;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur">
            <SidebarTrigger />
            <div className="hidden flex-1 md:block">
              <div className="relative max-w-md">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search MAC, voucher code, node..."
                  className="h-9 border-border bg-card/60 pl-8 font-mono text-xs"
                />
              </div>
            </div>
            <div className="ml-auto flex items-center gap-3">
              <div className="hidden items-center gap-1.5 rounded-full border border-success/30 bg-success/10 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-success md:flex">
                <span className="h-1.5 w-1.5 rounded-full bg-success pulse-dot" />
                All systems
              </div>
              <button className="relative rounded-md border border-border bg-card/60 p-2 text-muted-foreground transition hover:text-foreground">
                <Bell className="h-4 w-4" />
                <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-primary" />
              </button>
              <div className="flex items-center gap-2 rounded-md border border-border bg-card/60 px-2.5 py-1.5">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <span className="font-mono text-xs">{user?.username}</span>
                <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] uppercase text-primary">
                  {user?.role}
                </span>
              </div>
            </div>
          </header>
          <main className="flex-1">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
