import type { Db, Collection, Document, OptionalUnlessRequiredId } from "mongodb";
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
  var __mongodbClientPromise: Promise<any> | undefined;
  const process: any;
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

// Broadcast updates every 5 seconds
// setInterval(() => {
//   broadcast(JSON.stringify({ type: 'update' }));
// }, 5000);

export { broadcast, clients };

function getEnvBindings(env: unknown): EnvBindings | undefined {
  if (!env || typeof env !== "object") return undefined;
  return env as EnvBindings;
}

function getProcessEnv(): Record<string, string | undefined> | undefined {
  if (typeof process === "undefined") return undefined;
  return process.env;
}

function isNodeRuntime(): boolean {
  return typeof process !== "undefined" && typeof process.versions === "object" && typeof process.versions.node === "string";
}

const mongodbPackageName = ["mongo", "db"].join("");

async function importMongoClient(): Promise<typeof import("mongodb")> {
  return await import(mongodbPackageName);
}

function getMongoUri(env?: EnvBindings): string {
  const envUri = env?.MONGODB_URI ?? getProcessEnv()?.MONGODB_URI;
  return typeof envUri === "string" && envUri.length > 0 ? envUri : DEFAULT_MONGODB_URI;
}

function getDbName(env?: EnvBindings): string {
  return (env?.MONGODB_DB as string) || getProcessEnv()?.MONGODB_DB || DEFAULT_DB_NAME;
}

const workerCollections: Record<string, any[]> = {
  nodes,
  users,
  vouchers,
  advertisements: ads,
  transactions,
  activeSessions,
  notifications,
  revenue7d,
  sessionsHourly,
  settings,
};

function matchFilter(item: Record<string, any>, filter: Record<string, any>): boolean {
  return Object.entries(filter).every(([key, value]) => {
    if (value && typeof value === "object" && "$oid" in value && item[key] && typeof item[key] === "object") {
      return item[key].$oid === value.$oid;
    }
    return item[key] === value;
  });
}

function createWorkerCollection(name: string) {
  const items = workerCollections[name] || [];

  return {
    find: () => ({
      toArray: async () => items.map((item) => ({ ...item })),
    }),
    estimatedDocumentCount: async () => items.length,
    deleteMany: async (filter: unknown) => {
      if (!filter || (typeof filter === "object" && Object.keys(filter).length === 0)) {
        items.length = 0;
        return;
      }
      if (typeof filter === "object" && filter !== null) {
        for (let i = items.length - 1; i >= 0; i--) {
          if (matchFilter(items[i], filter as Record<string, any>)) {
            items.splice(i, 1);
          }
        }
      }
    },
    insertMany: async (docs: any[]) => {
      items.push(...docs.map((doc) => ({ ...doc })));
    },
    insertOne: async (doc: any) => {
      items.push({ ...doc });
    },
    updateOne: async (filter: any, update: any) => {
      const index = items.findIndex((item) => matchFilter(item, filter));
      if (index === -1) {
        return { matchedCount: 0, modifiedCount: 0 };
      }
      const updateDoc = update?.$set ? { ...items[index], ...update.$set } : { ...items[index] };
      items[index] = updateDoc;
      return { matchedCount: 1, modifiedCount: 1 };
    },
    findOne: async (filter: any) => {
      const item = items.find((item) => matchFilter(item, filter));
      return item ? { ...item } : null;
    },
  };
}

function createWorkerDb() {
  return {
    collection: (name: string) => createWorkerCollection(name),
  };
}

export async function getDb(env?: unknown): Promise<Db> {
  if (!isNodeRuntime()) {
    return createWorkerDb() as unknown as Db;
  }

  const bindings = getEnvBindings(env);
  const uri = getMongoUri(bindings);
  const { MongoClient: MongoClientRuntime } = await importMongoClient();

  if (!globalThis.__mongodbClientPromise) {
    globalThis.__mongodbClientPromise = new MongoClientRuntime(uri).connect();
  }
  const client = await globalThis.__mongodbClientPromise;
  return client.db(getDbName(bindings));
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

export async function ensureDbSeeded(env?: unknown) {
  const db = await getDb(env);
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

  try {
    await ensureDbSeeded(env);
    const db = await getDb(env);

    if (path === "" || path === "status") {
      return jsonResponse({ status: "ok" });
    }

    if (path === "dashboard") {
      return jsonResponse({
        nodes: await db.collection("nodes").find().toArray(),
        users: await db.collection("users").find().toArray(),
        activeSessions: await db.collection("activeSessions").find().toArray(),
        transactions: await db.collection("transactions").find().toArray(),
        revenue7d: await db.collection("revenue7d").find().toArray(),
        sessionsHourly: await db.collection("sessionsHourly").find().toArray(),
      });
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

    if (!validCollections.has(collectionName)) {
      return jsonResponse({ error: "Not found" }, 404);
    }

    if (request.method === "GET") {
      return jsonResponse(await db.collection(collectionName).find().toArray());
    }

    if (request.method === "POST" && collectionName === "advertisements") {
      const body = await request.json() as Record<string, any>;
      body._id = { $oid: Date.now().toString() }; // Simple ID generation
      body.impressions = 0;
      body.daily_count = 0;
      await db.collection(collectionName).insertOne(body);
      await calculateRevenue7d(db); // Recalculate after insert
      await calculateSessionsHourly(db);
      broadcast(JSON.stringify({ type: 'update' })); // Notify clients
      return jsonResponse({ success: true }, 201);
    }

    if (request.method === "POST" && collectionName === "notifications") {
      const body = await request.json() as Record<string, any>;
      body.id = Date.now().toString(); // Simple ID generation
      body.sentAt = new Date().toISOString();
      body.delivered = Math.floor(Math.random() * 1000) + 100; // Mock delivery count
      body.opened = Math.floor(body.delivered * (0.3 + Math.random() * 0.4)); // Mock open rate 30-70%
      await db.collection(collectionName).insertOne(body);
      broadcast(JSON.stringify({ type: 'update' })); // Notify clients
      return jsonResponse({ success: true }, 201);
    }

    if (request.method === "PUT" && collectionName === "settings") {
      const body = await request.json() as Record<string, any>;
      const { _id, ...dataToUpdate } = body; // Remove MongoDB's _id to avoid issues
      
      // Try to update by id field first
      let result = await db.collection(collectionName).updateOne({ id: "main" }, { $set: dataToUpdate });
      
      // If no match, try to find any document and update it
      if (result.matchedCount === 0) {
        const existing = await db.collection(collectionName).findOne({});
        if (existing) {
          // Update the first document found
          await db.collection(collectionName).updateOne({ _id: existing._id }, { $set: { ...dataToUpdate, id: "main" } });
        } else {
          // No documents exist, insert a new one
          await db.collection(collectionName).insertOne({ id: "main", ...dataToUpdate } as any);
        }
      }
      
      // Fetch and return the updated document for verification
      const updated = await db.collection(collectionName).findOne({ id: "main" });
      broadcast(JSON.stringify({ type: 'update' })); // Notify clients
      return jsonResponse(updated || { success: true });
    }

    return jsonResponse({ error: "Method not allowed" }, 405);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown server error";
    return jsonResponse({ error: message }, 500);
  }
}
