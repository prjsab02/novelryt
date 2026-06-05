# ADR 002 — Provider-agnostic AI Gateway with multi-key pool

- Status: Accepted
- Date: 2026-06-02

## Context
PRD mandates a centralized AI Gateway (§50), multiple Gemini keys with
rotation/failover (§49, §263–§271), provider abstraction (§392), and aggressive
token conservation (§52, §272–§277).

## Decision
**Revised 2026-06-06:** AI keys are held **server-side** in a Cloudflare Pages
Function (`/api/ai`), not in the client. The function owns the multi-key pool
(rotation + failover) using pure helpers in `src/lib/ai-key-pool.ts`; the browser
calls `/api/ai` via `runAI`. This removes client-side key handling entirely while
staying $0 (Cloudflare Workers free tier). Keys are the Cloudflare secret
`GEMINI_API_KEYS`. The provider remains Gemini REST behind a single server file,
so other providers can be swapped without client changes.

### Superseded approach
Originally the multi-key pool ran client-side (`AIGateway`) with keys entered
in-app. That exposed keys to the browser and was poor UX/security; replaced by
the server proxy above.

## Alternatives
- Direct provider calls from components: prohibited by PRD §50; spreads keys/retry
  logic across the UI.
- `@google/generative-ai` SDK: extra bundle weight; couples to one provider.

## Consequences
- Keys never reach the browser; one place for routing/failover. (+)
- $0: runs on Cloudflare Workers free tier (~100k req/day). (+)
- All users share the configured keys' quota (~1500 req/day/key on Gemini free
  tier); add more keys to scale. (−, mitigated by multi-key)
- AI requires the deployed site or `wrangler pages dev`; plain `vite dev` has no
  Functions (clear error surfaced). (−, documented)

## Risks / migration
Stateless function ⇒ no cross-request cooldown; mitigated by rotation + per-request
failover. Swapping/adding providers is a single server-file change.
