import 'server-only';

import type { PrismaClient } from '@prisma/client';

import { AccessError } from '@/server/auth/session';

import type { StreamVideoStatus } from '@/features/media/lib/video-status';

type Scope = { courseId: string; userId: string; organizationId: string | null; privileged: boolean };
type Db = Pick<PrismaClient, 'course' | 'lesson'>;

export type LessonVideoStatus = { id: string; videoStatus: StreamVideoStatus | null };

/**
 * Settles lessons still marked `Processing` by asking Bunny directly, so the editor does not depend on the webhook
 * reaching us (it cannot reach localhost, and a delivery can be missed). A lookup that fails is left as it was and
 * retried on the next call. Returns the current status of every lesson that has a video, and whether this call settled any.
 */
export async function syncLessonVideoStatuses(
    db: Db,
    scope: Scope,
    lookup: (videoGuid: string) => Promise<StreamVideoStatus>
): Promise<{ changed: boolean; statuses: LessonVideoStatus[] }> {
    // Same ownership rule as the curriculum mutations, but the course need not be a draft to settle a status.
    const course = await db.course.findFirst({
        where: {
            id: scope.courseId,
            organizationId: scope.organizationId,
            ...(scope.privileged ? {} : { userId: scope.userId })
        },
        select: { id: true }
    });
    if (!course) throw new AccessError('Course not found', 404);

    const inCourse = { organizationId: scope.organizationId, module: { courseId: course.id } };
    const processing = await db.lesson.findMany({
        where: { ...inCourse, videoStatus: 'Processing', videoGuid: { not: null } },
        select: { id: true, videoGuid: true }
    });

    let changed = false;
    await Promise.all(
        processing.map(async lesson => {
            const videoGuid = lesson.videoGuid;
            if (!videoGuid) return;
            let status: StreamVideoStatus;
            try {
                status = await lookup(videoGuid);
            } catch {
                return;
            }
            if (status === 'Processing') return;
            // The guid and status guards keep a replaced video, or one the webhook already settled, untouched.
            const { count } = await db.lesson.updateMany({
                where: { id: lesson.id, videoGuid, videoStatus: 'Processing' },
                data: { videoStatus: status }
            });
            if (count > 0) changed = true;
        })
    );

    const lessons = await db.lesson.findMany({
        where: { ...inCourse, videoGuid: { not: null } },
        select: { id: true, videoStatus: true }
    });
    return { changed, statuses: lessons.map(({ id, videoStatus }) => ({ id, videoStatus })) };
}
