# Hotspot Hub

Hotspot Hub is an admin dashboard for managing prepaid WiFi infrastructure, advertisements, sessions, vouchers, and reporting.

## Overview

- Built with `Vite`, `React`, `TanStack Start`, and `Cloudflare` worker compatibility.
- Includes a live admin UI for nodes, users, vouchers, ads, notifications, revenue, and active sessions.
- Uses `src/server.ts` as the entry point and `src/lib/mongo.ts` for API routing.
- Mock seed data is provided in `src/lib/mock-data.ts`.

## Key features

- API endpoints for dashboard data and collections.
- SSR entry managed through `@tanstack/react-start/server-entry`.
- Cloudflare Wrangler compatibility via `wrangler.json`.

## Project structure

- `src/` — application source code
- `src/lib/` — API helpers, data models, and mock data
- `src/routes/` — route components and page logic
- `src/server.ts` — server entry and API routing
- `vite.config.ts` — Vite configuration for TanStack Start
- `wrangler.jsonc` — Cloudflare worker deployment config

## Getting started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Open the app in your browser at the address shown in the terminal.

## Available scripts

- `npm run dev` — start the Vite development server
- `npm run wrangler:dev` — start the Cloudflare Workers runtime locally
- `npm run build` — build the application
- `npm run build:dev` — build in development mode
- `npm run preview` — preview the production build
- `npm run lint` — run ESLint
- `npm run format` — format files with Prettier

## Environment variables

- `MONGODB_URI` — MongoDB connection URI (optional; defaults are defined in `src/lib/mongo.ts`)
- `MONGODB_DB` — MongoDB database name (optional; defaults to `linkdb`)

## API endpoints

- `GET /api/status` — health check
- `GET /api/dashboard` — combined dashboard data
- `GET /api/advertisements` — advertisement documents
- `GET /api/nodes`
- `GET /api/users`
- `GET /api/vouchnpm run devers`
- `GET /api/transactions`
- `GET /api/activeSessions`
- `GET /api/notifications`
- `GET /api/revenue7d`
- `GET /api/sessionsHourly`

## Notes

- `src/lib/mongo.ts` routes `/api/ads` to the `advertisements` collection for backward compatibility.
- The advertisement format is defined in `src/lib/mock-data.ts` under `Advertisement`.
