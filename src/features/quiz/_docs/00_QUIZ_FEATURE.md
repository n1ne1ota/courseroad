# Quiz Feature

Quiz UI lives in `components/`, the highlighted-prompt hook in `hooks/`, and player animations in `utils/`. Thin Server
Action adapters live in `actions/`. Authorized reads live in `server/loaders/`, business operations and grading in
`server/workflows/`, and internal persistence and query orchestration in `server/db/`. Browser-safe Zod schemas and
TypeScript contracts live in `schemas/` and `types/`. Routes and `features/dashboard/` compose quiz APIs; sibling
product features do not import quiz internals.

See [Feature Architecture](../../_docs/01_FEATURE_ARCHITECTURE.md) for canonical folder names and
[Server Data Access](../../_docs/03_SERVER_DATA_ACCESS.md) for authorization and learner-safe projections.
