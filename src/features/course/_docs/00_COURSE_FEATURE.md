# Course Feature

Course owns course authoring, curriculum editing, publishing, enrollment, progress tracking, certificates, and learner
playback UI. Routes and `features/dashboard/` compose its views and authorized DALs.

## Structure

| Part                 | Location                                                                                       |
| :------------------- | :--------------------------------------------------------------------------------------------- |
| Views and UI         | `components/`: editor, details, curriculum list, publishing tab, course cards, learn skeletons |
| Client state         | `store/curriculum-store.ts` (`CurriculumStoreProvider` via `src/lib/store/create-ssr-store`)   |
| Local hooks          | `hooks/use-lesson-autosave.ts`                                                                 |
| Contracts            | `schemas/` (`course`, `curriculum`, `lesson`, `module`) and `types/` (`course`, `curriculum`)  |
| Pure helpers         | `lib/`: `publishing.ts`, `publishing-view.ts`, `curriculum-order.ts`, `curriculum-drag.ts`     |
| Action adapters      | `actions/`: thin `'use server'` wrappers delegating to `server/workflows/`                     |
| Access & reads       | `server/access.ts`, `server/enrollment.ts`, `server/loaders/`                                  |
| Business writes      | `server/workflows/` (curriculum, details, publishing, learning, legacy adapters)               |
| Internal persistence | `server/db/` (`queries/`, `mutations/`, `orchestrators.ts`, `types.ts`)                        |

## Invariants & Boundaries

- **Independent authorization:** `server/access.ts`, `server/loaders/`, and `server/workflows/` verify caller identity,
  creator ownership, `organizationId` scope, and parent-child associations independently of layouts.
- **Transactional curriculum & publishing locks:** `server/db/mutations/curriculum.ts` and `publishing.ts` serialize
  curriculum reorders, cross-module lesson moves, details, publishing transitions, and free enrollment writes under a
  course-row lock.
- **Video verification:** `updateLessonVideo` strips caller-supplied media URLs/status, verifies changed video IDs
  against the creator's server-issued Bunny title prefix (bypassing persistent caching), and derives playback URLs
  server-side from the configured CDN.
- **Publishing lifecycle:** `lib/publishing.ts` defines the readiness checklist (blocking on failed encodes; warning on
  processing encodes or optional fields). Published and archived courses are read-only in the editor; unpublishing
  returns a course to `Draft` and stops new enrollments while preserving existing learners' access and progress.

## Verification

- **Unit tests:** `bun run --cwd apps/web test:unit tests/features/course`
- **Integration & E2E:** Run against a disposable `_test` database and Playwright per
  [Testing](../../../../../../docs/project/08_TESTING.md).

See [Feature Architecture](../../_docs/01_FEATURE_ARCHITECTURE.md),
[Client State and Fetching](../../_docs/02_CLIENT_STATE_FETCHING.md), and
[Server Data Access](../../_docs/03_SERVER_DATA_ACCESS.md) for the canonical ownership, store, and DAL rules.
