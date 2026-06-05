# ADR 002 — Provider-agnostic AI Gateway with multi-key pool

- Status: Accepted
- Date: 2026-06-02

## Context
PRD mandates a centralized AI Gateway (§50), multiple Gemini keys with
rotation/failover (§49, §263–§271), provider abstraction (§392), and aggressive
token conservation (§52, §272–§277).

## Decision
All AI access goes through one `AIGateway`. It owns a pool of API keys with
round-robin selection, failover on error/rate-limit, and cooldown tracking. It
targets the Gemini REST endpoint behind an `AIProvider` interface (via `fetch`,
no SDK dependency), so other providers can be added later.

## Alternatives
- Direct provider calls from components: prohibited by PRD §50; spreads keys/retry
  logic across the UI.
- `@google/generative-ai` SDK: extra bundle weight; couples to one provider.

## Consequences
- One place for routing, quota, retries, logging. (+)
- Keys are user-supplied and stored client-side (user-owned, rotatable). (+)
- Server-side key proxying is not done (static-hosting constraint); documented as
  a security trade-off in SECURITY considerations. (−)

## Risks / migration
Client-held keys are visible to the user who owns them (acceptable: their own
keys). A future serverless proxy could centralize keys if a backend is added.
