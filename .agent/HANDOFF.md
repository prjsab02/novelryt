# HANDOFF.md

> Optimize for rapid onboarding. A new contributor should grasp the situation
> in minutes. Last updated: 2026-06-02

## Current active task
Building NovelRyt from the PRD. Phase 0 foundation + MVP core slice
(auth → projects → editor/autosave → story bible → AI gateway) is in place and
builds. The app runs **local-first** (IndexedDB) with no cloud/AI keys needed.

## How to run
```
npm install
npm run dev        # local dev server
npm run build      # typecheck + production build
```

## Immediate next steps
1. Phase 5 Timeline engine.
2. Phase 7 AI writing tools (rewrite/expand/condense/summarize) via gateway.
3. Add a Firebase adapter implementing the `StorageAdapter` interface for sync.
4. Tests for word count, AI gateway routing/failover, repositories.

## Warnings / known risks
- Auth is a local stub (DEBT-001) — replace with Firebase Auth adapter.
- AI calls are untested live (no Gemini key in this environment). Gateway is
  structured + unit-testable; verify against a real key before relying on it.
- Do not send full manuscripts to AI — use the retrieval context builder.

## Key files
- `src/services/db/` — Dexie schema + repositories + storage interface.
- `src/features/ai/gateway.ts` — AI Gateway (key pool, routing, failover).
- `src/features/editor/` — manuscript editor + autosave.
- `src/app/router.tsx` — routes + auth guard.
