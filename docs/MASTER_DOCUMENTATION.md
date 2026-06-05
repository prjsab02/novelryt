# MASTER_DOCUMENTATION.md

> Purpose: highest-level reference; understand NovelRyt top-to-bottom.
> Audience: developers, AI agents, future maintainers.
> Related: every doc in [index.md](./index.md). Last updated: 2026-06-02.

## 1. Executive summary
NovelRyt is a $0-infrastructure, AI-assisted novel-writing platform. Authors
write; AI maintains the story bible, timeline, relationships, and consistency.
This document summarizes; details live in linked specialized docs.

## 2–6. Product / Vision / Goals / Non-goals
See [PROJECT_BRIEF.md](../PROJECT_BRIEF.md) and PRD §1–§19. Core principles:
writing-first, AI-as-assistant, automatic organization, transparency, user
ownership, zero lock-in.

## 7–8. Users & personas
Novelists, indie/web authors, hobbyists (primary); screenwriters, worldbuilders,
RPG creators (secondary). Personas A–D in PRD §9.

## 9. Product features
Authoritative inventory: [FEATURE_CATALOG.md](./FEATURE_CATALOG.md).

## 10. User flows
New user → create project → write chapter → save. AI assist: select → rewrite →
accept. Export: write → export → download.

## 11–13. Domain / data model
[DATA_MODEL.md](./DATA_MODEL.md). Two layers: Author Content (projects, books,
chapters, scenes, notes) and Story Intelligence (characters, locations, events,
relationships, timeline, lore — AI-maintained, user-editable).

## 14–17. Architecture
[ARCHITECTURE.md](./ARCHITECTURE.md). SPA (React/TS/Vite) → service layer →
storage adapter (IndexedDB default, Firebase optional) + AI Gateway → Gemini.

## 18. Security model
User data isolation; secrets never in frontend source; Gemini keys stored
client-side (user-owned) and rotatable. Strict Firestore rules when cloud is on.

## 19. Deployment
Static PWA on Cloudflare Pages + Firebase BaaS (free tiers). Runs fully offline.

## 20–21. Integrations / third parties
Firebase (optional), Google Gemini (user keys), Cloudflare (hosting). All
optional/replaceable per the no-lock-in principle.

## 22. Repository structure
See [ARCHITECTURE.md](./ARCHITECTURE.md#repository-structure).

## 23–26. Workflow / testing / monitoring / release
Follows [AI_AGENT_WORKFLOW.md](../AI_AGENT_WORKFLOW.md) +
[WORKFLOW_COMPANION_01.md](../WORKFLOW_COMPANION_01.md). Vitest for unit tests;
[CHANGELOG.md](../CHANGELOG.md) + semver for releases.

## 27–29. Risks / debt / roadmap
Debt: `docs/TECHNICAL_DEBT.md` (created as debt arises). Roadmap: PRD Part 12
phases; current progress in [../.agent/CURRENT_STATE.md](../.agent/CURRENT_STATE.md).

## 30–31. Glossary / references
[GLOSSARY.md](./GLOSSARY.md); governing specs in [index.md](./index.md).
