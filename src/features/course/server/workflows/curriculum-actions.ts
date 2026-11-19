import 'server-only';

import { revalidatePath } from 'next/cache';

import { z } from 'zod';

import {
    type OrganizationCurriculumInput,
    organizationCurriculumSchema,
    platformCurriculumSchema
} from '@/features/course/schemas/curriculum-schemas';
import { mutateCurriculum } from '@/features/course/server/db/mutations/curriculum';
import { syncLessonVideoStatuses } from '@/features/course/server/db/mutations/sync-video-status';
import { fromApiStatus } from '@/features/media/lib/video-status';
import { createAuthAction } from '@/server/actions/create-auth-action';
import { createTenantAction, type TenantContext } from '@/server/actions/create-tenant-action';
import { AccessError } from '@/server/auth/session';
import { prismaClient } from '@/server/db/client';
import { getHlsUrl, getVideo } from '@/server/media/stream-service';

export const mutatePlatformCurriculum = createAuthAction(platformCurriculumSchema, async (input, { user }) => {
    if (user.role?.toLowerCase() !== 'creator') throw new AccessError('Forbidden');
    const result = await mutateCurriculum(prismaClient, input, {
        userId: user.id,
        organizationId: null,
        privileged: false,
        draftOnly: true,
        ...(input.operation === 'updateLessonVideo' && {
            resolveVideo: async (videoGuid: string) => {
                const video = z
                    .object({ guid: z.uuid(), title: z.string() })
                    .parse(await getVideo(videoGuid, AbortSignal.timeout(8000)));
                if (video.guid !== videoGuid || !video.title.startsWith(`[users/${user.id}] `))
                    throw new AccessError('Video not found', 404);
                return getHlsUrl(videoGuid);
            }
        })
    });
    revalidatePath(`/creator/dashboard/courses/${input.courseId}`);
    revalidatePath('/creator/dashboard/courses');
    return result;
});

/** Called only after a tenant action has independently verified membership. */
export async function executeOrganizationCurriculum(input: OrganizationCurriculumInput, context: TenantContext) {
    const result = await mutateCurriculum(prismaClient, input, {
        userId: context.user.id,
        organizationId: context.organizationId,
        privileged: ['owner', 'manager'].includes(context.member.role),
        draftOnly: false
    });
    revalidatePath(
        `/organization/${context.organizationSlug}/${context.member.role}/dashboard/courses/${input.courseId}`
    );
    revalidatePath(`/organization/${context.organizationSlug}/${context.member.role}/dashboard/courses`);
    return result;
}

export const mutateOrganizationCurriculum = createTenantAction(
    'creator',
    organizationCurriculumSchema,
    executeOrganizationCurriculum
);

const syncVideoStatusSchema = z.object({ courseId: z.uuid() });

/** Reads the encode state from Bunny so the editor does not depend on the webhook reaching this deployment. */
async function lookupVideoStatus(videoGuid: string) {
    const video = z.object({ status: z.number() }).parse(await getVideo(videoGuid, AbortSignal.timeout(8000)));
    return fromApiStatus(video.status);
}

export const syncPlatformVideoStatuses = createAuthAction(syncVideoStatusSchema, async (input, { user }) => {
    if (user.role?.toLowerCase() !== 'creator') throw new AccessError('Forbidden');
    const { changed, statuses } = await syncLessonVideoStatuses(
        prismaClient,
        { courseId: input.courseId, userId: user.id, organizationId: null, privileged: false },
        lookupVideoStatus
    );
    if (changed) revalidatePath(`/creator/dashboard/courses/${input.courseId}`);
    return { statuses };
});

export const syncOrganizationVideoStatuses = createTenantAction(
    'creator',
    syncVideoStatusSchema,
    async (input, context) => {
        const { changed, statuses } = await syncLessonVideoStatuses(
            prismaClient,
            {
                courseId: input.courseId,
                userId: context.user.id,
                organizationId: context.organizationId,
                privileged: ['owner', 'manager'].includes(context.member.role)
            },
            lookupVideoStatus
        );
        if (changed)
            revalidatePath(
                `/organization/${context.organizationSlug}/${context.member.role}/dashboard/courses/${input.courseId}`
            );
        return { statuses };
    }
);
