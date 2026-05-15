import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Buffer } from "node:buffer";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = (async () => {
      // Try the packaged server-entry from @tanstack/react-start first (works in many builds)
      try {
        const pkg = await import("@tanstack/react-start/server-entry");
        return (pkg as { default?: ServerEntry }).default ?? (pkg as unknown as ServerEntry);
      } catch (e) {
        // ignore and try the built server bundle next
      }

      try {
        // Prefer the built server bundle in production when available
        // @ts-ignore: dynamic import of built server bundle (no types)
        const prod = (await import("../dist/server/index.js")) as any;
        return prod.default ?? (prod as ServerEntry);
      } catch (e) {
        // Fallback to source import for local/dev
        const dev = await import("../src/server");
        return (dev as { default?: ServerEntry }).default ?? (dev as unknown as ServerEntry);
      }
    })();
  }
  return serverEntryPromise;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Skip non-SSR API routes if needed
    const url = new URL(req.url || "/", `https://${req.headers.host || "localhost"}`);
    const pathname = url.pathname;

    // Construct the full URL from Vercel request headers
    const protocol = req.headers["x-forwarded-proto"] || "https";
    const host = req.headers["x-forwarded-host"] || req.headers.host || "localhost";
    const originalPath =
      (req.headers["x-vercel-original-path"] as string | undefined) ||
      (req.headers["x-now-original-path"] as string | undefined) ||
      pathname;
    const fullUrl = new URL(originalPath + url.search, `${protocol}://${host}`);

    // Get request body if present
    let body: BodyInit | undefined;
    if (req.method !== "GET" && req.method !== "HEAD") {
      if (typeof req.body === "string") {
        body = req.body;
      } else if (req.body) {
        body = JSON.stringify(req.body);
      }
    }

    // Create a Fetch API Request from the Vercel request
    const headers = new Headers();
    Object.entries(req.headers).forEach(([key, value]) => {
      if (typeof value === "string") {
        headers.set(key, value);
      } else if (Array.isArray(value)) {
        value.forEach((v) => headers.append(key, v));
      }
    });

    if (fullUrl.searchParams.has("debug")) {
      console.log("SSR debug hit", {
        path: fullUrl.pathname,
        query: Object.fromEntries(fullUrl.searchParams.entries()),
        method: req.method,
        headers: req.headers,
      });
      res.status(200).setHeader("content-type", "text/html; charset=utf-8");
      res.send(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>SSR Debug</title></head><body><h1>SSR function reached</h1><pre>${JSON.stringify({
        url: fullUrl.toString(),
        method: req.method,
        headers: Object.fromEntries(Object.entries(req.headers).map(([k,v]) => [k, v])),
      }, null, 2)}</pre></body></html>`);
      return;
    }

    const fetchRequest = new Request(fullUrl, {
      method: req.method,
      headers,
      body,
    });

    // Get the TanStack Start server entry and handle request
    const handler = await getServerEntry();
    const response = await handler.fetch(fetchRequest, {}, {});

    // Set response status
    res.status(response.status);

    // Set response headers
    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });

    // Handle response body
    if (response.body) {
      const arrayBuffer = await response.arrayBuffer();
      res.send(Buffer.from(arrayBuffer));
    } else {
      res.end();
    }
  } catch (error) {
    console.error("SSR Handler Error:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: error instanceof Error ? error.message : String(error),
    });
  }
}

