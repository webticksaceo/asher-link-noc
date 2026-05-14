import type { Db, Collection, Document, MongoClient, OptionalUnlessRequiredId } from "mongodb";
import {
  activeSessions,
  ads,
  nodes,
  notifications,
  revenue7d,
  sessionsHourly,
  transactions,
  users,
  vouchers,
  settings,
} from "./mock-data";

interface EnvBindings {
  MONGODB_URI?: string;
  MONGODB_DB?: string;
  [key: string]: unknown;
}

declare global {
  var __mongodbClientPromise: Promise<MongoClient> | undefined;
}

const DEFAULT_MONGODB_URI = "mongodb+srv://oxeansa:oxeanpass1@cluster0.sh0vm.mongodb.net/?appName=Cluster0";
const DEFAULT_DB_NAME = "linkdb";

const clients = new Set<WebSocket>();

function broadcast(message: string) {
  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  }
}

export { broadcast, clients };

function getEnvBindings(env: unknown): EnvBindings | undefined {
  if (!env || typeof env !== "object") return undefined;
  return env as EnvBindings;
}

function getProcessEnv(): NodeJS.ProcessEnv | undefined {
  try {
    if (typeof process === "undefined") return undefined;
    return process.env;
  } catch {
    return undefined;
  }
}

function getMongoUri(env?: EnvBindings): string {
  const envUri = env?.MONGODB_URI ?? getProcessEnv()?.MONGODB_URI;
  return typeof envUri === "string" && envUri.length > 0 ? envUri : DEFAULT_MONGODB_URI;
}

function getDbName(env?: EnvBindings): string {
  return (env?.MONGODB_DB as string) || getProcessEnv()?.MONGODB_DB || DEFAULT_DB_NAME;
}

export async function getDb(env?: unknown): Promise<Db> {
  const bindings = getEnvBindings(env);
  const uri = getMongoUri(bindings);
  
  try {
    const { MongoClient: MongoClientRuntime } = await import("mongodb");

    if (!globalThis.__mongodbClientPromise) {
      globalThis.__mongodbClientPromise = new MongoClientRuntime(uri).connect();
    }
    const client = await globalThis.__mongodbClientPromise;
    return client.db(getDbName(bindings));
  } catch (error) {
    // MongoDB library not available (common in edge environments like Cloudflare Workers)
    throw new Error("MongoDB library not available", { cause: error });
  }
}

async function ensureCollectionSeeded<T>(db: Db, name: string, docs: T[]) {
  const collection = db.collection(name) as Collection<T & Document>;
  const count = await collection.estimatedDocumentCount();
  if (count === 0 && docs.length > 0) {
    await collection.insertMany(docs as OptionalUnlessRequiredId<T & Document>[]);
  }
}

async function calculateRevenue7d(db: Db) {
  const transactions = await db.collection("transactions").find().toArray();
  const revenueMap = new Map<string, { topups: number; vouchers: number; ads: number }>();
  transactions.forEach((t: any) => {
    const date = new Date(t.timestamp);
    const day = date.toISOString().split('T')[0];
    if (!revenueMap.has(day)) revenueMap.set(day, { topups: 0, vouchers: 0, ads: 0 });
    const rev = revenueMap.get(day)!;
    if (t.type === 'topup') rev.topups += t.amount;
    else if (t.type === 'voucher') rev.vouchers += t.amount;
    else if (t.type === 'session') rev.ads += t.amount; // Assuming ads revenue from sessions
  });
  const revenue7d = Array.from(revenueMap.entries()).map(([day, data]) => ({ day, ...data }));
  await db.collection("revenue7d").deleteMany({});
  await db.collection("revenue7d").insertMany(revenue7d);
}

async function calculateSessionsHourly(db: Db) {
  const sessions = await db.collection("activeSessions").find().toArray();
  const sessionMap = new Map<string, number>();
  sessions.forEach((s: any) => {
    const date = new Date(s.startedAt);
    const hour = date.getHours().toString().padStart(2, '0') + ':00';
    sessionMap.set(hour, (sessionMap.get(hour) || 0) + 1);
  });
  const sessionsHourly = Array.from(sessionMap.entries()).map(([h, v]) => ({ h, v }));
  await db.collection("sessionsHourly").deleteMany({});
  await db.collection("sessionsHourly").insertMany(sessionsHourly);
}

async function tryGetDb(env?: unknown): Promise<Db | null> {
  try {
    return await getDb(env);
  } catch (error) {
    // Silently fall back to mock data - this is expected in edge environments
    if (typeof console !== "undefined" && process.env.DEBUG_DB) {
      console.warn("MongoDB unavailable, using mock data");
    }
    return null;
  }
}

function getMockCollection(name: string) {
  switch (name) {
    case "nodes":
      return nodes;
    case "users":
      return users;
    case "vouchers":
      return vouchers;
    case "advertisements":
      return ads;
    case "transactions":
      return transactions;
    case "activeSessions":
      return activeSessions;
    case "notifications":
      return notifications;
    case "revenue7d":
      return revenue7d;
    case "sessionsHourly":
      return sessionsHourly;
    case "settings":
      return settings;
    default:
      return [];
  }
}

function getMockDashboard() {
  return {
    nodes,
    users,
    activeSessions,
    transactions,
    revenue7d,
    sessionsHourly,
  };
}

export async function ensureDbSeeded(env?: unknown) {
  const db = await tryGetDb(env);
  if (!db) return;

  await Promise.all([
    ensureCollectionSeeded(db, "nodes", nodes),
    ensureCollectionSeeded(db, "users", users),
    ensureCollectionSeeded(db, "vouchers", vouchers),
    ensureCollectionSeeded(db, "advertisements", ads),
    ensureCollectionSeeded(db, "transactions", transactions),
    ensureCollectionSeeded(db, "activeSessions", activeSessions),
    ensureCollectionSeeded(db, "notifications", notifications),
    ensureCollectionSeeded(db, "revenue7d", revenue7d),
    ensureCollectionSeeded(db, "sessionsHourly", sessionsHourly),
    ensureCollectionSeeded(db, "settings", settings),
  ]);
  await calculateRevenue7d(db);
  await calculateSessionsHourly(db);
}

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

export async function handleApiRequest(request: Request, env: unknown): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname.replace(/^\/api\/?/, "").replace(/\/$/, "");

  if (path === "" || path === "status") {
    return jsonResponse({ status: "ok" });
  }

  const validCollections = new Set([
    "nodes",
    "users",
    "vouchers",
    "advertisements",
    "transactions",
    "activeSessions",
    "notifications",
    "revenue7d",
    "sessionsHourly",
    "settings",
  ]);
  const collectionName = path === "ads" ? "advertisements" : path;
  if (!validCollections.has(collectionName) && path !== "dashboard") {
    return jsonResponse({ error: "Not found" }, 404);
  }

  const db = await tryGetDb(env);

  try {
    if (path === "dashboard") {
      if (!db) {
        return jsonResponse(getMockDashboard());
      }

      return jsonResponse({
        nodes: await db.collection("nodes").find().toArray(),
        users: await db.collection("users").find().toArray(),
        activeSessions: await db.collection("activeSessions").find().toArray(),
        transactions: await db.collection("transactions").find().toArray(),
        revenue7d: await db.collection("revenue7d").find().toArray(),
        sessionsHourly: await db.collection("sessionsHourly").find().toArray(),
      });
    }

    if (!db) {
      if (request.method === "GET") {
        return jsonResponse(getMockCollection(collectionName));
      }

      if (request.method === "POST" && collectionName === "advertisements") {
        const body = await request.json() as Record<string, any>;
        body._id = { $oid: Date.now().toString() };
        body.impressions = 0;
        body.daily_count = 0;
        ads.push(body as any);
        broadcast(JSON.stringify({ type: 'update' }));
        return jsonResponse({ success: true }, 201);
      }

      if (request.method === "POST" && collectionName === "notifications") {
        const body = await request.json() as Record<string, any>;
        body.id = Date.now().toString();
        body.sentAt = new Date().toISOString();
        body.delivered = Math.floor(Math.random() * 1000) + 100;
        body.opened = Math.floor(body.delivered * (0.3 + Math.random() * 0.4));
        notifications.push(body as any);
        broadcast(JSON.stringify({ type: 'update' }));
        return jsonResponse({ success: true }, 201);
      }

      if (request.method === "PUT" && collectionName === "settings") {
        const body = await request.json() as Record<string, any>;
        const { _id, ...dataToUpdate } = body;
        if (settings.length > 0) {
          Object.assign(settings[0], dataToUpdate);
          return jsonResponse(settings[0]);
        }
        const newSetting = { id: "main", ...dataToUpdate } as any;
        settings.push(newSetting);
        return jsonResponse(newSetting);
      }

      return jsonResponse({ error: "Method not allowed" }, 405);
    }

    if (request.method === "GET") {
      return jsonResponse(await db.collection(collectionName).find().toArray());
    }

    if (request.method === "POST" && collectionName === "advertisements") {
      const body = await request.json() as Record<string, any>;
      body._id = { $oid: Date.now().toString() };
      body.impressions = 0;
      body.daily_count = 0;
      await db.collection(collectionName).insertOne(body);
      await calculateRevenue7d(db);
      await calculateSessionsHourly(db);
      broadcast(JSON.stringify({ type: 'update' }));
      return jsonResponse({ success: true }, 201);
    }

    if (request.method === "POST" && collectionName === "notifications") {
      const body = await request.json() as Record<string, any>;
      body.id = Date.now().toString();
      body.sentAt = new Date().toISOString();
      body.delivered = Math.floor(Math.random() * 1000) + 100;
      body.opened = Math.floor(body.delivered * (0.3 + Math.random() * 0.4));
      await db.collection(collectionName).insertOne(body);
      broadcast(JSON.stringify({ type: 'update' }));
      return jsonResponse({ success: true }, 201);
    }

    if (request.method === "PUT" && collectionName === "settings") {
      const body = await request.json() as Record<string, any>;
      const { _id, ...dataToUpdate } = body;

      let result = await db.collection(collectionName).updateOne({ id: "main" }, { $set: dataToUpdate });
      if (result.matchedCount === 0) {
        const existing = await db.collection(collectionName).findOne({});
        if (existing) {
          await db.collection(collectionName).updateOne({ _id: existing._id }, { $set: { ...dataToUpdate, id: "main" } });
        } else {
          await db.collection(collectionName).insertOne({ id: "main", ...dataToUpdate } as any);
        }
      }
      const updated = await db.collection(collectionName).findOne({ id: "main" });
      broadcast(JSON.stringify({ type: 'update' }));
      return jsonResponse(updated || { success: true });
    }

    return jsonResponse({ error: "Method not allowed" }, 405);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown server error";
    return jsonResponse({ error: message }, 500);
  }
}
