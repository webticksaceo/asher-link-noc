import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Radio,
  Network,
  User,
  Ticket,
  Megaphone,
  Globe,
  Bell,
  BarChart3,
  Activity,
  Settings,
  Wifi,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";

const groups = [
  {
    label: "Overview",
    items: [
      { title: "Dashboard", url: "/", icon: LayoutDashboard },
      { title: "Active Sessions", url: "/sessions", icon: Activity },
      { title: "Revenue", url: "/revenue", icon: BarChart3 },
    ],
  },
  {
    label: "Network",
    items: [
      { title: "Access Points", url: "/nodes", icon: Radio },
      { title: "Backhauls", url: "/backhauls", icon: Network },
    ],
  },
  {
    label: "Monetization",
    items: [
      { title: "Users & Devices", url: "/users", icon: User },
      { title: "Vouchers", url: "/vouchers", icon: Ticket },
      { title: "Ads", url: "/ads", icon: Megaphone },
    ],
  },
  {
    label: "Engagement",
    items: [
      { title: "Captive Portal", url: "/portal", icon: Globe },
      { title: "Notifications", url: "/notifications", icon: Bell },
    ],
  },
  {
    label: "System",
    items: [{ title: "Settings", url: "/settings", icon: Settings }],
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const path = useRouterState({ select: (r) => r.location.pathname });
  const { user, logout } = useAuth();

  const isActive = (url: string) => (url === "/" ? path === "/" : path.startsWith(url));

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border px-3 py-4">
        <div className="flex items-center gap-2">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Wifi className="h-5 w-5" />
            <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-success pulse-dot" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-mono text-sm font-semibold tracking-wider text-primary text-glow">
                Asher-Link
              </span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                NOC Console
              </span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-1">
        {groups.map((g) => (
          <SidebarGroup key={g.label}>
            {!collapsed && (
              <SidebarGroupLabel className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground/70">
                {g.label}
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                {g.items.map((item) => (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton asChild isActive={isActive(item.url)}>
                      <Link to={item.url} className="flex items-center gap-2">
                        <item.icon className="h-4 w-4 shrink-0" />
                        {!collapsed && <span className="text-sm">{item.title}</span>}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-3">
        {!collapsed ? (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 font-mono text-xs text-primary">
                {user?.username.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex flex-1 flex-col">
                <span className="text-xs font-medium">{user?.username}</span>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  {user?.role}
                </span>
              </div>
            </div>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 justify-start text-xs"
              onClick={logout}
            >
              Sign out
            </Button>
          </div>
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 font-mono text-xs text-primary">
            {user?.username.slice(0, 2).toUpperCase()}
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
