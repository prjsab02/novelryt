# TECHNICAL_DEBT.md

> Technical debt is not failure; undocumented technical debt is.
> Last updated: 2026-06-02.

| ID | Description | Reason | Impact | Risk | Priority | Proposed resolution | Status |
|---|---|---|---|---|---|---|---|
| DEBT-001 | Auth is a local stub when Firebase is not configured | Local-first default | No real authn in local mode | Low | Medium | Firebase Auth adapter built; activates via env (docs/FIREBASE_SETUP.md) | Resolved (env-gated) |
| DEBT-002 | Cloud sync requires Firebase config | Local-first default | Per-device until configured | Low | Medium | Firestore adapter built (offline persistence = sync + conflict); activates via env | Resolved (env-gated) |
| DEBT-006 | Firebase SDK bundled even in local mode (~adds to bundle) | config.ts statically imports app/auth/firestore | Larger initial download | Low | Low | Lazy-load firebase modules when isFirebaseEnabled | Open |
| DEBT-007 | Local→cloud data not auto-migrated on first sign-in | Distinct stores; safe default | Manual JSON export/import needed | Low | Low | Optional one-time migration prompt | Open |
| DEBT-003 | AI keys held client-side (no server proxy) | Static-hosting constraint (ADR 002) | User's own keys visible to that user (acceptable) | Low | Low | Optional serverless proxy if a backend is added | Open |
| DEBT-004 | Editor is plaintext/markdown textarea (no rich formatting UI) | Scope/performance for MVP | Limited formatting | Low | Medium | Add lightweight rich-text or markdown toolbar | Open |
| DEBT-005 | Scenes modeled in data layer but no dedicated UI yet | MVP focuses on chapter-level writing | Sub-chapter structure unavailable | Low | Medium | Add scene management under chapters (PRD §96) | Open |
