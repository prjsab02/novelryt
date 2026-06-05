# DECISIONS.md

Major decisions are recorded as ADRs in `docs/adr/`. This file is the index.

- **ADR 001 — Local-first, offline-capable data layer.** IndexedDB (Dexie) is
  the primary store; cloud (Firebase) is an optional sync adapter. Lets the app
  run with zero cloud config and satisfies PRD offline-first requirements.
- **ADR 002 — Provider-agnostic AI Gateway with multi-key pool.** All AI calls
  route through one gateway that owns key selection, rotation, and failover.
- **ADR 003 — Frontend stack: React + TS + Vite + Tailwind + Zustand.** Matches
  PRD §346; free, small-bundle, agent-friendly.

See `docs/adr/` for full context, alternatives, and consequences.
