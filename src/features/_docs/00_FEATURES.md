# Features

Each product directory in `features/` owns a bounded product surface. Product domains own their UI, browser-safe
contracts, and authorized server operations; routes and dashboard compose them. Shared browser-safe utilities live in
`src/lib/`, shared private infrastructure in `src/server/`, and generic app UI in `src/components/`.

## Shared Architecture

Detailed feature-area guidance lives alongside this overview in `features/_docs/`. Each subject has one canonical guide:

1. [Feature Architecture](./01_FEATURE_ARCHITECTURE.md): Ownership, folder vocabulary, colocation, and dependency
   boundaries.
2. [Client State and Fetching](./02_CLIENT_STATE_FETCHING.md): Domain stores, SSR safety, and query hydration.
3. [Server Data Access](./03_SERVER_DATA_ACCESS.md): Authorized DALs, organization context, data projections, and
   transport.
4. [Agent Feature Workflow](./04_AGENT_FEATURE_WORKFLOW.md): Creating, modifying, improving, and verifying features.

Start with the [spec index](../../../../../docs/SPEC_INDEX.md) for tracked work. Follow the
[documentation conventions](../../../../../docs/project/07_CONVENTIONS.md) when adding or moving guides.

## Feature Overviews

- [Analytics](../analytics/_docs/00_ANALYTICS_FEATURE.md)
- [Auth](../auth/_docs/00_AUTH_FEATURE.md)
- [Blog](../blog/_docs/00_BLOG_FEATURE.md): public blog, changelog, RSS feeds, and course/organization announcements
- [Challenge](../challenge/_docs/00_CHALLENGE_FEATURE.md)
- [Course](../course/_docs/00_COURSE_FEATURE.md)
- [Dashboard](../dashboard/_docs/00_DASHBOARD_FEATURE.md), including its role/path matrix and composition groups
- [Landing](../landing/_docs/00_LANDING_FEATURE.md)
- [Media](../media/_docs/00_MEDIA_FEATURE.md), including its reusable API and
  [Bunny Storage](../media/_docs/01_BUNNY_STORAGE.md) guide
- [Onboarding](../onboarding/_docs/00_ONBOARDING_FEATURE.md)
- [Organization](../organization/_docs/00_ORGANIZATION_FEATURE.md)
- [Payment](../payment/_docs/00_PAYMENT_FEATURE.md)
- [Pricing](../pricing/_docs/00_PRICING_FEATURE.md)
- [Quiz](../quiz/_docs/00_QUIZ_FEATURE.md)

Each feature's `_docs/` directory holds its `00_` overview describing local ownership and linking back to shared rules.
Small features stay flat; private server operations always remain inside `server/`. Other grouping decisions follow the
[canonical folder rules](./01_FEATURE_ARCHITECTURE.md#standardized-directory-names).
