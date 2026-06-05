# AI_SYSTEMS.md

> Related: [ARCHITECTURE.md](./ARCHITECTURE.md), ADR 002, PRD Part 3 & Part 7.
> Last updated: 2026-06-02.

## Server-side AI proxy (ADR 002, revised)
All AI requests go to a **Cloudflare Pages Function** at `/api/ai`
(`functions/api/ai.ts`). The browser calls it via `src/features/ai/client.ts`
(`runAI`). UI/features never call Gemini or handle a key directly (PRD §50).

## Multi-key pool (server-side)
- Keys live **only** on the server as the Cloudflare secret `GEMINI_API_KEYS`
  (comma/newline-separated). The client never sees them.
- The function uses `src/lib/ai-key-pool.ts` (pure, unit-tested): `parseKeys`,
  `rotateKeys` (spread load), `classifyStatus` (failover vs skip-invalid).
- Per request it tries keys in rotated order, failing over on 429/5xx and
  skipping invalid (400/401/403) keys (PRD §269). The function is stateless, so
  cross-request cooldown isn't tracked (documented trade-off).

## Provider abstraction
The function targets the Gemini REST `generateContent` endpoint via `fetch`.
Swapping providers means editing one server file (PRD §392); the client contract
(`/api/ai` → `{text}`) is unchanged.

## Token conservation (mandatory — PRD §52, §272–§277)
- Never send the full manuscript.
- `buildContext()` retrieves only relevant pieces (current chapter text,
  selected text, matching story-bible entries) up to a budget.
- Heavy analysis is event-driven (on save), not per-keystroke.

## Chat modes
Story (project-aware), Research, Hybrid, Writing. MVP ships Story Chat; others
reuse the same gateway with different system prompts and context builders.

## Safety & control
AI output is advisory; it never mutates user content without an explicit user
action (PRD §79, §493). Responses surface uncertainty where practical.
