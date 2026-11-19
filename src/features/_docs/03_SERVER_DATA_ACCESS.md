# Server Data Access

Server data access is the private data boundary of the [Courseroad Feature Architecture](./01_FEATURE_ARCHITECTURE.md),
a feature-oriented modular monolith with feature-owned server data access. Routes and dashboard views compose
feature-owned data access functions. A function checks its caller and resource before returning the projection needed by
the view. This follows the [Next.js data security guidance](https://nextjs.org/docs/app/guides/data-security).

```text
src/app/ and features/dashboard/ composition
            ↓
features/<domain>/server/
            ↓
src/server/ shared infrastructure
            ↓
database and external services
```

## Ownership

| Directory                    | Responsibility                                                                                                     |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `src/app/`                   | URLs, layouts, metadata, loading/error boundaries, composition and navigation                                      |
| `features/<domain>/server/`  | Authorized reads, writes, orchestration and DTO mapping                                                            |
| `features/<domain>/actions/` | Thin Server Action adapters for mutations and uncached imperative browser reads                                    |
| `features/<domain>/types/`   | Browser-safe DTO interfaces and view-facing result types                                                           |
| `features/<domain>/schemas/` | Browser-safe Zod validation schemas and inferred input contracts                                                   |
| `src/server/`                | Database clients, session/context guards, action and HTTP helpers, logging, email, security and SDK initialization |
| `src/lib/`                   | Browser-safe utilities, public environment configuration, contracts, route definitions and browser auth adapters   |
| `src/components/`            | Reused app UI; route-only presentation belongs in the route's `_components/`                                       |

Course owns curriculum, enrollment and progress. Quiz owns editing and server grading. Blog owns public writing,
changelog, and course/organization announcements. Media owns uploads, playback, and stream status mapping. Auth owns
profile and account administration; organization owns membership and settings. Payment owns checkout, receipts, Connect,
earnings and webhook workflows. Analytics owns fingerprint persistence and reporting; onboarding owns the setup wizard.
Landing, pricing, and challenge own their bounded surfaces; dashboard composes domains without database or integration
clients.

`server/db/` inside a feature is an internal implementation detail. Its functions can accept database dependencies for
testing. Public DAL functions resolve identity themselves and validate identifiers; callers cannot supply a Prisma
client or a trusted user ID. Browser schemas and DTO contracts stay outside `server/` in `schemas/` and `types/`.

## Organization and Session Context

`server/auth/session.ts` deduplicates session reads with `React.cache` for the current request.
`getOrganizationContext(slug, requiredRole)` checks the URL slug, session, organization existence, membership and role.
The tenant database extension narrows queries further; it does not replace ownership checks.

Pages pass the slug through composition. Server Actions can use Proxy's URL organization header as a selector; HTTP
upload requests send the URL slug explicitly. All selectors remain untrusted until the server verifies membership.
Resource checks bind lessons to courses and quiz questions/options to their parents. Reorder transactions restrict every
item to the authorized parent.

`session.activeOrganizationId` is a navigation preference. Selection and switching update Better Auth explicitly before
navigation. Layouts never mutate the session. Two tabs can query different URL organizations using the same session.

DAL reads throw `AccessError` or describe a destination. Pages use `readForPage` to translate those results into
redirects/not-found behavior. HTTP adapters translate access failures into status codes. Authoritative permission checks
run even when no layout has rendered.

## Reads, Mutations and Projections

Server Components call ordinary DAL functions directly. Admin user pagination and sorting remain URL-driven.

For interactive browser reads:

- **Uncached imperative reads** (cursor pagination or on-demand tab loads such as `loadAnnouncementFeed` and
  `readPlatformPublishing`) may use thin Server Actions backed by `createAuthAction` or `createTenantAction` when HTTP
  caching and TanStack Query are unnecessary.
- **Cacheable, polled, or URL-addressable reads** use validated `GET` handlers that serialize dates through JSON and
  return `Cache-Control: private, no-store`:
  - `/api/analytics/visitors/[visitorId]/signals`: authenticated platform admin signals.
  - `/api/payments/receipts/[purchaseId]?isPlatform=true|false`: receipts belonging to the current caller.
  - `/api/courses/[courseId]/enrollment`: the current caller's enrollment and resource-derived learning URL.

Server Actions adapt mutations and retain validation/error envelopes; keep `prismaClient` and server `env` wiring in
feature `server/` workflows rather than `actions/` or `app/` pages. Checkout and new-quiz creation initialize through
actions after the browser opens the view, avoiding writes during server rendering.

Editor and learner quiz projections differ. Learner/public payloads exclude explanations and correctness flags;
custom-input options containing answer text are omitted. Grading stays server-side. Account queries select the fields
their views need. Prisma delegate types remain inside server implementation modules.

Auth, upload, playback, checkout, Connect, webhook, and one-click unsubscribe URLs remain HTTP boundaries. Routes
delegate to feature-owned server handlers. Existing webhook signatures, transactions and retry handling are retained.

## Cross-Feature Server Data Reuse

Sibling features cannot import each other's `server/` modules. When a feature needs read-only facts from tables owned by
another domain (for example, `blog/` checking course ownership and active enrollments for announcements), choose one of
two explicit patterns:

- **Scoped read-only query in the consumer's `server/`:** Query only the needed columns through shared `server/db/` when
  the consumer's access matrix intentionally differs from the owning feature's editor policy, and document the rule and
  parity expectations in the consumer's `00_` feature doc.
- **Shared server predicate in `src/server/` or `src/lib/`:** Extract a domain-agnostic helper (such as role hierarchy
  `meetsOrganizationRole` in `lib/auth/org-role-levels.ts`) when multiple features must enforce the exact same rule in
  lockstep.

## Caching, Revalidation, and Background Work

Cache Components remains enabled. Existing public catalog/course caches keep their policies and tags.

- **`'use cache'` placement:** Keep `'use cache'` and `cacheLife(...)` functions inside feature `server/` behind input
  validation (for example, `blog/server/loaders/cached-content.ts`). Never access request-scoped `cookies()` or
  `headers()` inside a cached function; private session/context memoization remains request-scoped via `React.cache`.
- **Invalidation:** Call `revalidatePath` / `revalidateTag` beside feature `server/` workflows using verified
  organization slug paths or resource IDs.
- **Post-commit background work (`after()`):** Use Next.js `after()` only for non-blocking side effects after the
  primary database transaction commits (such as batched announcement email delivery). Enforce explicit rate/volume caps,
  isolate downstream failures with try/catch logging, and record delivery status so a downstream failure never rolls
  back or breaks the committed operation.

`apps/web/proxy.ts` handles optimistic cookie redirects and attaches request metadata. It forwards visitor, request and
organization headers on the request; it does not authorize resources or change active organization state. DAL checks
remain authoritative.

## Architecture and Verification

Keep shared modules independent of features/routes, keep raw database/SDK clients and internal `server/db/` modules
behind the server boundary, and preserve the documented `media/` exports (`image-upload`, `video-upload`,
`video-player`, and `video-status`). Client Components may reference action modules marked `use server`, but must not
import ordinary server modules, directly or transitively. [apps/web/eslint.config.mjs](../../../eslint.config.mjs)
enforces these import boundaries via `no-restricted-imports`.

Executable private server modules should import `server-only`. Public environment values live in
`src/lib/config/env.ts`; private configuration belongs behind `src/server/config/env.ts`.

Next.js operations use the guarded `src/server/db/client.ts`, `src/server/config/env.ts`, and
`src/server/logging/server.ts` entry points. Standalone maintenance scripts and runtime helpers use the underlying
`src/server/db/connection.ts`, `src/server/config/runtime.ts`, and `src/server/logging/runtime.ts` modules, which are
the runtime exceptions to the `server-only` marker rule. Browser code must not import those runtime modules.

Focused tests exercise direct DAL authorization, tenant independence, resource ownership, safe quiz projection, private
GET responses, domain mutations, uploads and webhook retries. Use `bun run check` for changed app/UI/tooling files and
`bun run check --all` for full-monorepo formatting and linting. Check documentation outside that incremental scope with
targeted `bunx --bun prettier --check <paths>` commands. Run types and relevant tests separately; follow
[Agent Feature Workflow](./04_AGENT_FEATURE_WORKFLOW.md#verification-and-completion). Historical baseline failures at
the time of the DAL migration are recorded in
[REFACTOR-171](../../../../../docs/tasks/infra/completed/REFACTOR-171-Feature-Owned-Server-DAL.md); verify current
failures against the current tree.
