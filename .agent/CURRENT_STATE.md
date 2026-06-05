# CURRENT_STATE.md

> Must always reflect current reality. Last updated: 2026-06-02

## Completed

- **Phase 0 — Foundation**: repo scaffolding, build tooling (Vite/TS/Tailwind),
  documentation system (`.agent/`, `docs/`), coding rules.
- **Data layer**: offline-first IndexedDB repositories (Dexie) with a storage
  abstraction so a Firebase adapter can be added without touching features.
- **Phase 1 — Auth**: local auth provider (email-based, offline) behind an
  `AuthProvider` abstraction; route protection. Firebase auth = future adapter.
- **Phase 2 — Projects**: project CRUD + dashboard.
- **Phase 3 — Writing**: books → chapters; manuscript editor with debounced
  autosave; live word count; chapter reorder/rename/delete. Scenes are modeled
  in the data layer; dedicated scene UI is deferred (DEBT-005).
- **Phase 4 — Story Bible (basics)**: characters, locations, notes CRUD.
- **Phase 6 — AI Gateway (foundation)**: provider-agnostic gateway, multi-key
  Gemini pool with round-robin + failover; Story Chat (project-aware) UI.

## In progress

- Wiring AI Gateway responses into Story Chat with retrieval context.

## Pending (next)

- Timeline engine (Phase 5), AI writing tools rewrite/expand (Phase 7),
  diagnostics (Phase 8), exports (Phase 14), Firebase sync adapter, tests.

## Blockers

- No Firebase project / Gemini keys provisioned in this environment, so cloud
  sync and live AI calls are untested end-to-end. App runs local-first.

## Temporary workarounds

- Auth is a local stub until Firebase credentials exist. See DEBT-001.
