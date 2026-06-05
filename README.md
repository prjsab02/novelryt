# NovelRyt

**Write stories. Let AI manage everything else.**

NovelRyt is an AI-assisted novel-writing platform. You write; AI continuously
organizes and maintains your story universe — characters, locations, timeline,
relationships, lore, and consistency. It runs **offline-first** and is designed
to operate on free / free-tier infrastructure.

## Quick start

```bash
npm install
npm run dev      # http://localhost:5173
```

No accounts, keys, or cloud setup are required — the app runs fully local-first
against your browser's IndexedDB. To enable optional AI features, add Gemini API
keys in **Settings** (or copy `.env.example` → `.env`).

### Scripts
| Command | Description |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Typecheck + production build |
| `npm run preview` | Preview the production build |
| `npm run test` | Run unit tests (Vitest) |

## Status
Foundation + MVP core slice: auth, projects, writing editor with autosave, story
bible (characters/locations/notes), and an AI Gateway with Story Chat. See
[`docs/FEATURE_CATALOG.md`](docs/FEATURE_CATALOG.md) for the full inventory and
[`.agent/CURRENT_STATE.md`](.agent/CURRENT_STATE.md) for live progress.

## Documentation
This repo is the project's memory. Start at [`docs/index.md`](docs/index.md) and
[`docs/MASTER_DOCUMENTATION.md`](docs/MASTER_DOCUMENTATION.md). Contributors
(human or AI) must follow [`AI_AGENT_WORKFLOW.md`](AI_AGENT_WORKFLOW.md) and
[`WORKFLOW_COMPANION_01.md`](WORKFLOW_COMPANION_01.md).

### Onboarding reading order
1. README.md → 2. `AI_AGENT_WORKFLOW.md` → 3. `WORKFLOW_COMPANION_01.md` →
4. `docs/index.md` → 5. `docs/MASTER_DOCUMENTATION.md` →
6. `docs/ARCHITECTURE.md` → 7. `docs/FEATURE_CATALOG.md` →
8. `.agent/CURRENT_STATE.md` → 9. `.agent/HANDOFF.md`

## Tech stack
React + TypeScript + Vite + Tailwind + Zustand · IndexedDB (Dexie) · optional
Firebase · Gemini via a provider-agnostic AI Gateway · PWA.

## License
User content is owned entirely by the user. See PRD Part 11 (governance).
