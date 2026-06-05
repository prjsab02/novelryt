# DATA_MODEL.md

> Related: [ARCHITECTURE.md](./ARCHITECTURE.md), PRD Part 2 & Part 9.
> Last updated: 2026-06-02.

## Two layers
- **Author Content**: User, Project, Book, Chapter, Scene, Note.
- **Story Intelligence** (AI-maintained, user-editable): Character, Location,
  Organization, Event, Relationship, Timeline, Lore, Artifact, Research, AI Analysis.

## Entity hierarchy
```
User → Projects → Books → Chapters → Scenes
                → Characters / Locations / Organizations / Events
                → Relationships / Timeline / Lore / Notes / Research
```

## Core entities (implemented)
All entities share: `id`, `createdAt`, `updatedAt`.

| Entity | Key fields |
|---|---|
| Project | title, description, genre, status, ownerId |
| Book | projectId, title, synopsis, order |
| Chapter | bookId, projectId, title, content, summary, wordCount, order |
| Scene | chapterId, title, content, povCharacterId, locationId, order |
| Character | projectId, name, aliases[], description, traits, goals, status, tags[] |
| Location | projectId, name, type, description, parentLocationId |
| Note | projectId, type, title, content, tags[], pinned |
| ChatSession | projectId, mode, messages[] |

`Project.status`: Planning | Drafting | Revising | Editing | Completed | Archived.
`Character.status`: Active | Deceased | Missing | Retired.

## Persistence
Dexie (IndexedDB) tables keyed by `id`, indexed by `projectId` (+ parent id and
`order` where relevant) for efficient scoped queries. The repository layer is the
only code that touches Dexie; everything else uses repositories.

## Ownership & lifecycle
Soft-delete preferred for user content (PRD §388); hard delete only via explicit
"permanent delete". Cloud sync (future) reconciles per-entity `updatedAt`.
