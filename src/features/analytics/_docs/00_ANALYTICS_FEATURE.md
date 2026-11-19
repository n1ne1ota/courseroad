# Analytics Feature

Analytics owns device fingerprint persistence and platform visitor reporting. Charts, tables, and signal inspection UI
live beside browser-safe schemas and types.

`server/fingerprint-service.ts` implements fingerprint persistence; `server/tracking-analytics-service.ts` exposes
reporting reads with platform-admin checks. `actions/actions.ts` delegates tracking mutations to `server/workflows/`.
Routes and `features/dashboard/` compose the reporting UI and authorized reads.

See [Feature Architecture](../../_docs/01_FEATURE_ARCHITECTURE.md) and
[Server Data Access](../../_docs/03_SERVER_DATA_ACCESS.md) for the canonical ownership and authorization rules.
