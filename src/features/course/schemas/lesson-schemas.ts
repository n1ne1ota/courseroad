import { z } from 'zod';

export const createLessonSchema = z.object({
    moduleId: z.uuid(),
    title: z.string().min(1)
});

export const updateLessonSchema = z.object({
    description: z.string().optional(),
    lessonId: z.uuid(),
    title: z.string().optional(),
    videoGuid: z.string().optional(),
    videoThumbnailUrl: z.string().optional(),
    videoUrl: z.string().optional()
});

export const deleteLessonSchema = z.object({
    lessonId: z.uuid()
});

export const reorderLessonsSchema = z.array(
    z.object({
        id: z.uuid(),
        position: z.number().int()
    })
);

export const lessonProgressSchema = z.object({
    courseId: z.uuid('Invalid course ID'),
    lessonId: z.uuid('Invalid lesson ID')
});
