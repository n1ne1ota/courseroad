import 'server-only';

import type { Route } from 'next';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { createCourseSchema, updateCourseSchema } from '@/features/course/schemas';
import {
    createCourse as createCourseMutation,
    updateCourse as updateCourseMutation
} from '@/features/course/server/repositories/mutations/courses';
import { createTenantFormAction } from '@/server/actions/create-tenant-action';
import { getTenantPrisma } from '@/server/db/get-tenant-prisma';

export const createCourse = createTenantFormAction(
    'creator',
    createCourseSchema.omit({ userId: true }),
    async (data, ctx) => {
        const prisma = await getTenantPrisma();

        const course = await createCourseMutation(prisma, data, ctx.user.id, ctx.organizationId);

        revalidatePath(`/organization/${ctx.organizationSlug}/${ctx.member.role}/dashboard/courses`);
        redirect(`/organization/${ctx.organizationSlug}/${ctx.member.role}/dashboard/courses/${course.id}` as Route);

        return course; // Unreachable, but required for type
    }
);

export const updateCourse = createTenantFormAction('creator', updateCourseSchema, async (data, ctx) => {
    const prisma = await getTenantPrisma();

    await updateCourseMutation(prisma, data, ctx.user.id, ctx.member.role);

    revalidatePath(`/organization/${ctx.organizationSlug}/${ctx.member.role}/dashboard/courses/${data.id}`);
    revalidatePath(`/organization/${ctx.organizationSlug}/${ctx.member.role}/dashboard/courses`);

    return true;
});
