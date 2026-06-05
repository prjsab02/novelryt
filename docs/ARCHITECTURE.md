# ARCHITECTURE.md

> Authoritative architecture reference. Related: [DATA_MODEL.md](./DATA_MODEL.md),
> [AI_SYSTEMS.md](./AI_SYSTEMS.md), ADRs. Last updated: 2026-06-02.

## Layering

```
UI (React components / pages)
        │  (no direct DB or AI calls)
        ▼
Feature modules (src/features/*)  ── Zustand stores for view state
        │
        ▼
Service layer (src/services/*)
        ├── db/ repositories  ──► StorageAdapter ──► IndexedDB (Dexie)  [default]
        │                                        └─► Firebase (future adapter)
        └── ai gateway (src/features/ai) ──► Gemini REST (multi-key pool)
```

Principles: separation of concerns; UI is dumb; persistence and AI are behind
interfaces so providers swap without touching features (ADR 001, 002).

## Repository structure

```
src/
├── app/            # app shell, providers, router
├── components/     # shared UI primitives (Button, Input, ...)
├── features/
│   ├── auth/       # auth provider + guard + login page
│   ├── projects/   # project CRUD + dashboard
│   ├── editor/     # chapters/scenes editor + autosave
│   ├── storybible/ # characters, locations, notes
│   └── ai/         # AI Gateway + Story Chat
├── services/
│   └── db/         # Dexie schema, StorageAdapter, repositories
├── lib/            # utilities (word count, ids, debounce)
├── types/          # shared domain types
└── styles/         # global css
```

## State management
Zustand stores per concern (auth session, current project). Persistent data is
the source of truth in IndexedDB; stores cache and coordinate UI.

## Offline-first & sync
IndexedDB is the primary store; the app is fully usable offline. A future
Firebase adapter implements the same `StorageAdapter` interface to add cloud
sync + conflict resolution (PRD Part 9, §380–§388) without feature rewrites.

## AI architecture
All AI requests pass through the AI Gateway (PRD §50). It owns a key pool with
round-robin selection, failover, and cooldown tracking. Context is retrieved
(relevant chapters/entities), never the whole manuscript (PRD §52, §274).
Details: [AI_SYSTEMS.md](./AI_SYSTEMS.md).

## Evolution
Architecture changes require an ADR (see `adr/`). No silent drift.
