import { z } from 'zod';

const base = { courseId: z.uuid() };
const title = z.string().trim().min(1, 'Title is required');
const ids = z.array(z.uuid()).refine(value => new Set(value).size === value.length, 'Duplicate identifiers');

/** Parent selectors are explicit; final positions are assigned by the server. */
export const curriculumSchema = z.discriminatedUnion('operation', [
    z.object({ ...base, operation: z.literal('createModule'), title }),
    z.object({ ...base, operation: z.literal('updateModule'), moduleId: z.uuid(), title }),
    z.object({ ...base, operation: z.literal('deleteModule'), moduleId: z.uuid() }),
    z.object({ ...base, operation: z.literal('reorderModules'), ids }),
    z.object({ ...base, operation: z.literal('createLesson'), moduleId: z.uuid(), title }),
    z.object({ ...base, operation: z.literal('updateLesson'), lessonId: z.uuid(), title, description: z.string() }),
    z.object({ ...base, operation: z.literal('deleteLesson'), lessonId: z.uuid() }),
    z.object({ ...base, operation: z.literal('reorderLessons'), moduleId: z.uuid(), ids }),
    z.object({
        ...base,
        operation: z.literal('moveLesson'),
        lessonId: z.uuid(),
        targetModuleId: z.uuid(),
        targetIndex: z.number().int().min(0)
    })
]);

export const organizationCurriculumSchema = z.union([
    curriculumSchema,
    z.object({
        ...base,
        operation: z.literal('updateLessonMedia'),
        lessonId: z.uuid(),
        title: title.optional(),
        description: z.string().optional(),
        videoUrl: z.string().optional(),
        videoGuid: z.string().optional(),
        videoFileName: z.string().max(255).optional(),
        videoFileSize: z.number().int().min(0).optional(),
        videoThumbnailUrl: z.string().optional()
    })
]);

/** Video URLs and ownership metadata are always resolved on the server. */
export const platformCurriculumSchema = z.union([
    curriculumSchema,
    z.object({
        ...base,
        operation: z.literal('updateLessonVideo'),
        lessonId: z.uuid(),
        title,
        description: z.string(),
        videoGuid: z.union([z.uuid(), z.literal('')]),
        videoFileName: z.string().max(255).optional(),
        videoFileSize: z.number().int().min(0).optional()
    })
]);

export type CurriculumInput = z.infer<typeof curriculumSchema>;
export type OrganizationCurriculumInput = z.infer<typeof organizationCurriculumSchema>;
export type PlatformCurriculumInput = z.infer<typeof platformCurriculumSchema>;
export type CurriculumMutationInput = OrganizationCurriculumInput | PlatformCurriculumInput;
