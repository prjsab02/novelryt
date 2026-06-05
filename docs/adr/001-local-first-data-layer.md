# ADR 001 — Local-first, offline-capable data layer

- Status: Accepted
- Date: 2026-06-02

## Context
The PRD requires offline-first operation (§281–§284, §378–§383), zero-cost
operation (§11), and no vendor lock-in (§287). Firebase Spark plan is the
intended cloud backend but must not be a hard dependency for the app to run.

## Problem
How do we persist user data so the app (a) works fully offline, (b) needs no
cloud configuration to run, and (c) can later sync to Firebase without rewrites?

## Decision
Use **IndexedDB (via Dexie)** as the primary, always-on store. Access it only
through repositories that sit behind a `StorageAdapter` interface. Cloud sync is
an *optional* adapter implementing the same interface, added later.

## Alternatives
- Firebase-only: violates offline-first + zero-config; couples features to a vendor.
- localStorage: too small / synchronous for manuscripts.
- SQLite WASM: heavier; unnecessary for current scale.

## Consequences
- App runs immediately, offline, with no keys. (+)
- Sync/conflict logic is deferred to the Firebase adapter (planned). (−, tracked)
- Repository indirection adds a thin layer but isolates persistence cleanly. (+)

## Risks / migration
Cross-device sync needs the Firebase adapter + conflict resolution (PRD §385–§386).
Until then, data is per-device. Migration is additive (no schema break expected).
