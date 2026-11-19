# Media Feature

Media owns reusable upload and playback components, upload authorization, playback access, and Bunny HTTP handlers.
Shared provider clients and upload infrastructure live in `src/server/media/`; feature handlers apply domain access
rules before delegating to them.

## Reusable Media API

Sibling features may import `@/features/media/components/image-upload`, `@/features/media/components/video-upload`,
`@/features/media/components/video-player`, and `@/features/media/lib/video-status` directly. Schemas and all other
media internals remain private, and media cannot import sibling features. Review imports against
[Feature Architecture](../../_docs/01_FEATURE_ARCHITECTURE.md#cross-feature-dependencies).

## Structure

| Part               | Location                                                                                                                                            |
| :----------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public UI          | `components/`: `image-upload.tsx`, `video-upload.tsx`, `video-player.tsx`                                                                           |
| Browser-safe utils | `lib/`: `video-status.ts` (public), `media-context.ts`, `organization-headers.ts`, `upload-errors.ts`                                               |
| Contracts          | `schemas/stream-schemas.ts`                                                                                                                         |
| Authorization      | `server/access.ts`, `server/media-context.ts`, `server/upload-access.ts`                                                                            |
| HTTP handlers      | `server/http/storage/` (`images`, `course-covers`, `video-thumbnails`) and `server/http/stream/` (`presign`, `token`, `video/[videoId]`, `webhook`) |

## Supporting Guides & Verification

- **Storage keys, Stream collections & CDN URLs:** See [Bunny Storage](./01_BUNNY_STORAGE.md).
- **Credentials & boundaries:** Storage and Stream use separate Bunny credentials (`BUNNY_STORAGE_API_KEY` vs.
  `BUNNY_STREAM_API_KEY` / `BUNNY_STREAM_VIDEO_LIBRARY_ID`); keep all API keys server-side.
- **Unit tests:**
  `bun run --cwd apps/web test:unit tests/routes/storage-images.test.ts tests/routes/stream-uploads.test.ts tests/features/media tests/features/course/course-media-form.test.tsx`
  (mocks Bunny responses; does not verify live credentials).

See [Feature Architecture](../../_docs/01_FEATURE_ARCHITECTURE.md) and
[Server Data Access](../../_docs/03_SERVER_DATA_ACCESS.md) for canonical folder and authorization rules.
