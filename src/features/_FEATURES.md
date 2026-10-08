# Features

Each directory in `features/` is a bounded product surface. Files default to flat placement. Create subdirectories only
when the flat list exceeds ~8–10 files.

## Standardized Directory Names

Use these names when a subfolder is warranted. Do not create them preemptively.

| Name          | Contains                                                            |
| ------------- | ------------------------------------------------------------------- |
| `actions/`    | Next.js server actions                                              |
| `server/`     | Authorized DALs, internal repositories, workflows and HTTP handlers |
| `store/`      | Domain client state using the shared SSR store factory              |
| `components/` | Reusable UI components local to this feature                        |
| `hooks/`      | Custom React hooks                                                  |
| `utils/`      | Pure utility functions and helpers                                  |
| `types/`      | TypeScript types and interfaces                                     |

Do not create `pages/` or `views/` subdirectories. Use filename suffixes instead — `*-page.tsx`, `*-view.tsx`, `*-form.tsx` — so files stay flat and the distinction is visible without an extra folder level.

## Cross-Feature Imports

`dashboard/` composes other features. Sibling features may import only the reusable media components
`media/image-upload`, `media/video-upload`, and `media/video-player`; media schemas and internals remain private.
All other cross-feature imports are a violation. Compose product features in routes or dashboard.

Generic app-owned controls shared across features live in `src/components/`. Shared infrastructure and contracts
live in browser-safe `lib/`; private infrastructure lives in `server/`. Account security belongs to auth and is supplied to organization settings by dashboard composition.
Onboarding owns its completion action and validation schema.

Auth and quiz UI lives in `components/`; quiz hooks and animation helpers live in `hooks/` and `utils/`.
Small features stay flat. Shared schemas and types stay at the feature root unless enough files warrant a directory.
Shared `lib/` and `server/` cannot import features or routes. Client Components may reference Server Action adapters, but cannot reach ordinary DALs through value imports. Feature DALs import the guarded database client and
logging server/client entry points; standalone maintenance scripts use their underlying connection/runtime.

See [`docs/project/apps/web/04-Features-Architecture.md`](../../../../docs/project/apps/web/04-Features-Architecture.md)
for full rationale and trade-offs.

Feature-owned server interfaces and organization context are documented in [Server Data Access](../../../../docs/project/apps/web/05-Server-Data-Access.md). `app/` and dashboard compose DALs; internal repositories remain private. Browser schemas and DTO contracts stay outside `server/`.
