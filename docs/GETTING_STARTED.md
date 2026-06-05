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

## STEP 2 — Enable AI (set the server-side key). Owner task, ~3 min.

AI runs through a secure server-side proxy — users never enter a key. You set the
key(s) once in Cloudflare and the whole app's AI features turn on.

1. Get one or more free keys: https://aistudio.google.com/app/apikey → sign in →
   **Create API key** → copy the `AIza...` value (repeat for more keys = more quota).
2. Cloudflare dashboard → your **novelryt** Pages project → **Settings** →
   **Variables and Secrets** → **Add** → under **Production**:
   - Variable name: `GEMINI_API_KEYS`
   - Value: your key, or several separated by commas: `key1,key2,key3`
   - Click **Encrypt** (makes it a secret) → **Save**.
3. **Deployments** → **Retry deployment** so the site picks up the new secret.

That's it — Story Chat, Story Doctor, and the writing tools now work for everyone,
with automatic rotation + failover across all the keys you provided.

## (Optional) Run it on your own computer
Requires Node.js 20+ (https://nodejs.org). Then in the project folder:
```
npm install
npm run dev      # opens http://localhost:5173 (writing works; AI needs the proxy)
```
To test AI locally too, create a file `.dev.vars` with `GEMINI_API_KEYS=yourkey`
and run `npx wrangler pages dev -- npm run dev` instead.
