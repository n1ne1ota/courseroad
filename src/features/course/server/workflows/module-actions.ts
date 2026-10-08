import 'server-only';

import { revalidatePath } from 'next/cache';

import {
    createModuleSchema,
    deleteModuleSchema,
    reorderModulesSchema,
    updateModuleSchema
} from '@/features/course/module-schemas';
import {
    createModule as createModuleMutation,
    deleteModule as deleteModuleMutation,
    reorderModules as reorderModulesMutation,
    updateModule as updateModuleMutation
} from '@/features/course/server/repositories/mutations/modules';
import { createTenantAction } from '@/server/actions/create-tenant-action';
import { getTenantPrisma } from '@/server/db/get-tenant-prisma';

export const createModule = createTenantAction('creator', createModuleSchema, async (data, ctx) => {
    const prisma = await getTenantPrisma();

    const createdModule = await createModuleMutation(prisma, data, ctx.user.id, ctx.member.role, ctx.organizationId);

    revalidatePath(`/organization/${ctx.organizationSlug}/${ctx.member.role}/dashboard/courses/${data.courseId}`);
    return createdModule;
});

export const updateModule = createTenantAction('creator', updateModuleSchema, async (data, ctx) => {
    const prisma = await getTenantPrisma();

    const updatedModule = await updateModuleMutation(prisma, data, ctx.user.id, ctx.member.role);

    const courseModule = await prisma.module.findUnique({
        select: { courseId: true },
        where: { id: data.moduleId }
    });
    if (courseModule) {
        revalidatePath(
            `/organization/${ctx.organizationSlug}/${ctx.member.role}/dashboard/courses/${courseModule.courseId}`
        );
    }

    return updatedModule;
});

export const deleteModule = createTenantAction('creator', deleteModuleSchema, async (data, ctx) => {
    const prisma = await getTenantPrisma();

    const courseId = await deleteModuleMutation(prisma, data, ctx.user.id, ctx.member.role);

    revalidatePath(`/organization/${ctx.organizationSlug}/${ctx.member.role}/dashboard/courses/${courseId}`);
    return true;
});

export const reorderModules = createTenantAction('creator', reorderModulesSchema, async (data, ctx) => {
    const prisma = await getTenantPrisma();

    const courseId = await reorderModulesMutation(prisma, data, ctx.user.id, ctx.member.role);

    if (courseId) {
        revalidatePath(`/organization/${ctx.organizationSlug}/${ctx.member.role}/dashboard/courses/${courseId}`);
    }
    return true;
});
