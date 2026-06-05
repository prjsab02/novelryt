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
- **Phase 8 — Diagnostics (Story Doctor)**: AI analysis with quick/standard/deep
  modes over a token-conscious context (chapters + bible + timeline); advisory.
- **Story Bible expanded**: organizations + categorized lore (Dexie v3).
- **Phase 1/15 — Firebase (env-gated)**: real auth (email/password + Google) via
  FirebaseAuthProvider and cloud sync via a Firestore StorageAdapter with offline
  persistence. Activates only when VITE_FIREBASE_* env vars are set; otherwise the
  app stays local-first. Setup: docs/FIREBASE_SETUP.md; rules: firestore.rules.

- **AI re-architecture (2026-06-06)**: all Gemini keys moved **server-side** to a
  Cloudflare Pages Function (`functions/api/ai.ts`) with multi-key rotation +
  failover (pure logic in `src/lib/ai-key-pool.ts`). Client calls `/api/ai` via
  `runAI`. Removed client-side gateway/provider and in-app key UI. Key = Cloudflare
  secret `GEMINI_API_KEYS`.
- **Auth simplified**: Google-only sign-in (Firebase) + offline guest mode;
  email/password removed.

## 🚀 LIVE (2026-06-06)

- Deployed to **https://novelryt.pages.dev** (Cloudflare Pages, git auto-deploy on
  push to `main` — verified). Firebase configured (Google sign-in + Firestore sync).
- AI verified end-to-end: `/api/ai` proxy with the 9-key server-side pool returns
  Gemini responses. Default model **gemini-2.5-flash** (1.5-flash retired on v1beta).

## In progress

- Continuing feature build-out (export formats, graph, AI auto-extraction).

## Pending (next)

- Diagnostics (Phase 8), import + DOCX/PDF/EPUB export, Firebase auth+sync
  adapter, organizations/lore entities, knowledge graph, broader tests.

## Blockers

- No Firebase project / Gemini keys provisioned in this environment, so cloud
  sync and live AI calls are untested end-to-end. App runs local-first.

## Temporary workarounds

- Auth is a local stub until Firebase credentials exist. See DEBT-001.
