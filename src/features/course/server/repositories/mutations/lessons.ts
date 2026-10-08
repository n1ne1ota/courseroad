import 'server-only';

/** @internal Repository API; application callers use authorized feature DALs. */
import type { z } from 'zod';

import type {
    createLessonSchema,
    deleteLessonSchema,
    reorderLessonsSchema,
    updateLessonSchema
} from '@/features/course/lesson-schemas';
import type { PrismaLike } from '@/features/course/server/repositories/types';

type CreateLessonInput = z.infer<typeof createLessonSchema>;
type UpdateLessonInput = z.infer<typeof updateLessonSchema>;
type DeleteLessonInput = z.infer<typeof deleteLessonSchema>;
type ReorderLessonsInput = z.infer<typeof reorderLessonsSchema>;

export async function createLesson(
    prisma: PrismaLike,
    data: CreateLessonInput,
    userId: string,
    memberRole: string,
    organizationId: string
) {
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

    const lastLesson = await prisma.lesson.findFirst({
        orderBy: { order: 'desc' },
        where: { moduleId: data.moduleId }
    });

    const newOrder = lastLesson ? lastLesson.order + 1 : 1;

    return prisma.lesson.create({
        data: {
            moduleId: data.moduleId,
            order: newOrder,
            organizationId,
            title: data.title
        }
    });
}

export async function updateLesson(prisma: PrismaLike, data: UpdateLessonInput, userId: string, memberRole: string) {
    const lesson = await prisma.lesson.findUnique({
        include: { module: { include: { course: true } } },
        where: { id: data.lessonId }
    });

    if (!lesson || (lesson.module.course.userId !== userId && memberRole !== 'owner' && memberRole !== 'manager')) {
        throw new Error('Unauthorized: You do not have permission to modify this course.');
    }

    return prisma.lesson.update({
        data: {
            ...(data.title !== undefined && { title: data.title }),
            ...(data.videoUrl !== undefined && { videoUrl: data.videoUrl }),
            ...(data.videoThumbnailUrl !== undefined && {
                videoThumbnailUrl: data.videoThumbnailUrl
            }),
            ...(data.description !== undefined && {
                description: data.description === '' ? null : data.description
            })
        },
        where: { id: data.lessonId }
    });
}

export async function deleteLesson(prisma: PrismaLike, data: DeleteLessonInput, userId: string, memberRole: string) {
    const lesson = await prisma.lesson.findUnique({
        include: { module: { include: { course: true } } },
        where: { id: data.lessonId }
    });

    if (!lesson || (lesson.module.course.userId !== userId && memberRole !== 'owner' && memberRole !== 'manager')) {
        throw new Error('Unauthorized: You do not have permission to modify this course.');
    }

    await prisma.lesson.delete({
        where: { id: data.lessonId }
    });

    return lesson.module.courseId;
}

export async function reorderLessons(
    prisma: PrismaLike,
    data: ReorderLessonsInput,
    userId: string,
    memberRole: string
) {
    const firstItem = data[0];
    if (!firstItem) return null;

    const firstLesson = await prisma.lesson.findUnique({
        include: { module: { include: { course: true } } },
        where: { id: firstItem.id }
    });

    if (
        !firstLesson ||
        (firstLesson.module.course.userId !== userId && memberRole !== 'owner' && memberRole !== 'manager')
    ) {
        throw new Error('Unauthorized: You do not have permission to modify this course.');
    }

    const transaction = data.map(item =>
        prisma.lesson.update({
            data: { order: item.position },
            where: { id: item.id, moduleId: firstLesson.moduleId }
        })
    );

    await prisma.$transaction(transaction);

    return firstLesson.module.courseId;
}
