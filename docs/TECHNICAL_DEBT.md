# TECHNICAL_DEBT.md

> Technical debt is not failure; undocumented technical debt is.
> Last updated: 2026-06-02.

| ID | Description | Reason | Impact | Risk | Priority | Proposed resolution | Status |
|---|---|---|---|---|---|---|---|
| DEBT-001 | Auth is a local stub (email → identity, no password/verification) | No Firebase creds provisioned; unblock local-first dev | No real authn; single-device | Medium | High | Add Firebase Auth adapter implementing `AuthProvider` | Open |
| DEBT-002 | No cloud sync; data is per-device IndexedDB only | Firebase adapter not built yet (ADR 001) | No cross-device | Medium | High | Build `StorageAdapter` Firebase impl + sync/conflict logic | Open |
| DEBT-003 | AI keys held client-side (no server proxy) | Static-hosting constraint (ADR 002) | User's own keys visible to that user (acceptable) | Low | Low | Optional serverless proxy if a backend is added | Open |
| DEBT-004 | Editor is plaintext/markdown textarea (no rich formatting UI) | Scope/performance for MVP | Limited formatting | Low | Medium | Add lightweight rich-text or markdown toolbar | Open |
| DEBT-005 | Scenes modeled in data layer but no dedicated UI yet | MVP focuses on chapter-level writing | Sub-chapter structure unavailable | Low | Medium | Add scene management under chapters (PRD §96) | Open |
