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

- **Phase 5 — Timeline**: events CRUD + chronological view (sequence + free-form
  date labels). Conflict detection pending.
- **Phase 7 — AI writing tools**: selection-based rewrite / expand / condense /
  summarize / improve-dialogue in the editor; suggestion-only (Replace/Insert).
- **Phase 14 — Export**: manuscript TXT/Markdown + full JSON backup.
- **Deployment**: repo initialized + pushed to github.com/prjsab02/novelryt;
  Cloudflare Pages settings documented in docs/DEPLOYMENT.md (connect in dashboard).

## In progress

- Cloudflare Pages connection (manual dashboard step by repo owner).

## Pending (next)

- Diagnostics (Phase 8), import + DOCX/PDF/EPUB export, Firebase auth+sync
  adapter, organizations/lore entities, knowledge graph, broader tests.

## Blockers

- No Firebase project / Gemini keys provisioned in this environment, so cloud
  sync and live AI calls are untested end-to-end. App runs local-first.

## Temporary workarounds

- Auth is a local stub until Firebase credentials exist. See DEBT-001.
