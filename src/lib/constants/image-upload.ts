import crypto from 'node:crypto';

/**
 * Scope-specific path segment for each image upload type.
 * The organizationId prefix is prepended at build time via `buildStoragePath()`.
 */
export const IMAGE_UPLOAD_SCOPES = {
    avatar: {
        pathSegment: 'avatars'
    },
    'course-cover': {
        pathSegment: 'course-covers'
    },
    demo: {
        devOnly: true,
        pathSegment: 'demo'
    },
    'lesson-thumbnail': {
        pathSegment: 'lesson-thumbnails'
    },
    'quiz-thumbnail': {
        pathSegment: 'quiz-thumbnails'
    }
} as const;

export type ImageUploadScope = keyof typeof IMAGE_UPLOAD_SCOPES;

export function isImageUploadScope(value: unknown): value is ImageUploadScope {
    return typeof value === 'string' && value in IMAGE_UPLOAD_SCOPES;
}

/**
 * Constructs a storage path for an image upload under a specific prefix.
 * Format: `{prefixId}/{scope-segment}/{uuid}-{sanitizedFileName}`
 */
export function buildStoragePath(prefixId: string, scope: ImageUploadScope, sanitizedFileName: string): string {
    const config = IMAGE_UPLOAD_SCOPES[scope];
    return `${prefixId}/${config.pathSegment}/${crypto.randomUUID()}-${sanitizedFileName}`;
}
