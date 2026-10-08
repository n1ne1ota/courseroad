import 'server-only';

import { z } from 'zod';

import { getOrganizationContext } from '@/server/auth/organization-context';
import { AccessError, getAuthenticatedUser } from '@/server/auth/session';
import { prismaClient } from '@/server/db/client';
import { getVideo } from '@/server/media/stream-service';

/** Public previews remain public; private lessons require their course's access. */
export async function requirePlaybackAccess(input: string, slug?: string) {
    const videoId = z.uuid().parse(input);
    const projection = { id: true, userId: true, organizationId: true, status: true } as const;
    const intro = await prismaClient.course.findFirst({ where: { introVideoGuid: videoId }, select: projection });
    const lesson = intro
        ? null
        : await prismaClient.lesson.findFirst({
              where: { videoGuid: videoId },
              select: { isPreview: true, module: { select: { course: { select: projection } } } }
          });
    const course = intro ?? lesson?.module.course;
    if (course && course.status === 'Published' && (intro || lesson?.isPreview)) return null;
    const user = await getAuthenticatedUser();
    if (!course) {
        // Uploads can be previewed before Save, but only inside their verified tenant.
        const context = await getOrganizationContext(slug, 'creator');
        const video = await getVideo(videoId);
        if (!video.title?.startsWith(`[${context.organizationId}] `)) throw new AccessError('Video not found', 404);
        return video;
    }
    if (course.organizationId) {
        const organization = await prismaClient.organization.findUnique({
            where: { id: course.organizationId },
            select: { slug: true }
        });
        if (!organization || (slug && slug !== organization.slug)) throw new AccessError('Video not found', 404);
        const context = await getOrganizationContext(organization.slug);
        if (['owner', 'manager'].includes(context.member.role)) return null;
    }
    if (course.userId === user.id) return null;
    const enrollment = await prismaClient.enrollment.findUnique({
        where: { userId_courseId: { userId: user.id, courseId: course.id } },
        select: { id: true }
    });
    if (!enrollment) throw new AccessError('Forbidden');
    return null;
}
