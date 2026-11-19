# Blog Feature

> **Status:** The public blog and changelog are built
> ([FEAT-188](../../../../../../docs/tasks/frontend/active/FEAT_188_PUBLIC_BLOG_AND_CHANGELOG.md)); course and
> organization announcements are built
> ([FEAT-189](../../../../../../docs/tasks/frontend/active/FEAT_189_COURSE_AND_ORGANIZATION_ANNOUNCEMENTS.md)).

Blog owns the platform's published writing and the announcements that teachers and organizations send to their learners.
All of its code lives here: UI in `components/`, MDX content in `content/`, authorized reads and operations in
`server/`, thin mutation/read action adapters in `actions/`, and browser-safe schemas, helpers, and DTO types in
`schemas/`, `lib/`, and `types/`.

## Surfaces

| Surface       | Owner of the data                                                       | Authoring                 |
| :------------ | :---------------------------------------------------------------------- | :------------------------ |
| Blog          | The Courseroad team; public, static pages at `/blog` and `/blog/[slug]` | MDX files in `content/`   |
| Changelog     | The Courseroad team; a public page at `/changelog`                      | MDX files in `content/`   |
| Announcements | Course owners and organization staff, to enrolled learners or members   | The Iota rich-text editor |

## Boundaries

- Routes under `app/(public)/` compose the public pages; they do not read content files directly. Announcement pages
  appear inside the learner, creator and organization dashboards and compose Blog's views.
- Announcements read enrollments and organization members through the shared tenant database module, not by importing
  the course or organization features. Each operation verifies its caller and resource independently of layouts.
- UI is Iota UI only. Missing pieces, such as the article body and the editor, are added to Iota. The editor is its own
  Iota component with its own specification.
- Email goes through the shared mail service in `src/server/email/`.

Follow [Feature Architecture](../../_docs/01_FEATURE_ARCHITECTURE.md) and
[Server Data Access](../../_docs/03_SERVER_DATA_ACCESS.md).

## Public Blog and Changelog

| Part                | Location                                                                                                   |
| :------------------ | :--------------------------------------------------------------------------------------------------------- |
| Routes              | `app/(public)/blog`, `blog/[slug]`, `changelog`, and `rss.xml` handlers under both; thin compositions      |
| Views and chrome    | `components/`: `BlogIndexView`, `PostView`, `ChangelogView`, `BlogShell`, `BlogTabs`, `Callout`            |
| Content files       | `content/posts/<slug>.mdx` and `content/changelog/<YYYY-MM-DD>-<slug>.mdx`, with YAML frontmatter          |
| Frontmatter schemas | `schemas/`: strict Zod schemas and the date helpers shared by the loader and the pages                     |
| DTO types           | `types/`: browser-safe `PostEntry` and `ChangelogEntry` contracts shared with views                        |
| Loader              | `server/content.ts` reads and validates files; `server/loaders/cached-content.ts` caches reads for one day |
| MDX and feeds       | `server/mdx.ts` imports a body by slug; `server/rss.ts` builds both RSS 2.0 feeds                          |

- A post is published when `publishedAt` is today or earlier (UTC) and `draft` is not `true`. Unpublished posts show in
  development only, so authors can preview them. Because pages read the daily cache, a future-dated post appears on its
  date without a deploy.
- Posts, changelog entries, feeds and sitemap entries all come from the same loader, so they cannot disagree.
- MDX elements render through Iota `Prose` and `mdx-components.tsx`, which also provides `Callout` and client-side
  internal links. Add a component there before using it in a post.
- Production reads content from disk, so `next.config.ts` lists `src/features/blog/content/**/*` in
  `outputFileTracingIncludes` for these routes.
- `generateStaticParams` needs at least one published post; with none, `next build` fails for `/blog/[slug]`.

## Course and Organization Announcements

A course owner posts to the learners enrolled in the course, and organization managers and owners post to every member.
Learners read them in a feed with unread tracking; an author can also email an announcement within a configured cap.

| Part           | Location                                                                                                  |
| :------------- | :-------------------------------------------------------------------------------------------------------- |
| Data           | `prisma/schema/announcement.prisma` (`Announcement`, `AnnouncementRead`) and `User.announcementEmails`    |
| Authorization  | `server/authorization.ts`: the authoring matrix; a foreign or missing resource is a 404                   |
| Audience, feed | `server/db/audience.ts`, `queries.ts`, `cursor.ts`: audience rules, keyset paging, unread count, reads    |
| Authoring      | `server/db/mutations.ts`, `server/sanitize.ts`: create, edit, pin, soft delete, idempotent publish        |
| Email          | `server/delivery.ts` (100/batch, 10 req/s), `email.ts`, `unsubscribe-token.ts`, `db/unsubscribe.ts`       |
| Actions, reads | `actions/announcement-actions.ts` (thin), `server/workflows/announcements.ts`, `loaders/announcements.ts` |
| Contracts      | `schemas/announcement-schemas.ts` (validation) and `types/announcement-types.ts` (browser DTOs)           |
| Interface      | `components/announcements/`: feed, card, detail, composer, author list, unread card; Iota UI only         |

- **Who may post.** Platform course: its owner. Organization course: its owner while still a member, or a member at
  `instructor` level or above. Organization-wide: `manager` and `owner`. Everyone else gets a 404.
- **Who sees it.** A course announcement reaches learners with unexpired access (and, for an organization course, who
  are still members); an organization announcement reaches its members. Drafts and deleted announcements are visible to
  authors only.
- **Email.** Off until `ANNOUNCEMENT_EMAIL_MAX_RECIPIENTS` is set above 0 (the composer hides the option until then).
  Publishing decides the outcome in one transaction: over the cap sends nothing and says so; at most three emailed
  announcements per course or organization in 24 hours. Delivery runs in `after()` after the announcement commits, and a
  failed batch records `Partial` or `Failed` without un-publishing. Recipients are the audience minus the author,
  opted-out and unverified addresses.
- **Unsubscribe.** Each email carries a signed token (HMAC of the user id and the purpose, keyed from
  `BETTER_AUTH_SECRET`), `List-Unsubscribe` and one-click POST at `/api/unsubscribe/announcements`, and links to the
  public confirm page `/unsubscribe/announcements`. Learners can switch the email back on from their feed.
- **Sanitizing.** Bodies are sanitized on write and again on read, and images are removed (no upload in v1).
- **Routes.** Learner feed and detail under `/learner/dashboard/announcements` and the organization learner dashboard;
  organization-wide authoring at `.../manager|owner/dashboard/announcements`; course announcements at
  `.../courses/[courseId]/announcements`, linked from the course editor.
- **Database.** Schema changes are applied separately per the deployment guide, never with `db:mig:prod` on staging.
