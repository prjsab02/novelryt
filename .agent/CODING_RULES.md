# CODING_RULES.md

## Language & style
- TypeScript strict mode. No `any` unless justified with a comment.
- Functional React components + hooks. No class components.
- Path alias `@/` → `src/`.
- Formatting: 2-space indent, single quotes, semicolons, trailing commas.

## Architecture rules
- **Feature-based** organization under `src/features/<feature>`.
- UI components never call AI providers or the DB directly. They go through
  `services/` (data repositories) and `features/ai` (AI Gateway).
- Persistence is accessed only via repositories in `src/services/db`.
- Keep the storage layer behind an interface so Firebase can replace/augment
  IndexedDB without feature changes.

## AI rules
- All AI requests route through the AI Gateway (`src/features/ai/gateway.ts`).
- Never send the entire manuscript; send retrieved/relevant context only.
- AI never mutates user content without explicit user action.

## Naming
- Entities & fields follow PRD Part 9 (`id`, `projectId`, `createdAt`, ...).
- Files: kebab-case for modules, PascalCase for component files.

## Documentation
- Every feature updates `docs/FEATURE_CATALOG.md` + `.agent/CURRENT_STATE.md`.
- Every session appends to `.agent/SESSION_LOG.md`.
- Architectural decisions get an ADR in `docs/adr/`.

## Commits (when a git repo is initialized)
- Conventional commits: `feat(editor): ...`, `fix(ai): ...`, `docs: ...`.
