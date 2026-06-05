# GETTING_STARTED.md — for non-technical owners

> The only two things that require manual action. Everything else is automated.

## STEP 1 — Connect Cloudflare (makes the site live + auto-deploy). Required.

1. Go to https://dash.cloudflare.com/sign-up and create a free account; verify email.
2. Log in → left sidebar → **Workers & Pages**.
3. **Create application** → **Pages** tab → **Connect to Git**.
4. **Connect GitHub** → **Authorize Cloudflare** → grant access to the `novelryt` repo.
5. Select `novelryt` → **Begin setup**. Fill in exactly:
   - Project name: `novelryt`
   - Production branch: `main`
   - Framework preset: **Vite**
   - Build command: `npm run build`
   - Build output directory: `dist`
6. Environment variables → add `NODE_VERSION` = `20`.
7. **Save and Deploy**. Wait ~2 min → you get a live URL like `https://novelryt.pages.dev`.

Every future code push auto-deploys. No need to repeat these steps.

## STEP 2 — Free AI key (enables AI features). Optional.

1. Go to https://aistudio.google.com/app/apikey → sign in with Google.
2. **Create API key** → copy the `AIza...` value.
3. In the live app → **Settings** → paste into **API keys** → **Save keys**.

The key stays only in your browser (your personal free quota). Multiple keys can
be pasted one per line; the app rotates them with automatic failover.

## (Optional) Run it on your own computer
Requires Node.js 20+ (https://nodejs.org). Then in the project folder:
```
npm install
npm run dev      # opens http://localhost:5173
```
