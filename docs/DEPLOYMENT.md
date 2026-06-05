# DEPLOYMENT.md

> How to deploy NovelRyt. Related: [ARCHITECTURE.md](./ARCHITECTURE.md).
> Last updated: 2026-06-05.

## Hosting model
Static PWA on **Cloudflare Pages**, connected to the GitHub repo
`prjsab02/novelryt` for **automatic deployment on every push to `main`**.

## Cloudflare Pages settings (dashboard)
When connecting the repo in the Cloudflare dashboard
(*Workers & Pages → Create → Pages → Connect to Git*), use:

| Setting | Value |
|---|---|
| Production branch | `main` |
| Framework preset | `Vite` |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Node version | `20` (or `22`) — set env var `NODE_VERSION=20` |

SPA routing is handled by [`public/_redirects`](../public/_redirects)
(`/* /index.html 200`), which Cloudflare Pages copies into `dist/`.

## Environment variables (optional)
All are optional — the app runs local-first with none set. Configure in
Cloudflare Pages → Settings → Environment variables if/when enabling cloud:

```
VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, VITE_FIREBASE_PROJECT_ID,
VITE_FIREBASE_STORAGE_BUCKET, VITE_FIREBASE_MESSAGING_SENDER_ID, VITE_FIREBASE_APP_ID
```

### AI keys (server-side secret — required for AI features)
Gemini keys live **only** server-side, used by the Pages Function `functions/api/ai.ts`
(ADR 002). Set a secret on the Pages project:

- **Name:** `GEMINI_API_KEYS` — **Value:** one key, or several comma/newline-separated
  (`key1,key2,key3`). Click **Encrypt**. Optional: `GEMINI_MODEL` (default `gemini-1.5-flash`).

The browser never receives a key. The function rotates keys and fails over per request.

**Set it via Wrangler (no dashboard):**
```
npx wrangler login            # one-time, opens a browser to authorize
npm run secrets:push          # reads .dev.vars → sets GEMINI_API_KEYS on Pages
```
`npm run secrets:push` ([scripts/push-secrets.mjs](../scripts/push-secrets.mjs)) reads
the keys from local `.dev.vars` (gitignored) and runs `wrangler pages secret put`.
Requires the Pages project to already exist (repo connected — GETTING_STARTED Step 1).

**Local Functions dev (test AI on your machine):**
```
npm run dev:cf                # = wrangler pages dev -- npm run dev (reads .dev.vars)
```

Firebase web config is committed in `.env.production` (public values, build-time) —
no action needed for it.

## Local commands
```
npm install
npm run build      # tsc -b && vite build  → dist/
npm run preview    # serve dist/ locally
```

## Rollback
Cloudflare Pages keeps every deployment. Roll back via
*Pages → Deployments → (pick a previous build) → Rollback*. Each deployment maps
1:1 to a git commit, so rollback == redeploying an earlier commit.
