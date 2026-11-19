import 'server-only';

import {
    createLessonSchema,
    deleteLessonSchema,
    reorderLessonsSchema,
    updateLessonSchema
} from '@/features/course/schemas/lesson-schemas';
import { executeOrganizationCurriculum } from '@/features/course/server/workflows/curriculum-actions';
import {
    legacyOrderedIds,
    organizationLesson,
    organizationModule,
    savedRecord
} from '@/features/course/server/workflows/legacy-curriculum';
import { createTenantAction } from '@/server/actions/create-tenant-action';

export const createLesson = createTenantAction('creator', createLessonSchema, async (data, ctx) => {
    const courseModule = await organizationModule(data.moduleId, ctx.organizationId);
    const result = await executeOrganizationCurriculum(
        { ...data, courseId: courseModule.courseId, operation: 'createLesson' },
        ctx
    );
    return savedRecord(savedRecord(result.modules.find(row => row.id === courseModule.id)).lessons.at(-1));
});
export const updateLesson = createTenantAction('creator', updateLessonSchema, async (data, ctx) => {
    const lesson = await organizationLesson(data.lessonId, ctx.organizationId);
    const result = await executeOrganizationCurriculum(
        { ...data, courseId: lesson.module.courseId, operation: 'updateLessonMedia' },
        ctx
    );
    return savedRecord(result.modules.flatMap(row => row.lessons).find(row => row.id === lesson.id));
});
export const deleteLesson = createTenantAction('creator', deleteLessonSchema, async (data, ctx) => {
    const lesson = await organizationLesson(data.lessonId, ctx.organizationId);
    await executeOrganizationCurriculum({ ...data, courseId: lesson.module.courseId, operation: 'deleteLesson' }, ctx);
    return true;
});
export const reorderLessons = createTenantAction('creator', reorderLessonsSchema, async (data, ctx) => {
    if (!data[0]) return true;
    const ids = legacyOrderedIds(data);
    const lesson = await organizationLesson(data[0].id, ctx.organizationId);
    await executeOrganizationCurriculum(
        { courseId: lesson.module.courseId, moduleId: lesson.moduleId, operation: 'reorderLessons', ids },
        ctx
    );
    return true;
});
