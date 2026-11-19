import 'server-only';

import type { Prisma, PrismaClient } from '@prisma/client';

import { AccessError } from '@/server/auth/session';

import type { CurriculumMutationInput } from '@/features/course/schemas/curriculum-schemas';

type Actor = {
    userId: string;
    organizationId: string | null;
    privileged: boolean;
    draftOnly: boolean;
    resolveVideo?: (videoGuid: string) => Promise<string>;
};
type Tx = Prisma.TransactionClient;
type Ordered = { id: string; order: number };

function completeOrder(rows: Ordered[], ids: string[]) {
    if (
        ids.length !== rows.length ||
        new Set(ids).size !== ids.length ||
        ids.some(id => !rows.some(row => row.id === id))
    ) {
        throw new Error('The curriculum changed. Reload before reordering.');
    }
}

/** Temporary slots avoid the non-deferrable unique parent/order constraints. */
async function orderModules(tx: Tx, courseId: string, rows: Ordered[], ids: string[]) {
    completeOrder(rows, ids);
    const temporary = Math.max(0, ...rows.map(row => row.order)) + 1;
    for (const [index, id] of ids.entries())
        await tx.module.update({ where: { id, courseId }, data: { order: temporary + index } });
    for (const [index, id] of ids.entries())
        await tx.module.update({ where: { id, courseId }, data: { order: index + 1 } });
}

async function orderLessons(tx: Tx, moduleId: string, rows: Ordered[], ids: string[]) {
    completeOrder(rows, ids);
    const temporary = Math.max(0, ...rows.map(row => row.order)) + 1;
    for (const [index, id] of ids.entries())
        await tx.lesson.update({ where: { id, moduleId }, data: { order: temporary + index } });
    for (const [index, id] of ids.entries())
        await tx.lesson.update({ where: { id, moduleId }, data: { order: index + 1 } });
}

/** Internal persistence boundary: callers supply a server-derived, verified actor. */
export async function mutateCurriculum(
    db: Pick<PrismaClient, '$transaction'>,
    input: CurriculumMutationInput,
    actor: Actor
) {
    return db.$transaction(
        async tx => {
            // All curriculum writers use the same course lock, including appends and deletes.
            await tx.$queryRaw`SELECT "id" FROM "course" WHERE "id" = ${input.courseId}::uuid FOR UPDATE`;
            const course = await tx.course.findFirst({
                where: {
                    id: input.courseId,
                    organizationId: actor.organizationId,
                    ...(actor.privileged ? {} : { userId: actor.userId })
                }
            });
            if (!course) throw new AccessError('Course not found', 404);
            if (course.status !== 'Draft') throw new AccessError('Only draft curricula can be edited');

            const moduleFor = async (id: string) => {
                const courseModule = await tx.module.findFirst({
                    where: { id, courseId: course.id, organizationId: actor.organizationId }
                });
                if (!courseModule) throw new AccessError('Module not found', 404);
                return courseModule;
            };
            const lessonFor = async (id: string) => {
                const lesson = await tx.lesson.findFirst({
                    where: {
                        id,
                        organizationId: actor.organizationId,
                        module: { courseId: course.id, organizationId: actor.organizationId }
                    }
                });
                if (!lesson) throw new AccessError('Lesson not found', 404);
                return lesson;
            };
            const modules = async () => {
                const rows = await tx.module.findMany({ where: { courseId: course.id }, orderBy: { order: 'asc' } });
                if (rows.some(row => row.organizationId !== actor.organizationId))
                    throw new AccessError('Module tenant mismatch');
                return rows;
            };
            const lessons = async (moduleId: string) => {
                const rows = await tx.lesson.findMany({ where: { moduleId }, orderBy: { order: 'asc' } });
                if (rows.some(row => row.organizationId !== actor.organizationId))
                    throw new AccessError('Lesson tenant mismatch');
                return rows;
            };

            switch (input.operation) {
                case 'createModule': {
                    const rows = await modules();
                    await tx.module.create({
                        data: {
                            courseId: course.id,
                            organizationId: actor.organizationId,
                            title: input.title,
                            order: Math.max(0, ...rows.map(row => row.order)) + 1
                        }
                    });
                    break;
                }
                case 'updateModule':
                    await moduleFor(input.moduleId);
                    await tx.module.update({
                        where: { id: input.moduleId, courseId: course.id },
                        data: { title: input.title }
                    });
                    break;
                case 'deleteModule': {
                    await moduleFor(input.moduleId);
                    await tx.module.delete({ where: { id: input.moduleId, courseId: course.id } });
                    const rows = await modules();
                    await orderModules(
                        tx,
                        course.id,
                        rows,
                        rows.map(row => row.id)
                    );
                    break;
                }
                case 'reorderModules': {
                    const rows = await modules();
                    await orderModules(tx, course.id, rows, input.ids);
                    break;
                }
                case 'createLesson': {
                    await moduleFor(input.moduleId);
                    const rows = await lessons(input.moduleId);
                    await tx.lesson.create({
                        data: {
                            moduleId: input.moduleId,
                            organizationId: actor.organizationId,
                            title: input.title,
                            order: Math.max(0, ...rows.map(row => row.order)) + 1
                        }
                    });
                    break;
                }
                case 'updateLessonVideo': {
                    const lesson = await lessonFor(input.lessonId);
                    if (actor.organizationId !== null) throw new AccessError('Platform operation required');
                    // Replacements are checked after the course lock, ownership, draft, and child checks.
                    // A provider failure leaves both the text and previous video untouched.
                    const changed =
                        input.videoGuid !== (lesson.videoGuid ?? '') || (!input.videoGuid && !!lesson.videoUrl);
                    let videoUrl = lesson.videoUrl;
                    if (changed) {
                        if (input.videoGuid) {
                            const resolveVideo = actor.resolveVideo;
                            if (!resolveVideo) throw new AccessError('Video verification required');
                            videoUrl = await resolveVideo(input.videoGuid);
                        } else videoUrl = null;
                    }
                    await tx.lesson.update({
                        where: { id: lesson.id, moduleId: lesson.moduleId },
                        data: {
                            title: input.title,
                            description: input.description || null,
                            ...(changed && {
                                videoGuid: input.videoGuid || null,
                                videoFileName: input.videoGuid ? input.videoFileName || null : null,
                                videoFileSize: input.videoGuid ? input.videoFileSize || null : null,
                                videoUrl,
                                videoStatus: input.videoGuid ? 'Processing' : null
                            })
                        }
                    });
                    break;
                }
                case 'updateLesson':
                case 'updateLessonMedia': {
                    const lesson = await lessonFor(input.lessonId);
                    if (input.operation === 'updateLessonMedia' && actor.organizationId === null)
                        throw new AccessError('Platform media editing is unavailable');
                    await tx.lesson.update({
                        where: { id: lesson.id, moduleId: lesson.moduleId },
                        data: {
                            ...(input.title !== undefined && { title: input.title }),
                            ...(input.description !== undefined && { description: input.description || null }),
                            ...(input.operation === 'updateLessonMedia'
                                ? {
                                      ...(input.videoUrl !== undefined && { videoUrl: input.videoUrl || null }),
                                      ...(input.videoGuid !== undefined && { videoGuid: input.videoGuid || null }),
                                      ...(input.videoFileName !== undefined && {
                                          videoFileName: input.videoFileName || null
                                      }),
                                      ...(input.videoFileSize !== undefined && {
                                          videoFileSize: input.videoFileSize || null
                                      }),
                                      ...(input.videoThumbnailUrl !== undefined && {
                                          videoThumbnailUrl: input.videoThumbnailUrl || null
                                      })
                                  }
                                : {})
                        }
                    });
                    break;
                }
                case 'deleteLesson': {
                    const lesson = await lessonFor(input.lessonId);
                    await tx.lesson.delete({ where: { id: lesson.id, moduleId: lesson.moduleId } });
                    const rows = await lessons(lesson.moduleId);
                    await orderLessons(
                        tx,
                        lesson.moduleId,
                        rows,
                        rows.map(row => row.id)
                    );
                    break;
                }
                case 'reorderLessons':
                    await moduleFor(input.moduleId);
                    await orderLessons(tx, input.moduleId, await lessons(input.moduleId), input.ids);
                    break;
                case 'moveLesson': {
                    const lesson = await lessonFor(input.lessonId);
                    await moduleFor(input.targetModuleId);
                    const source = await lessons(lesson.moduleId);
                    const target =
                        lesson.moduleId === input.targetModuleId ? source : await lessons(input.targetModuleId);
                    const targetIds = target.filter(row => row.id !== lesson.id).map(row => row.id);
                    if (input.targetIndex > targetIds.length) throw new Error('Invalid lesson destination');
                    targetIds.splice(input.targetIndex, 0, lesson.id);
                    if (lesson.moduleId !== input.targetModuleId) {
                        await tx.lesson.update({
                            where: { id: lesson.id, moduleId: lesson.moduleId },
                            data: {
                                moduleId: input.targetModuleId,
                                order: Math.max(0, ...target.map(row => row.order)) + 1
                            }
                        });
                        const remaining = source.filter(row => row.id !== lesson.id);
                        await orderLessons(
                            tx,
                            lesson.moduleId,
                            remaining,
                            remaining.map(row => row.id)
                        );
                    }
                    await orderLessons(tx, input.targetModuleId, await lessons(input.targetModuleId), targetIds);
                    break;
                }
            }
            return {
                modules: await tx.module.findMany({
                    where: { courseId: course.id, organizationId: actor.organizationId },
                    orderBy: { order: 'asc' },
                    include: { lessons: { where: { organizationId: actor.organizationId }, orderBy: { order: 'asc' } } }
                })
            };
        },
        { maxWait: 10_000, timeout: 20_000 }
    );
}
