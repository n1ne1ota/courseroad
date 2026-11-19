import 'server-only';

import { revalidatePath, updateTag } from 'next/cache';

import { z } from 'zod';

import {
    readPublishing,
    transitionPublishing,
    updateVisibility
} from '@/features/course/server/db/mutations/publishing';
import { createAuthAction } from '@/server/actions/create-auth-action';
import { createTenantAction } from '@/server/actions/create-tenant-action';
import { AccessError } from '@/server/auth/session';
import { prismaClient } from '@/server/db/client';

const readSchema = z.object({ courseId: z.uuid() });
const transitionSchema = readSchema.extend({
    expectedStatus: z.enum(['Draft', 'Published']),
    operation: z.enum(['publish', 'unpublish'])
});

const visibilitySchema = readSchema.extend({ visibility: z.enum(['Public', 'Unlisted', 'Private']) });

/** Public discovery caches must expire immediately when visibility changes. */
function invalidate(courseId: string) {
    updateTag('course-catalog');
    updateTag('course-details');
    updateTag(`course-${courseId}`);
    revalidatePath('/courses', 'layout');
    revalidatePath('/creator/dashboard', 'layout');
    revalidatePath('/learner/dashboard', 'layout');
    revalidatePath('/organization/[slug]', 'layout');
}

export const readPlatformPublishing = createAuthAction(readSchema, async ({ courseId }, { user }) => {
    if (user.role?.toLowerCase() !== 'creator') throw new AccessError('Forbidden');
    return readPublishing(prismaClient, courseId, { userId: user.id, organizationId: null, privileged: false });
});
export const changePlatformPublishing = createAuthAction(transitionSchema, async (input, { user }) => {
    if (user.role?.toLowerCase() !== 'creator') throw new AccessError('Forbidden');
    const result = await transitionPublishing(prismaClient, input, {
        userId: user.id,
        organizationId: null,
        privileged: false
    });
    invalidate(input.courseId);
    return result;
});
export const readOrganizationPublishing = createTenantAction('creator', readSchema, async ({ courseId }, ctx) =>
    readPublishing(prismaClient, courseId, {
        userId: ctx.user.id,
        organizationId: ctx.organizationId,
        privileged: ['owner', 'manager'].includes(ctx.member.role)
    })
);
export const changeOrganizationPublishing = createTenantAction('creator', transitionSchema, async (input, ctx) => {
    const result = await transitionPublishing(prismaClient, input, {
        userId: ctx.user.id,
        organizationId: ctx.organizationId,
        privileged: ['owner', 'manager'].includes(ctx.member.role)
    });
    invalidate(input.courseId);
    revalidatePath(`/organization/${ctx.organizationSlug}`, 'layout');
    return result;
});

export const changePlatformVisibility = createAuthAction(visibilitySchema, async (input, { user }) => {
    if (user.role?.toLowerCase() !== 'creator') throw new AccessError('Forbidden');
    const result = await updateVisibility(prismaClient, input, {
        userId: user.id,
        organizationId: null,
        privileged: false
    });
    invalidate(input.courseId);
    return result;
});
export const changeOrganizationVisibility = createTenantAction('creator', visibilitySchema, async (input, ctx) => {
    const result = await updateVisibility(prismaClient, input, {
        userId: ctx.user.id,
        organizationId: ctx.organizationId,
        privileged: ['owner', 'manager'].includes(ctx.member.role)
    });
    invalidate(input.courseId);
    revalidatePath(`/organization/${ctx.organizationSlug}`, 'layout');
    return result;
});
