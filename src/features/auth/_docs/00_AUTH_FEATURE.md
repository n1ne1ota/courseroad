# Auth Feature

Authentication forms, account controls, and loading skeletons live in `components/`. Account/profile operations,
authorized loaders, workflows, and auth HTTP handlers live in this feature's `server/` boundary. Server Action adapters
live in `actions/`. Shared Better Auth server configuration, sessions, and authoritative guards live in
`src/server/auth/`. Browser auth adapters, shared permission definitions, and browser-safe validation contracts live in
`src/lib/auth/`. Routes compose these components without changing their props or authentication behavior.

See [Feature Architecture](../../_docs/01_FEATURE_ARCHITECTURE.md) for canonical folder names and
[Server Data Access](../../_docs/03_SERVER_DATA_ACCESS.md) for authorization boundaries.
