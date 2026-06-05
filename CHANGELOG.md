# Changelog

All notable changes are documented here. Format: Keep a Changelog; SemVer.

## [Unreleased]

### Added
- Documentation & operational-memory system (`.agent/`, `docs/`, ADRs 001–003).
- Phase 0 app foundation: Vite + React + TS + Tailwind + Zustand + router + PWA.
- Offline-first data layer: Dexie repositories behind a `StorageAdapter` interface.
- Phase 1 Authentication: local auth provider + route protection.
- Phase 2 Project management: CRUD + dashboard.
- Phase 3 Writing system: books/chapters/scenes, editor, debounced autosave, word count.
- Phase 4 Story Bible: characters, locations, notes (CRUD).
- Phase 6 AI Gateway: provider-agnostic, multi-key Gemini pool (round-robin + failover).
- Story Chat: project-aware chat with retrieval context.
- Settings: AI key management, theme.
- Phase 7 AI writing tools: selection-based rewrite/expand/condense/summarize/improve-dialogue (suggestion-only).
- Phase 14 Export: manuscript TXT/Markdown and full JSON project backup.
- Phase 5 Timeline engine: story events with chronological ordering and free-form date labels.
- docs/DEPLOYMENT.md: Cloudflare Pages auto-deploy configuration.
