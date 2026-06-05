# FEATURE_CATALOG.md

> Authoritative inventory of capabilities. Status: Proposed | Planned |
> In Progress | Implemented | Experimental | Deprecated | Removed.
> Last updated: 2026-06-02.

| ID | Feature | Status | Priority | PRD ref | Notes |
|---|---|---|---|---|---|
| FEATURE-001 | Documentation/memory system | Implemented | High | Workflow | `.agent/` + `docs/` |
| FEATURE-002 | App foundation (PWA shell) | Implemented | High | §289–§346 | Vite/React/TS/Tailwind |
| FEATURE-003 | Offline-first data layer | Implemented | High | §378–§383 | Dexie + StorageAdapter |
| FEATURE-004 | Authentication | Implemented | High | §355–§357 | Google sign-in (Firebase) + offline guest mode; env-gated |
| FEATURE-024 | Firebase cloud sync | Implemented | High | §380–§388 | Firestore adapter w/ offline persistence; env-gated (was Planned) |
| FEATURE-005 | Project management + dashboard | Implemented | High | §536, §85 | CRUD |
| FEATURE-006 | Writing system (chapters/scenes) | Implemented | High | §95–§96 | reorder/rename/delete |
| FEATURE-007 | Manuscript editor + autosave | Implemented | High | §87, §91 | debounced autosave, word count |
| FEATURE-008 | Story Bible: characters | Implemented | High | §136–§147 | CRUD |
| FEATURE-009 | Story Bible: locations | Implemented | Medium | §148–§152 | CRUD |
| FEATURE-014 | Story Bible: organizations | Implemented | Medium | §153–§155 | CRUD |
| FEATURE-015 | Story Bible: lore | Implemented | Medium | §80, §171–§180 | CRUD, categorized |
| FEATURE-010 | Notes | Implemented | Medium | §103 | CRUD, pin |
| FEATURE-011 | AI proxy (server-side multi-key) | Implemented | High | §50–§51, §263–§271 | Cloudflare Function; keys server-side; rotation + failover |
| FEATURE-013 | Settings (theme) | Implemented | Medium | §323 | AI keys moved server-side (no client key UI) |
| FEATURE-012 | Story Chat | Implemented | High | §53, §246 | project-aware, retrieval context |
| FEATURE-020 | Timeline engine | Implemented | High | §159–§165 | events CRUD + chronological view; conflict-detection pending |
| FEATURE-021 | AI writing tools (rewrite/expand/condense/summarize/dialogue) | Implemented | High | §57–§61 | selection-based, suggestion-only |
| FEATURE-022 | Diagnostics — Story Doctor (consistency/plot holes/arcs) | Implemented | High | Part 6 | quick/standard/deep modes, advisory |
| FEATURE-023 | Export (TXT/MD/JSON backup) | Implemented | High | §128–§131 | DOCX/PDF/EPUB pending |
| FEATURE-027 | Import (TXT/MD manuscript + JSON restore) | Implemented | High | §128, §214–§217 | chapter auto-detection |
| FEATURE-029 | Writing goals & stats | Implemented | Medium | §101–§102, §233–§243 | daily goal, words today, streak |
| FEATURE-028 | Getting-started guide (non-technical) | Implemented | High | — | docs/GETTING_STARTED.md |
| FEATURE-026 | Deployment: GitHub + Cloudflare Pages | In Progress | High | §408–§411 | repo pushed; connect in CF dashboard (docs/DEPLOYMENT.md) |
| FEATURE-025 | Knowledge/relationship graph | Planned | Medium | §170, §182 | React Flow |
| FEATURE-030 | Collaboration | Planned | Low | §114–§120 | post-MVP |
| FEATURE-031 | Voice dictation | Planned | Low | §121–§122 | post-MVP |
| FEATURE-032 | Multi-language | Planned | Low | §123–§125 | post-MVP |
