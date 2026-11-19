import type { MediaContext } from '@/lib/media/storage-layout';

const UUID = '[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}';

/**
 * Course and quiz IDs come from the page URL, as the organization slug does in `organization-headers.ts`.
 * The server re-validates them against the database, so a wrong ID is rejected instead of trusted.
 *
 * Matches `/creator/dashboard/courses/<id>` and `/organization/<slug>/<role>/dashboard/courses/<id>`,
 * and the same shapes under `quizzes`.
 */
export function mediaContextFromPath(pathname: string): Pick<MediaContext, 'courseId' | 'quizId'> {
    const courseId = new RegExp(`/courses/(${UUID})(?:/|$)`).exec(pathname)?.[1];
    const quizId = new RegExp(`/quizzes/(${UUID})(?:/|$)`).exec(pathname)?.[1];
    return { ...(courseId && { courseId }), ...(quizId && { quizId }) };
}

/** Context for an upload started on the current page, plus anything only the caller knows (the lesson). */
export function mediaUploadContext(extra: Pick<MediaContext, 'lessonId'> = {}): Record<string, string> {
    const fromPath = typeof window === 'undefined' ? {} : mediaContextFromPath(window.location.pathname);
    const context: MediaContext = { ...fromPath, ...extra };
    return Object.fromEntries(Object.entries(context).filter((entry): entry is [string, string] => !!entry[1]));
}
