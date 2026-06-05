# TASKS.md

Status legend: TODO / DOING / DONE / DEFERRED

## Foundation
- [DONE] Phase 0 scaffolding + docs system
- [DONE] Offline-first data layer (Dexie repositories + storage interface)

## Core MVP
- [DONE] Phase 1 Auth (local provider + route guard)
- [DONE] Phase 2 Projects (CRUD + dashboard)
- [DONE] Phase 3 Writing (chapters/scenes, editor, autosave, word count)
- [DONE] Phase 4 Story Bible (characters, locations, notes)
- [DONE] Phase 6 AI Gateway foundation + Story Chat UI

## Backlog (priority order)
- [TODO] Phase 5 Timeline engine (events, chronological view, conflict flags)
- [TODO] Phase 7 AI writing tools (rewrite / expand / condense / summarize)
- [TODO] Phase 8 Diagnostics (consistency, plot holes, character arcs)
- [TODO] Phase 14 Import/Export (TXT, MD, DOCX, PDF, JSON backup)
- [TODO] Firebase adapter (Auth + Firestore sync) behind storage interface
- [TODO] Phase 15 Offline sync engine + conflict resolution
- [TODO] Test suite (unit: word count, gateway routing, repositories)
- [TODO] Knowledge graph + relationship graph visualization
- [DEFERRED] Collaboration, voice, multi-language, publishing tools

## Technical debt
- See docs/TECHNICAL_DEBT.md (DEBT-001 local-auth stub).
