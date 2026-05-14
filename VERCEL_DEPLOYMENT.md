# Vercel Deployment Guide

This app now supports both **Cloudflare Workers** and **Vercel** deployment.

## Deploying to Vercel

### Prerequisites
- Vercel CLI or GitHub account connected to Vercel

### Option 1: Deploy via Vercel Dashboard
1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project" and import this repository
4. Vercel will auto-detect the settings from `vercel.json`
5. Click "Deploy"

### Option 2: Deploy via Vercel CLI
```bash
npm install -g vercel
vercel
```

### Environment Variables
If using MongoDB, add these to Vercel project settings:
- `MONGODB_URI` — MongoDB connection URI
- `MONGODB_DB` — Database name (defaults to `linkdb`)

### Build & Runtime
- **Build**: Vite builds the app with TanStack Start for Cloudflare compatibility
- **Runtime**: Node.js 20.x serverless functions serve SSR via `/api/ssr`
- **Static Assets**: Cached with long TTL headers

### How it Works
- All non-static routes are rewritten to `/api/ssr` 
- The `/api/ssr.ts` handler wraps the Cloudflare-style server entry
- Static assets (`/assets/*`, `/static/*`) are served directly from `dist/public`

## Deploying to Cloudflare Workers

For original Cloudflare Workers deployment:
```bash
npm run build
wrangler deploy
```

## Troubleshooting

### 404 Errors
- Ensure `vercel.json` rewrites are correct
- Check that the build output includes `dist/public`
- Verify the API route is deployed

### Build Fails
- Clear cache: `vercel env pull && vercel build --prod`
- Check Node version: Vercel uses 20.x
- Ensure `@vercel/node` is installed

### Server Not Starting
- Check Vercel function logs in project dashboard
- Verify environment variables are set
- Ensure MongoDB connection is working
