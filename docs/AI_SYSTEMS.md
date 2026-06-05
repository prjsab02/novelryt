# AI_SYSTEMS.md

> Related: [ARCHITECTURE.md](./ARCHITECTURE.md), ADR 002, PRD Part 3 & Part 7.
> Last updated: 2026-06-02.

## AI Gateway
Single entry point for all AI requests (`src/features/ai/gateway.ts`). UI and
features never call providers directly (PRD §50). Responsibilities:
key selection, rotation, failover, cooldown, request shaping, error handling.

## Multi-key pool
- Keys come from in-app Settings (stored locally, user-owned) or `VITE_GEMINI_API_KEYS`.
- Selection strategy: round-robin across healthy keys.
- On rate-limit/error: mark key cooling-down, fail over to next key (PRD §269).
- Key states: Active | RateLimited | Disabled | Invalid (PRD §51).

## Provider abstraction
The gateway targets the Gemini REST `generateContent` endpoint via `fetch`, behind
an `AIProvider` interface, so OpenAI/local providers can be added later (PRD §392).

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
