import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Buffer } from "node:buffer";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m as { default?: ServerEntry }).default ?? (m as unknown as ServerEntry),
    );
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
    const fullUrl = new URL(pathname + url.search, `${protocol}://${host}`);

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

