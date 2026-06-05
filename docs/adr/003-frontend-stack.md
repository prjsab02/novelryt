# ADR 003 — Frontend stack

- Status: Accepted
- Date: 2026-06-02

## Context
PRD §346 specifies React + TypeScript + Vite, Tailwind, Zustand, PWA, and free
hosting compatibility with a small bundle.

## Decision
React 18 + TypeScript (strict) + Vite 5 + Tailwind CSS 3 + Zustand +
react-router-dom + vite-plugin-pwa. Tests via Vitest. IDs via nanoid.

## Alternatives
- Next.js: SSR/server runtime unneeded for a local-first SPA; complicates free
  static hosting on Cloudflare Pages.
- Redux: heavier than needed; Zustand matches PRD.
- Tailwind v4: newer/less stable tooling at time of writing; v3 chosen.

## Consequences
- Small, fast, static-deployable bundle; agent-friendly. (+)
- shadcn/ui (PRD §346) not yet added; lightweight local primitives used instead
  to keep the dependency surface minimal. Can be introduced later. (neutral)

## Risks
Minimal. Stack is mainstream and well-supported.
