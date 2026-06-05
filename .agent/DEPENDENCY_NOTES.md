# DEPENDENCY_NOTES.md

> Before adding a dependency: justify necessity, check maintenance health and
> bundle impact. Prefer fewer dependencies.

| Package | Purpose | Notes |
|---|---|---|
| react / react-dom | UI runtime | PRD-mandated. |
| react-router-dom | Routing | Standard SPA router. |
| zustand | State management | PRD §346; tiny, hook-based. |
| dexie | IndexedDB wrapper | Offline-first store (ADR 001). Robust, well-maintained. |
| nanoid | ID generation | Tiny, URL-safe IDs for entities. |
| tailwindcss / postcss / autoprefixer | Styling | PRD §346. v3 (stable). |
| vite + @vitejs/plugin-react | Build/dev | PRD §346. |
| vite-plugin-pwa | PWA manifest + SW | PRD §293 PWA requirement. |
| vitest | Testing | Vite-native test runner. |

| firebase | Auth + Firestore (cloud sync) | Env-gated (ADR 001). Firestore offline persistence gives sync + conflict handling. See DEBT-006 (lazy-load to trim bundle). |

## Deliberately NOT added yet
- **@google/generative-ai** — AI Gateway calls the Gemini REST endpoint via
  `fetch` to stay provider-agnostic and dependency-light.
- DOCX/PDF/EPUB libs — added with the export feature (Phase 14).
