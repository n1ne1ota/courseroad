import 'server-only';

import type { Route } from 'next';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { createCourseSchema, updateCourseSchema } from '@/features/course/schemas/course-schemas';
import { createCourse, updateCourse } from '@/features/course/server/db/mutations/courses';
import { createAuthFormAction } from '@/server/actions/create-auth-action';
import { AccessError } from '@/server/auth/session';
import { prismaClient } from '@/server/db/client';

/** Platform drafts always belong to the authenticated creator, without an organization. */
export const createPlatformCourse = createAuthFormAction(
    createCourseSchema.pick({ title: true }),
    async (data, { user }) => {
        if (user.role?.toLowerCase() !== 'creator') throw new AccessError('Forbidden');
        const course = await createCourse(prismaClient, { ...data, status: 'Draft' }, user.id, null);
        revalidatePath('/creator/dashboard/courses');
        redirect(`/creator/dashboard/courses/${course.id}` as Route);
        return course;
    }
);

/** Editing details cannot publish a draft, transfer authorship, or change its tenant. */
export const updatePlatformCourse = createAuthFormAction(
    updateCourseSchema.omit({ status: true }),
    async (data, { user }) => {
        if (user.role?.toLowerCase() !== 'creator') throw new AccessError('Forbidden');
        await updateCourse(prismaClient, data, user.id, 'creator', null);
        revalidatePath(`/creator/dashboard/courses/${data.id}`);
        revalidatePath('/creator/dashboard/courses');
        return true;
    }
);
