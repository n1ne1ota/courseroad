import crypto from 'node:crypto';

import type { ImageUploadScope } from '@/lib/constants/image-upload';

/**
 * Bunny Storage layout, organised by owner and course. Everything is keyed by stable IDs, never by name.
 *
 * ```
 * platform/creators/<userId>/courses/<courseId>/thumbnail/<uuid>-<name>
 * platform/creators/<userId>/courses/<courseId>/intro-video-thumbnail/<videoId>.jpg
 * platform/creators/<userId>/courses/<courseId>/lessons/<lessonId>/thumbnail/<uuid>-<name>
 * platform/creators/<userId>/courses/<courseId>/lessons/<lessonId>/video-thumbnail/<videoId>.jpg
 * platform/creators/<userId>/quizzes/<quizId>/thumbnail/<uuid>-<name>
 * organizations/<orgId>/...                                  (same tails)
 * ```
 *
 * Without course context an upload falls back to a flat folder under the owner root, such as `.../course-covers/`.
 */
export type StorageOwner = { kind: 'creator'; userId: string } | { kind: 'organization'; organizationId: string };

export type MediaContext = {
    courseId?: string | undefined;
    lessonId?: string | undefined;
    quizId?: string | undefined;
};

export function ownerRoot(owner: StorageOwner): string {
    return owner.kind === 'organization'
        ? `organizations/${owner.organizationId}`
        : `platform/creators/${owner.userId}`;
}

/** Folder an image of this scope belongs in. */
export function imageDirectory(owner: StorageOwner, scope: ImageUploadScope, context: MediaContext = {}): string {
    const root = ownerRoot(owner);
    const { courseId, lessonId, quizId } = context;
    switch (scope) {
        case 'avatar':
            return `${root}/avatars`;
        case 'demo':
            return `${root}/demo`;
        case 'course-cover':
            return courseId ? `${root}/courses/${courseId}/thumbnail` : `${root}/course-covers`;
        case 'lesson-thumbnail':
            return courseId && lessonId
                ? `${root}/courses/${courseId}/lessons/${lessonId}/thumbnail`
                : `${root}/lesson-thumbnails`;
        case 'quiz-thumbnail':
            return quizId ? `${root}/quizzes/${quizId}/thumbnail` : `${root}/quiz-thumbnails`;
    }
}

/** Full object path for a new image upload: `<directory>/<uuid>-<file name>`. */
export function buildScopedStoragePath(
    owner: StorageOwner,
    scope: ImageUploadScope,
    sanitizedFileName: string,
    context: MediaContext = {}
): string {
    return `${imageDirectory(owner, scope, context)}/${crypto.randomUUID()}-${sanitizedFileName}`;
}

/** Object path for the thumbnail extracted from a Bunny Stream video. One file per video, so it is overwritten on retry. */
export function videoThumbnailPath(owner: StorageOwner, videoId: string, context: MediaContext = {}): string {
    const root = ownerRoot(owner);
    const { courseId, lessonId } = context;
    if (courseId && lessonId) return `${root}/courses/${courseId}/lessons/${lessonId}/video-thumbnail/${videoId}.jpg`;
    if (courseId) return `${root}/courses/${courseId}/intro-video-thumbnail/${videoId}.jpg`;
    return `${root}/video-thumbnails/${videoId}.jpg`;
}

/** Bunny Stream collection that groups every video of one course. */
export function courseCollectionName(courseId: string): string {
    return `course-${courseId}`;
}

/**
 * Title for a new Stream video. The leading `[<ownerKey>]` is the ownership marker checked by playback and
 * curriculum access, so it must stay first and unchanged.
 */
export function videoTitle(args: {
    ownerKey: string;
    fileTitle: string;
    courseId?: string;
    lessonId?: string;
}): string {
    const { courseId, fileTitle, lessonId, ownerKey } = args;
    const label = lessonId
        ? `lesson ${lessonId} - ${fileTitle}`
        : courseId
          ? `course ${courseId} intro - ${fileTitle}`
          : fileTitle;
    return `[${ownerKey}] ${label}`;
}
