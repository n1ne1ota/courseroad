import 'server-only';

import type { Route } from 'next';
import { revalidatePath, revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';

import { z } from 'zod';

import { requireCourseAccess, requireLessonAccess } from '@/features/course/server/access';
import {
    enrollInCourse as enrollInCourseMutation,
    markLessonComplete as markLessonCompleteMutation
} from '@/features/course/server/repositories/mutations/learning';
import { createSafeAction, createSafeFormAction } from '@/server/actions/create-safe-action';
import { prismaClient } from '@/server/db/client';
import { withTenantScope } from '@/server/db/tenant';

import type { PrismaLike } from '@/features/course/server/repositories/types';

export const enrollInCourse = createSafeFormAction(
    z.object({
        courseId: z.uuid('Invalid course ID')
    }),
    async ({ courseId }) => {
        const { user } = await requireCourseAccess(courseId, 'enroll');

        const course = await prismaClient.course.findUnique({
            select: { id: true, organizationId: true },
            where: { id: courseId }
        });

        if (!course) {
            throw new Error('Course not found');
        }

        const activeOrgId = course.organizationId;
        const prisma = activeOrgId ? withTenantScope(prismaClient, activeOrgId) : prismaClient;

        await enrollInCourseMutation(prisma as PrismaLike, courseId, user.id, activeOrgId);

        revalidateTag(`course-${courseId}`, 'hours');

        if (activeOrgId) {
            const org = await prismaClient.organization.findUnique({
                select: { slug: true },
                where: { id: activeOrgId }
            });
            const orgSlug = org?.slug;
            revalidatePath(`/organization/${orgSlug}/learner/dashboard`, 'page');
            redirect(`/organization/${orgSlug}/learner/dashboard/learn/${courseId}` as Route);
        } else {
            revalidatePath('/learner/dashboard', 'page');
            redirect(`/learner/dashboard/learn/${courseId}` as Route);
        }
        return;
    }
);

export const markLessonComplete = createSafeAction(
    z.object({
        courseId: z.uuid('Invalid course ID'),
        lessonId: z.uuid('Invalid lesson ID')
    }),
    async ({ courseId, lessonId }) => {
        const { user } = await requireLessonAccess(courseId, lessonId);

        const course = await prismaClient.course.findUnique({
            select: { id: true, organizationId: true },
            where: { id: courseId }
        });

        if (!course) {
            throw new Error('Course not found');
        }

        const activeOrgId = course.organizationId;
        const prisma = activeOrgId ? withTenantScope(prismaClient, activeOrgId) : prismaClient;

        await markLessonCompleteMutation(prisma as PrismaLike, courseId, lessonId, user.id, activeOrgId);

        if (activeOrgId) {
            const org = await prismaClient.organization.findUnique({
                select: { slug: true },
                where: { id: activeOrgId }
            });
            const orgSlug = org?.slug;
            revalidatePath(`/organization/${orgSlug}/learner/dashboard/learn/${courseId}`, 'layout');
        } else {
            revalidatePath(`/learner/dashboard/learn/${courseId}`, 'layout');
        }
    }
);
