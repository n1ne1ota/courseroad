# Courseroad Feature Architecture

The web application uses the **Courseroad Feature Architecture**: a feature-oriented modular monolith with feature-owned
server data access. The `features/` directory is the primary domain layer of `apps/web`. Product subdirectories
represent bounded product surfaces rather than generic technical categories; `_docs/` holds shared architectural
guidance.

The name describes three properties:

- **Feature-oriented:** Product capabilities such as course, quiz, payment, and organization own their UI and domain
  behavior.
- **Modular monolith:** The domains run in one deployable Next.js application while dependency rules preserve module
  boundaries.
- **Feature-owned server data access:** Each domain owns its authorization, queries, mutations, orchestration, and safe
  data projections. Shared `server/` code provides infrastructure without owning domain policy.

This is the canonical reference for feature folder names, colocation, and dependency boundaries. Local feature notes
summarize their domain and link here; [Server Data Access](./03_SERVER_DATA_ACCESS.md) defines authorization and
transport, and [Agent Feature Workflow](./04_AGENT_FEATURE_WORKFLOW.md) defines implementation steps.

## Audience

Frontend engineers working inside `apps/web/src/features/`. This is the reference for structural decisions — where to
put a new file, when to create a subfolder, and when not to.

## Why Features, Not Layers

The codebase uses **feature-first organisation**. Product-specific components, hooks, and utilities live with their
feature. `src/components/` is reserved for generic app-owned controls actually shared across features, such as title
inputs, share buttons, unsaved-changes prompts, and shared editor skeletons. A course card still belongs to course:
putting domain UI in a global components folder would obscure ownership.

Feature-first colocation means the file closest to where it is used is the default placement. If something is only used
within `features/course/`, it lives inside `features/course/`.

**Trade-off accepted:** Some duplication across features (e.g., similar utility functions in `course/` and `quiz/`) is
preferable to premature abstraction into a shared layer that couples unrelated domains.

The architecture borrows feature colocation and dependency discipline from approaches such as Bulletproof React and
Feature-Sliced Design without adopting either directory taxonomy wholesale. Next.js App Router remains the routing
layer, and private full-stack operations remain within each feature's `server/` boundary. This avoids parallel `pages`,
`widgets`, and `entities` layers whose responsibilities would overlap with routes and domain modules.

## Feature Directory Inventory

| Directory       | Product Surface                                                      |
| --------------- | -------------------------------------------------------------------- |
| `analytics/`    | Platform-level analytics and reporting                               |
| `auth/`         | Authentication, account security, profile and account administration |
| `blog/`         | Public blog, changelog, RSS feeds, and course/org announcements      |
| `challenge/`    | Challenge and competition mechanics                                  |
| `course/`       | Course creation, editing, and consumption                            |
| `dashboard/`    | Role-scoped dashboard shell and views                                |
| `landing/`      | Public homepage hero and shared landing background                   |
| `media/`        | Media upload, processing, and playback                               |
| `onboarding/`   | New user onboarding flows                                            |
| `organization/` | Organization management and settings                                 |
| `payment/`      | Billing, subscriptions, and checkout                                 |
| `pricing/`      | Public pricing comparison tiers and matrix                           |
| `quiz/`         | Quiz creation, editing, and playback                                 |

## Standardized Directory Names

When a feature folder grows large enough to warrant subfolders, the following names are the canonical vocabulary. These
are not mandatory slots — they are the agreed-upon names to use **when a subfolder is warranted**.

| Name          | Contains                                                              |
| ------------- | --------------------------------------------------------------------- |
| `actions/`    | Thin Server Action adapters delegating to feature server operations   |
| `server/`     | Feature-owned DALs, database modules, authorization and HTTP handlers |
| `schemas/`    | Browser-safe Zod validation schemas and inferred input contracts      |
| `types/`      | Browser-safe TypeScript DTOs and feature interfaces                   |
| `store/`      | Domain client state using the shared SSR store factory                |
| `components/` | Reusable UI components local to this feature                          |
| `lib/`        | Pure browser-safe feature logic, route builders, and helpers          |
| `utils/`      | Pure local helpers (kept valid where established, e.g. `quiz/utils/`) |
| `hooks/`      | Custom React hooks local to this feature                              |
| `content/`    | Feature-owned static content files (e.g. `blog/content/` MDX files)   |
| `_docs/`      | Feature overview (`00_<AREA>.md`) and local supporting guides         |

For domain features, use filename suffixes such as `*-page.tsx`, `*-view.tsx`, and `*-form.tsx` rather than adding
`pages/` or `views/` folders. Dashboard is the composition-layer exception: its existing `platform/`, `organization/`,
and `shared/` groups organize scope and role, and `shared/views/` holds compositions reused across those scopes. See
[Dashboard Architecture](../dashboard/_docs/00_DASHBOARD_FEATURE.md). This exception does not establish a `views/`
convention for other features.

### Inside the Server Boundary

Small features can keep authorized operations directly in `server/`. When the file list warrants grouping, use:

| Path                   | Responsibility                                                              |
| ---------------------- | --------------------------------------------------------------------------- |
| `server/loaders/`      | Authorized reads that assemble data for a page or view                      |
| `server/workflows/`    | Business operations and orchestration, including mutations and invalidation |
| `server/db/`           | Internal persistence queries, writes, and query orchestration               |
| `server/db/queries/`   | Query implementations when the database module list grows                   |
| `server/db/mutations/` | Write implementations when the database module list grows                   |
| `server/http/`         | Feature-owned HTTP handlers called by `app/api/**/route.ts` adapters        |

These names describe ordinary modules; they do not register routes or invoke functions automatically. Keep one uniform
role-based `server/` shape (`loaders/`, `workflows/`, `db/`, `http/`, with shared access, content, and provider services
at `server/` root). When a feature spans multiple product surfaces, prefix filenames inside those role folders (for
example `blog/server/loaders/announcements.ts` and `blog/server/loaders/cached-content.ts`) rather than adding
sub-domain directories inside `server/`. Loaders prepare render data without creating or changing domain records.
Feature `server/db/` modules remain internal: presentation and routes call authorized DAL entry points. Keep private
queries and mutations under `server/`; browser-safe schemas and DTO types stay outside `server/` in `schemas/` or
`types/`.

Feature `server/db/` contains domain persistence code; app-level `src/server/db/` provides shared database clients and
tenant infrastructure. Provider integrations belong in clearly named feature server files, such as payment's
`stripe-connect.ts` and `stripe-connect-service.ts`, rather than under `db/`.

### When to Create a Subfolder

The threshold rule: **create a subfolder only when the flat list in the feature directory becomes hard to scan.** A
rough trigger is 8–10 files. Before that point, keep files flat.

```text
✅ Correct — flat until scale warrants structure:
features/course/
  course-editor.tsx
  course-editor-form.tsx
  course-details.tsx
  course-modal.tsx
  actions.ts
  lesson-actions.ts

✅ Correct — subfolder introduced at scale:
features/course/
  actions/
    course-actions.ts
    lesson-actions.ts
    module-actions.ts
  components/
    course-editor.tsx
    course-editor-form.tsx
    course-details.tsx
    course-modal.tsx
    course-card.tsx
    course-curriculum-editor.tsx
```

The `server/` boundary is required whenever a feature contains private server work, even for one file. Other folders
follow the scale rule; 8–10 files is a scanning guideline rather than a required count. Keep established groupings when
they clarify ownership, and do not create empty scaffold folders just because a convention name exists.

## Cross-Feature Dependencies

`features/dashboard/` composes other feature directories (`course/`, `quiz/`, `auth/`, `organization/`). Organization
settings receives its account security section from dashboard as a React node, so organization does not import auth.
Onboarding owns its completion action rather than importing an admin dashboard action.

Sibling features may also import media's four documented public modules: `@/features/media/components/image-upload`,
`@/features/media/components/video-upload`, `@/features/media/components/video-player`, and
`@/features/media/lib/video-status`. This narrow API keeps Bunny integration and status mapping owned by media without
moving product UI into infrastructure. Media schemas and other internals remain private, and media cannot import sibling
features.

Other cross-feature imports are structural violations, enforced via `no-restricted-imports` in
[apps/web/eslint.config.mjs](../../../eslint.config.mjs). Compose product surfaces in `src/app/` or
`features/dashboard/`, place generic shared UI in `src/components/`, and put app-wide browser-safe contracts in
`src/lib/` and shared private infrastructure in `src/server/`.

## Failure Modes & Edge Cases

- **Premature subfolder creation:** Adding `components/`, `hooks/`, etc. to small features adds navigation overhead with
  no benefit. Resist the impulse to pre-structure.
- **Cross-feature coupling via deep imports:** Importing `features/course/components/course-editor.tsx` from
  `features/quiz/` creates hidden coupling. Compose course and quiz together in a route or dashboard view, passing data
  or UI through props where needed. Quiz must not import dashboard as an intermediary; dashboard imports the features it
  composes.
- **Type leakage:** Defining browser DTO types inside `server/` or importing types across sibling features couples
  domains. Keep browser-safe feature DTOs in `types/` or `schemas/`, and extract shared cross-domain contracts into
  `src/lib/`.

## Upstream References

- Role-scoped dashboard structure is documented in [Dashboard](../dashboard/_docs/00_DASHBOARD_FEATURE.md).
- The [Features overview](./00_FEATURES.md) summarizes product ownership and links to these shared guides.
- Unit and integration tests mirror feature ownership under `apps/web/tests/features/<domain>/`; see
  [Testing](../../../../../docs/project/08_TESTING.md).
- [Documentation Conventions](../../../../../docs/project/07_CONVENTIONS.md) define guide placement and naming. Keep
  feature-owned guides inside each feature's `_docs/` directory and shared feature-area architecture here in
  `features/_docs/`.
- Do not introduce nested workspace manifests or barrel exports just to organize a feature. See
  [Server Data Access](./03_SERVER_DATA_ACCESS.md) for DAL interfaces, organization authorization, caching, and
  enforcement.
