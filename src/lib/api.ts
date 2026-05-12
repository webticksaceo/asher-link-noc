import type {
  ActiveSession,
  Advertisement,
  NotificationItem,
  Transaction,
  Voucher,
  WalletUser,
  Node,
} from "./mock-data";

export type RevenuePoint = { day: string; topups: number; vouchers: number; ads: number };
export type SessionsHourlyPoint = { h: string; v: number };

async function request<T>(path: string): Promise<T> {
  const response = await fetch(`/api/${path}`);
  if (!response.ok) {
    throw new Error(`Failed to load ${path}: ${response.statusText}`);
  }
  return response.json();
}

export function fetchNodes() {
  return request<Node[]>("nodes");
}

export function fetchUsers() {
  return request<WalletUser[]>("users");
}

export function fetchVouchers() {
  return request<Voucher[]>("vouchers");
}

export function fetchAds() {
  return request<Advertisement[]>("advertisements");
}

export function fetchTransactions() {
  return request<Transaction[]>("transactions");
}

export function fetchActiveSessions() {
  return request<ActiveSession[]>("activeSessions");
}

export function fetchNotifications() {
  return request<NotificationItem[]>("notifications");
}

export async function saveNotification(notification: Omit<NotificationItem, 'id' | 'sentAt' | 'delivered' | 'opened'>) {
  const response = await fetch('/api/notifications', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(notification),
  });
  if (!response.ok) {
    throw new Error(`Failed to save notification: ${response.statusText}`);
  }
  return response.json();
}

export function fetchRevenue7d() {
  return request<RevenuePoint[]>("revenue7d");
}

export function fetchSessionsHourly() {
  return request<SessionsHourlyPoint[]>("sessionsHourly");
}

export function fetchDashboardData() {
  return request<{
    nodes: Node[];
    users: WalletUser[];
    activeSessions: ActiveSession[];
    transactions: Transaction[];
    revenue7d: RevenuePoint[];
    sessionsHourly: SessionsHourlyPoint[];
  }>("dashboard");
}

export function generateAlerts(nodes: Node[], users: WalletUser[]) {
  const alerts: Array<{
    id: string;
    type: 'offline' | 'degraded' | 'low-balance';
    title: string;
    description: string;
    severity: 'critical' | 'warning' | 'info';
  }> = [];

  // Check for offline nodes
  const offlineNodes = nodes.filter(n => n.status === 'offline');
  offlineNodes.forEach(node => {
    alerts.push({
      id: `offline-${node.id}`,
      type: 'offline',
      title: `${node.name} offline`,
      description: `${node.location} · Last seen: ${node.lastSeen}`,
      severity: 'critical'
    });
  });

  // Check for degraded nodes
  const degradedNodes = nodes.filter(n => n.status === 'degraded');
  degradedNodes.forEach(node => {
    alerts.push({
      id: `degraded-${node.id}`,
      type: 'degraded',
      title: `${node.name} degraded`,
      description: `Signal ${node.signal}dBm, CPU ${node.cpu}%`,
      severity: 'warning'
    });
  });

  // Check for users with low balance
  const lowBalanceUsers = users.filter(u => u.balance < 10);
  if (lowBalanceUsers.length > 0) {
    alerts.push({
      id: 'low-balance-users',
      type: 'low-balance',
      title: `${lowBalanceUsers.length} users with low balance`,
      description: `Below KES 10 — eligible for top-up reminder`,
      severity: 'info'
    });
  }

  return alerts;
}
