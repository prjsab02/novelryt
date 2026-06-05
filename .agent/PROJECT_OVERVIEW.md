# PROJECT_OVERVIEW.md

> Purpose: stable, high-level description of NovelRyt. Changes rarely.
> Related: [PRODUCT_REQUIREMENTS_DOCUMENT.md](../PRODUCT_REQUIREMENTS_DOCUMENT.md), [docs/MASTER_DOCUMENTATION.md](../docs/MASTER_DOCUMENTATION.md)

## Purpose

NovelRyt is an AI-assisted novel-writing platform. The author writes; AI
continuously understands, organizes, and maintains the story universe
(characters, locations, timeline, relationships, lore, consistency).

Tagline: **Write stories. Let AI manage everything else.**

## Business goals

- Eliminate the manual maintenance burden of story bibles / planning artifacts.
- Operate sustainably on **free / free-tier infrastructure** ($0/month target).
- Preserve **user ownership** and **data portability** (no lock-in).

## Tech stack (see ADR 003)

- Frontend: React 18 + TypeScript + Vite + Tailwind CSS
- State: Zustand
- Routing: react-router-dom
- Local persistence: IndexedDB via Dexie (offline-first, the default mode)
- Cloud (optional): Firebase (Auth, Firestore, Storage) — Spark plan
- AI: Google Gemini via a provider-agnostic AI Gateway (multi-key)
- Packaging: PWA (Vite PWA plugin); Android via Capacitor (future)
- Hosting: Cloudflare Pages (future)

## Major modules

`auth`, `projects`, `editor` (writing), `storybible`, `timeline`,
`diagnostics`, `research`, `ai`, `settings`. See [docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md).

## Scope boundaries

NovelRyt is NOT a social network, publishing marketplace, ebook store, or
general-purpose document editor. See PRD §18.

## Deployment model

Static PWA (Cloudflare Pages) + Firebase BaaS + user-supplied Gemini keys.
The app must remain fully usable **offline / local-only** with no cloud config.

## Constraints

- Zero-cost-first (PRD §11). No required subscriptions.
- Token conservation is mandatory (PRD §52). No per-keystroke AI.
- AI assists, never overwrites without user approval (PRD §79).
