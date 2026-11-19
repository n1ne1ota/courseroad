# Bunny Storage, Stream, and CDN URLs

Canonical reference for Courseroad's Bunny Storage key hierarchy, Bunny Stream video naming/collections, and public CDN
URL resolution, complementing [Media Feature](./00_MEDIA_FEATURE.md).

## Ownership Verification

[upload-access.ts](../server/upload-access.ts) resolves an explicit URL organization slug or the authenticated platform
creator before deriving an ownership key (`organizationId` vs. `users/{userId}` for platform creators).
`session.activeOrganizationId` is never used as a fallback. The browser supplies resource IDs (`courseId`, `lessonId`,
`quizId`), which [resolveMediaContext](../server/media-context.ts) validates against the database and caller's tenant
before building any path.

## Storage Key Layout

### Scoped Image & Thumbnail Uploads (Active)

[storage-layout.ts](../../../lib/media/storage-layout.ts) builds scoped paths via `buildScopedStoragePath` (used by
`uploadScopedImage` in `src/server/media/image-upload-service.ts`) and `videoThumbnailPath` (used by
[video-thumbnails/route.ts](../server/http/storage/video-thumbnails/route.ts)):

```text
platform/creators/{userId}/courses/{courseId}/thumbnail/{uuid}-{name}
platform/creators/{userId}/courses/{courseId}/intro-video-thumbnail/{videoId}.jpg
platform/creators/{userId}/courses/{courseId}/lessons/{lessonId}/thumbnail/{uuid}-{name}
platform/creators/{userId}/courses/{courseId}/lessons/{lessonId}/video-thumbnail/{videoId}.jpg
platform/creators/{userId}/quizzes/{quizId}/thumbnail/{uuid}-{name}
organizations/{organizationId}/...                                  (same tails)
```

Uploads without course/quiz context fall back to flat directories under the owner root (for example
`{ownerRoot}/course-covers/` or `{ownerRoot}/quiz-thumbnails/`). `videoId` must be a UUID; extracted thumbnails
overwrite on retry.

### Base64 Avatars & Legacy Paths

- **Avatars:** Base64 avatar uploads (`uploadBase64Image` in `src/server/media/image-upload-service.ts`) still construct
  paths via `buildStoragePath` in [image-upload.ts](../../../lib/constants/image-upload.ts), keeping
  `{userId}/avatars/{uuid}-{name}`.
- **Legacy records:** Older rows may reference flat `{orgId}/course-covers/...`, `course-covers/{uuid}-{name}`, or bare
  filenames (`{uuid}-{name}`). Retain them for historical reads; a legacy path never grants access to a course or video.
- **Migration:** `apps/web/scripts/migrate-bunny-layout` dry-runs by default, copies (never moves) scoped images,
  repoints database rows, files existing Stream videos into course collections, and deletes old copies only when run
  with `--delete-old` and its manifest. Avatars and quiz question images are not migrated.

## Bunny Stream Collections & Title Prefixes

[src/server/media/stream-service.ts](../../../server/media/stream-service.ts) uses the shared library configured by
`BUNNY_STREAM_VIDEO_LIBRARY_ID`. [presign/route.ts](../server/http/stream/presign/route.ts) places course uploads into a
per-course collection (`course-${courseId}`) and prefixes titles via `videoTitle(...)`:

```text
[{organizationId}] {label}
[users/{userId}] {label}
```

For course/lesson videos, `{label}` becomes `course {courseId} intro - {file name}` or
`lesson {lessonId} - {file name}`. Keep the leading `[ownerKey]` prefix first and unchanged:
[access.ts](../server/access.ts) and `course` curriculum checks verify it during playback and video attachment.

## CDN URL Resolution

[resolveCdnUrl](../../../lib/api/cdn-url.ts) reads `NEXT_PUBLIC_BUNNY_STORAGE_CDN` (falling back to
`https://courseroad.b-cdn.net`), strips a leading slash, preserves scoped paths, and prepends `thumbnails/` to bare
legacy filenames:

```typescript
import { resolveCdnUrl, resolveThumbnailUrl } from "@/lib/api/cdn-url";

resolveCdnUrl("organizations/org-abc/courses/c-1/thumbnail/uuid-cover.webp");
// => {cdnHost}/organizations/org-abc/courses/c-1/thumbnail/uuid-cover.webp
resolveCdnUrl("uuid-legacy.jpg");
// => {cdnHost}/thumbnails/uuid-legacy.jpg
resolveThumbnailUrl(null);
// => /images/placeholder-course.jpg
```

These helpers only format URLs; they do not check permissions or asset existence.
