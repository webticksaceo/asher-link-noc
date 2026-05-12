// Mock data powering the NOC dashboard demo.

export interface Node {
  id: string;
  name: string;
  type: "AP" | "Backhaul";
  location: string;
  status: "online" | "offline" | "degraded";
  ip: string;
  mac: string;
  clients: number;
  uptime: string;
  signal: number; // dBm
  throughputMbps: number;
  cpu: number;
  memory: number;
  firmware: string;
  lastSeen: string;
}

export interface WalletUser {
  id: string;
  mac: string;
  device: string;
  first_name?: string;
  last_name?: string;
  password?: string;
  primary_mac?: string;
  balance: number;
  lifetimeSpend: number;
  status: "active" | "suspended" | "expired";
  lastSeen: string;
  node: string;
  dataUsedMb: number;
}

export interface Voucher {
  _id: { $oid: string };
  pin: string;
  amount: number;
  remaining_value: number;
  user_id: string | null;
  mac: string;
  created_at: { $date: string };
  status: "assigned" | "unused" | "active" | "redeemed" | "expired";
  provider: string;
}

export interface Advertisement {
  id: string;
  ad_id: string;
  ad_title: string;
  campaign: string;
  campaign_start: string;
  campaign_end: string;
  target_nodes: string;
  ad_url: string;
  target_url: string;
  
  ad_type: "banner" | "video" | "interstitial";
  ad_duration: number;
  custom_button_text: string;
  active: boolean;
  cpv_rate: number;
  budget: number;
  total_limit: number;
  daily_limit: number;
  daily_count: number;
  impressions: number;
  bill_id: string;
  bill_date: number;
  bill_type: string;
  bill_paid: boolean;
  cpn: string;
}

export interface Transaction {
  id: string;
  mac: string;
  amount: number;
  type: "topup" | "voucher" | "session";
  method: "mpesa" | "card" | "voucher" | "wallet";
  node: string;
  timestamp: string;
}

export interface ActiveSession {
  id: string;
  mac: string;
  device: string;
  node: string;
  ip: string;
  startedAt: string;
  durationMin: number;
  dataMb: number;
  rateMbps: number;
  plan: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  audience: "all" | "active" | "low-balance" | string;
  channel: "portal" | "push" | "sms";
  sentAt: string;
  delivered: number;
  opened: number;
}

export interface Settings {
  id: string;
  auto_disconnect_zero_balance: boolean;
  show_ads_to_paying_users: boolean;
  email_daily_revenue_report: boolean;
  slack_alerts_offline_nodes: boolean;
  currency: string;
  default_rate_mb: number;
  idle_timeout_min: number;
  session_cap_hours: number;
  network_name: string;
  primary_color: string;
  welcome_message: string;
  terms_url: string;
  portal_html?: string;
  mac_auto_login: boolean;
  voucher_code: boolean;
  mpesa_stk_push: boolean;
  watch_ad_unlock: boolean;
  social_login: boolean;
  hotspot_host: string;
  radius_shared_secret: string;
}

export const nodes: Node[] = [
  {
    id: "n1",
    name: "AP-CBD-01",
    type: "AP",
    location: "CBD / Rooftop A",
    status: "online",
    ip: "10.10.0.11",
    mac: "B8:27:EB:A1:11:01",
    clients: 38,
    uptime: "23d 4h",
    signal: -52,
    throughputMbps: 184,
    cpu: 28,
    memory: 41,
    firmware: "7.13.4",
    lastSeen: "now",
  },
  {
    id: "n2",
    name: "AP-CBD-02",
    type: "AP",
    location: "CBD / Plaza",
    status: "online",
    ip: "10.10.0.12",
    mac: "B8:27:EB:A1:11:02",
    clients: 24,
    uptime: "12d 9h",
    signal: -58,
    throughputMbps: 96,
    cpu: 19,
    memory: 33,
    firmware: "7.13.4",
    lastSeen: "now",
  },
  {
    id: "n3",
    name: "AP-WST-07",
    type: "AP",
    location: "Westlands / Mall",
    status: "degraded",
    ip: "10.10.0.27",
    mac: "B8:27:EB:A1:11:07",
    clients: 11,
    uptime: "2d 1h",
    signal: -71,
    throughputMbps: 22,
    cpu: 67,
    memory: 78,
    firmware: "7.12.1",
    lastSeen: "2m ago",
  },
  {
    id: "n4",
    name: "AP-EST-03",
    type: "AP",
    location: "Eastleigh / Block C",
    status: "online",
    ip: "10.10.0.43",
    mac: "B8:27:EB:A1:11:03",
    clients: 52,
    uptime: "41d 12h",
    signal: -49,
    throughputMbps: 240,
    cpu: 44,
    memory: 52,
    firmware: "7.13.4",
    lastSeen: "now",
  },
  {
    id: "n5",
    name: "AP-KAR-09",
    type: "AP",
    location: "Karen / Cafe",
    status: "offline",
    ip: "10.10.0.59",
    mac: "B8:27:EB:A1:11:09",
    clients: 0,
    uptime: "—",
    signal: 0,
    throughputMbps: 0,
    cpu: 0,
    memory: 0,
    firmware: "7.11.8",
    lastSeen: "1h 14m ago",
  },
  {
    id: "b1",
    name: "BH-CORE-01",
    type: "Backhaul",
    location: "Core / DC",
    status: "online",
    ip: "10.0.0.1",
    mac: "AA:BB:CC:00:00:01",
    clients: 0,
    uptime: "187d",
    signal: -38,
    throughputMbps: 942,
    cpu: 12,
    memory: 28,
    firmware: "7.14.0",
    lastSeen: "now",
  },
  {
    id: "b2",
    name: "BH-WST-02",
    type: "Backhaul",
    location: "Westlands / Tower",
    status: "online",
    ip: "10.0.0.2",
    mac: "AA:BB:CC:00:00:02",
    clients: 0,
    uptime: "94d",
    signal: -42,
    throughputMbps: 612,
    cpu: 18,
    memory: 31,
    firmware: "7.14.0",
    lastSeen: "now",
  },
  {
    id: "b3",
    name: "BH-EST-03",
    type: "Backhaul",
    location: "Eastleigh / Mast",
    status: "degraded",
    ip: "10.0.0.3",
    mac: "AA:BB:CC:00:00:03",
    clients: 0,
    uptime: "9d",
    signal: -68,
    throughputMbps: 188,
    cpu: 51,
    memory: 60,
    firmware: "7.13.4",
    lastSeen: "now",
  },
];

export const users: WalletUser[] = [
  {
    id: "w1",
    mac: "A4:5E:60:11:22:01",
    primary_mac: "A4:5E:60:11:22:01",
    device: "iPhone 14",
    first_name: "Asha",
    last_name: "Mumo",
    password: "asha123",
    balance: 124.5,
    lifetimeSpend: 980,
    status: "active",
    lastSeen: "2m ago",
    node: "AP-CBD-01",
    dataUsedMb: 1240,
  },
  {
    id: "w2",
    mac: "A4:5E:60:11:22:02",
    device: "Samsung S23",
    balance: 12.0,
    lifetimeSpend: 410,
    status: "active",
    lastSeen: "now",
    node: "AP-CBD-01",
    dataUsedMb: 320,
  },
  {
    id: "w3",
    mac: "A4:5E:60:11:22:03",
    device: "Tecno Spark",
    balance: 0,
    lifetimeSpend: 220,
    status: "expired",
    lastSeen: "3h ago",
    node: "AP-EST-03",
    dataUsedMb: 80,
  },
  {
    id: "w4",
    mac: "A4:5E:60:11:22:04",
    device: "MacBook Pro",
    balance: 540,
    lifetimeSpend: 2100,
    status: "active",
    lastSeen: "now",
    node: "AP-WST-07",
    dataUsedMb: 4012,
  },
  {
    id: "w5",
    mac: "A4:5E:60:11:22:05",
    device: "Xiaomi Redmi",
    balance: 5.0,
    lifetimeSpend: 89,
    status: "active",
    lastSeen: "11m ago",
    node: "AP-CBD-02",
    dataUsedMb: 65,
  },
  {
    id: "w6",
    mac: "A4:5E:60:11:22:06",
    device: "iPad Air",
    balance: 0,
    lifetimeSpend: 1340,
    status: "suspended",
    lastSeen: "2d ago",
    node: "AP-EST-03",
    dataUsedMb: 0,
  },
  {
    id: "w7",
    mac: "A4:5E:60:11:22:07",
    device: "OnePlus 11",
    balance: 76,
    lifetimeSpend: 612,
    status: "active",
    lastSeen: "now",
    node: "AP-EST-03",
    dataUsedMb: 880,
  },
  {
    id: "w8",
    mac: "A4:5E:60:11:22:08",
    device: "Huawei P50",
    balance: 30,
    lifetimeSpend: 145,
    status: "active",
    lastSeen: "47m ago",
    node: "AP-CBD-01",
    dataUsedMb: 210,
  },
];

export const vouchers: Voucher[] = [
  {
    _id: { $oid: "69c27b9caf4487b838d3ffdb" },
    pin: "123456789",
    amount: 5,
    remaining_value: 5,
    user_id: null,
    mac: "7E%3A7E%3AE6%3A86%3A03%3A58",
    created_at: { $date: "2026-03-24T11:55:08.931Z" },
    status: "assigned",
    provider: "local",
  },
  {
    _id: { $oid: "69c27b9caf4487b838d3ffdc" },
    pin: "WIFI-3J4D-K2NA",
    amount: 100,
    remaining_value: 0,
    user_id: "w2",
    mac: "A4:5E:60:11:22:02",
    created_at: { $date: "2026-05-08T09:22:00.000Z" },
    status: "active",
    provider: "local",
  },
  {
    _id: { $oid: "69c27b9caf4487b838d3ffdd" },
    pin: "WIFI-88BC-MM01",
    amount: 500,
    remaining_value: 0,
    user_id: "w4",
    mac: "A4:5E:60:11:22:04",
    created_at: { $date: "2026-05-01T12:00:00.000Z" },
    status: "redeemed",
    provider: "local",
  },
  {
    _id: { $oid: "69c27b9caf4487b838d3ffde" },
    pin: "WIFI-XPP9-ALPK",
    amount: 20,
    remaining_value: 20,
    user_id: null,
    mac: "A4:5E:60:11:22:09",
    created_at: { $date: "2026-05-09T14:30:00.000Z" },
    status: "unused",
    provider: "local",
  },
  {
    _id: { $oid: "69c27b9caf4487b838d3ffdf" },
    pin: "WIFI-22ZZ-PLMN",
    amount: 1500,
    remaining_value: 0,
    user_id: "w6",
    mac: "A4:5E:60:11:22:06",
    created_at: { $date: "2026-04-01T08:45:00.000Z" },
    status: "expired",
    provider: "local",
  },
  {
    _id: { $oid: "69c27b9caf4487b838d3ffe0" },
    pin: "WIFI-AB12-XX99",
    amount: 100,
    remaining_value: 100,
    user_id: null,
    mac: "A4:5E:60:11:22:10",
    created_at: { $date: "2026-05-09T10:10:00.000Z" },
    status: "unused",
    provider: "local",
  },
];

export const ads: Advertisement[] = [
  {
    id: "a1",
    ad_id: "default",
    ad_title: "Dunes",
    campaign: "Dunes Test ad",
    campaign_start: "03/05/2026 16:32:56",
    campaign_end: "15/06/2026 20:00:00",
    target_nodes: "all",
    ad_url: "/ads/Dunes.mp4",
    target_url: "https://atlantisdunes.com/",
    ad_type: "video",
    ad_duration: 15,
    custom_button_text: "View Details",
    active: true,
    cpv_rate: 5,
    budget: 5000,
    total_limit: 110,
    daily_limit: 10,
    daily_count: 0,
    impressions: 1,
    bill_id: "1234567",
    bill_date: 2,
    bill_type: "recurring",
    bill_paid: true,
    cpn: "Dunes CPT",
  },
  {
    id: "a2",
    ad_id: "summer-2026",
    ad_title: "Summer Sale",
    campaign: "Summer Portal Promo",
    campaign_start: "01/06/2026 08:00:00",
    campaign_end: "30/06/2026 23:59:59",
    target_nodes: "all",
    ad_url: "/ads/summer.mp4",
    target_url: "https://summerdeals.example.com/",
    ad_type: "video",
    ad_duration: 30,
    custom_button_text: "Shop Now",
    active: true,
    cpv_rate: 4,
    budget: 10000,
    total_limit: 500,
    daily_limit: 50,
    daily_count: 12,
    impressions: 120,
    bill_id: "2345678",
    bill_date: 5,
    bill_type: "one-time",
    bill_paid: false,
    cpn: "SUMMER-CPT",
  },
  {
    id: "a3",
    ad_id: "coffee-banner",
    ad_title: "Cafe Special",
    campaign: "Cafe Banner Campaign",
    campaign_start: "05/05/2026 09:00:00",
    campaign_end: "20/05/2026 21:00:00",
    target_nodes: "AP-CBD-01, AP-CBD-02",
    ad_url: "/ads/cafe.jpg",
    target_url: "https://coffee.example.com/",
    ad_type: "banner",
    ad_duration: 0,
    custom_button_text: "Order Now",
    active: false,
    cpv_rate: 2,
    budget: 2000,
    total_limit: 200,
    daily_limit: 20,
    daily_count: 15,
    impressions: 1500,
    bill_id: "3456789",
    bill_date: 10,
    bill_type: "recurring",
    bill_paid: true,
    cpn: "COFFEE-BNR",
  },
];

export const transactions: Transaction[] = [
  {
    id: "t1",
    mac: "A4:5E:60:11:22:01",
    amount: 100,
    type: "topup",
    method: "mpesa",
    node: "AP-CBD-01",
    timestamp: "2026-05-09 11:32",
  },
  {
    id: "t2",
    mac: "A4:5E:60:11:22:04",
    amount: 500,
    type: "voucher",
    method: "voucher",
    node: "AP-WST-07",
    timestamp: "2026-05-09 11:18",
  },
  {
    id: "t3",
    mac: "A4:5E:60:11:22:02",
    amount: 20,
    type: "session",
    method: "wallet",
    node: "AP-CBD-01",
    timestamp: "2026-05-09 11:10",
  },
  {
    id: "t4",
    mac: "A4:5E:60:11:22:07",
    amount: 50,
    type: "topup",
    method: "card",
    node: "AP-EST-03",
    timestamp: "2026-05-09 10:54",
  },
  {
    id: "t5",
    mac: "A4:5E:60:11:22:08",
    amount: 30,
    type: "topup",
    method: "mpesa",
    node: "AP-CBD-01",
    timestamp: "2026-05-09 10:41",
  },
  {
    id: "t6",
    mac: "A4:5E:60:11:22:05",
    amount: 5,
    type: "session",
    method: "wallet",
    node: "AP-CBD-02",
    timestamp: "2026-05-09 10:29",
  },
  {
    id: "t7",
    mac: "A4:5E:60:11:22:01",
    amount: 200,
    type: "topup",
    method: "mpesa",
    node: "AP-CBD-01",
    timestamp: "2026-05-09 09:51",
  },
];

export const activeSessions: ActiveSession[] = [
  {
    id: "s1",
    mac: "A4:5E:60:11:22:01",
    device: "iPhone 14",
    node: "AP-CBD-01",
    ip: "10.20.0.41",
    startedAt: "11:01",
    durationMin: 41,
    dataMb: 184,
    rateMbps: 12.4,
    plan: "1 Hour",
  },
  {
    id: "s2",
    mac: "A4:5E:60:11:22:02",
    device: "Samsung S23",
    node: "AP-CBD-01",
    ip: "10.20.0.42",
    startedAt: "11:18",
    durationMin: 24,
    dataMb: 92,
    rateMbps: 6.2,
    plan: "1 Day",
  },
  {
    id: "s3",
    mac: "A4:5E:60:11:22:04",
    device: "MacBook Pro",
    node: "AP-WST-07",
    ip: "10.20.0.78",
    startedAt: "10:12",
    durationMin: 90,
    dataMb: 612,
    rateMbps: 28.1,
    plan: "1 Week",
  },
  {
    id: "s4",
    mac: "A4:5E:60:11:22:05",
    device: "Xiaomi Redmi",
    node: "AP-CBD-02",
    ip: "10.20.0.55",
    startedAt: "11:31",
    durationMin: 11,
    dataMb: 14,
    rateMbps: 2.1,
    plan: "1 Hour",
  },
  {
    id: "s5",
    mac: "A4:5E:60:11:22:07",
    device: "OnePlus 11",
    node: "AP-EST-03",
    ip: "10.20.0.91",
    startedAt: "10:48",
    durationMin: 54,
    dataMb: 240,
    rateMbps: 18.6,
    plan: "1 Day",
  },
  {
    id: "s6",
    mac: "A4:5E:60:11:22:08",
    device: "Huawei P50",
    node: "AP-CBD-01",
    ip: "10.20.0.44",
    startedAt: "11:25",
    durationMin: 17,
    dataMb: 38,
    rateMbps: 4.4,
    plan: "1 Hour",
  },
];

export const notifications: NotificationItem[] = [
  {
    id: "no1",
    title: "New plan available",
    body: "Get 24h unlimited for  R100. Tap to upgrade.",
    audience: "all",
    channel: "portal",
    sentAt: "2026-05-09 09:00",
    delivered: 1240,
    opened: 412,
  },
  {
    id: "no2",
    title: "Low balance reminder",
    body: "Your wallet balance is below R10.",
    audience: "low-balance",
    channel: "portal",
    sentAt: "2026-05-08 18:00",
    delivered: 312,
    opened: 188,
  },
  {
    id: "no3",
    title: "Maintenance window tonight",
    body: "Brief outage 02:00–02:30 EAT on West nodes.",
    audience: "active",
    channel: "push",
    sentAt: "2026-05-07 17:30",
    delivered: 980,
    opened: 740,
  },
];

// Time series for charts
export const revenue7d = [
  { day: "Mon", topups: 4800, vouchers: 2200, ads: 1100 },
  { day: "Tue", topups: 5200, vouchers: 1900, ads: 1300 },
  { day: "Wed", topups: 6100, vouchers: 2700, ads: 1450 },
  { day: "Thu", topups: 5800, vouchers: 3100, ads: 1620 },
  { day: "Fri", topups: 7400, vouchers: 3600, ads: 2100 },
  { day: "Sat", topups: 8900, vouchers: 4200, ads: 2400 },
  { day: "Sun", topups: 7100, vouchers: 3300, ads: 1900 },
];

export const sessionsHourly = [
  { h: "00", v: 42 },
  { h: "02", v: 28 },
  { h: "04", v: 22 },
  { h: "06", v: 51 },
  { h: "08", v: 138 },
  { h: "10", v: 192 },
  { h: "12", v: 224 },
  { h: "14", v: 198 },
  { h: "16", v: 241 },
  { h: "18", v: 286 },
  { h: "20", v: 312 },
  { h: "22", v: 188 },
];

export const fmtCurrency = (n: number) => `R ${n.toLocaleString()}`;

export const settings: Settings[] = [
  {
    id: "main",
    auto_disconnect_zero_balance: true,
    show_ads_to_paying_users: false,
    email_daily_revenue_report: true,
    slack_alerts_offline_nodes: true,
    currency: "R",
    default_rate_mb: 0.1,
    idle_timeout_min: 30,
    session_cap_hours: 24,
    network_name: "Hotspot Hub",
    primary_color: "#3b82f6",
    welcome_message: "Welcome to Hotspot Hub!",
    terms_url: "https://example.com/terms",
    mac_auto_login: false,
    voucher_code: true,
    mpesa_stk_push: true,
    watch_ad_unlock: true,
    social_login: false,
    hotspot_host: "hotspot.example.com",
    radius_shared_secret: "shared-secret",
    portal_html: "<div style=\"background:#09020f;color:#f8e34a;padding:24px;font-family:Inter,ui-sans-serif,system-ui,sans-serif;\"><h1 style=\"color:#c084fc;\">Welcome to {{network_name}}</h1><p>{{welcome_message}}</p><p><a style=\"color:#fde047;\" href=\"{{terms_url}}\">Terms and conditions</a></p></div>",
  },
];
