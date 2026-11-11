import 'server-only';

/** @internal Repository API; application callers use authorized feature DALs. */
import type { z } from 'zod';

import type {
    createModuleSchema,
    deleteModuleSchema,
    reorderModulesSchema,
    updateModuleSchema
} from '@/features/course/module-schemas';
import type { PrismaLike } from '@/features/course/server/repositories/types';

type CreateModuleInput = z.infer<typeof createModuleSchema>;
type UpdateModuleInput = z.infer<typeof updateModuleSchema>;
type DeleteModuleInput = z.infer<typeof deleteModuleSchema>;
type ReorderModulesInput = z.infer<typeof reorderModulesSchema>;

export async function createModule(
    prisma: PrismaLike,
    data: CreateModuleInput,
    userId: string,
    memberRole: string,
    organizationId: string
) {
    const course = await prisma.course.findUnique({
        where: { id: data.courseId }
    });

    if (!course || (course.userId !== userId && memberRole !== 'owner' && memberRole !== 'manager')) {
        throw new Error('Unauthorized: You do not have permission to modify this course.');
    }

    const lastModule = await prisma.module.findFirst({
        orderBy: { order: 'desc' },
        where: { courseId: data.courseId }
    });

    const newOrder = lastModule ? lastModule.order + 1 : 1;

    return prisma.module.create({
        data: {
            courseId: data.courseId,
            order: newOrder,
            organizationId,
            title: data.title
        }
    });
}

export async function updateModule(prisma: PrismaLike, data: UpdateModuleInput, userId: string, memberRole: string) {
    const courseModule = await prisma.module.findUnique({
        include: { course: true },
        where: { id: data.moduleId }
    });

    if (
        !courseModule ||
        (courseModule.course.userId !== userId && memberRole !== 'owner' && memberRole !== 'manager')
    ) {
        throw new Error('Unauthorized: You do not have permission to modify this course.');
    }

    return prisma.module.update({
        data: { title: data.title },
        where: { id: data.moduleId }
    });
}

export async function deleteModule(prisma: PrismaLike, data: DeleteModuleInput, userId: string, memberRole: string) {
    const courseModule = await prisma.module.findUnique({
        include: { course: true },
        where: { id: data.moduleId }
    });

    if (
        !courseModule ||
        (courseModule.course.userId !== userId && memberRole !== 'owner' && memberRole !== 'manager')
    ) {
        throw new Error('Unauthorized: You do not have permission to modify this course.');
    }

    await prisma.module.delete({
        where: { id: data.moduleId }
    });

    return courseModule.courseId;
}

export async function reorderModules(
    prisma: PrismaLike,
    data: ReorderModulesInput,
    userId: string,
    memberRole: string
) {
    const firstItem = data[0];
    if (!firstItem) return null;

    const firstModule = await prisma.module.findUnique({
        include: { course: true },
        where: { id: firstItem.id }
    });

    if (!firstModule || (firstModule.course.userId !== userId && memberRole !== 'owner' && memberRole !== 'manager')) {
        throw new Error('Unauthorized: You do not have permission to modify this course.');
    }

    const transaction = data.map(item =>
        prisma.module.update({
            data: { order: item.position },
            where: { id: item.id, courseId: firstModule.courseId }
        })
    );

    await prisma.$transaction(transaction);

    return firstModule.courseId;
}
