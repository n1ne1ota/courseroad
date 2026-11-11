const DEFAULT_CDN_HOST = 'https://courseroad.b-cdn.net';

/**
 * Resolves a CDN URL from a stored path or legacy filename.
 *
 * Handles three formats:
 * - Full org-prefixed path: `org-abc/course-covers/uuid-file.jpg`
 * - Legacy scoped path: `course-covers/uuid-file.jpg`
 * - Legacy bare filename: `uuid-file.jpg` (prepends `thumbnails/`)
 *
 * @param storedPath - The path or filename stored in the database.
 * @returns Fully qualified CDN URL.
 */
export function resolveCdnUrl(storedPath: string): string {
    const cdnHost = process.env.NEXT_PUBLIC_BUNNY_STORAGE_CDN ?? DEFAULT_CDN_HOST;
    const normalizedPath = storedPath.replace(/^\//, '');

    // Legacy bare filename (no slashes): assume it lives under /thumbnails/
    const isBareName = !normalizedPath.includes('/');
    const resolvedPath = isBareName ? `thumbnails/${normalizedPath}` : normalizedPath;

    return `${cdnHost}/${resolvedPath}`;
}

/**
 * Resolves a course thumbnail to a CDN URL, with placeholder fallback.
 *
 * @param thumbnailPath - The stored thumbnail path/filename, or null.
 * @returns CDN URL or static placeholder.
 */
export function resolveThumbnailUrl(thumbnailPath: string | null | undefined): string {
    if (!thumbnailPath) return '/images/placeholder-course.jpg';
    return resolveCdnUrl(thumbnailPath);
}
