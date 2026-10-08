import { z } from 'zod';

// Enums derived from prisma/schema/course.prisma
export const courseLevelEnum = z.enum(['Beginner', 'Intermediate', 'Advanced']);
export const courseStatusEnum = z.enum(['Draft', 'Published', 'Archived']);

// Common validators
const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/; // lowercase, numbers and hyphens

// Create course payload
export const createCourseSchema = z.object({
    category: z.string().optional(),
    description: z.string().max(5000, 'Description is too long').optional(),
    duration: z.coerce
        .number()
        .int('Duration must be an integer')
        .positive('Duration must be greater than 0')
        .optional(),
    fileKey: z.string().optional(),
    introVideoGuid: z.string().optional(),
    introVideoUrl: z.string().optional(),
    level: courseLevelEnum.optional(),
    price: z.coerce.number().int('Price must be an integer').min(0, 'Price must be 0 or greater').optional(),
    shortDescription: z.string().max(200, 'Short description must be 200 characters or less').optional(),
    slug: z.string().regex(slugRegex, 'Use lowercase letters, numbers, and hyphens only').optional(),
    status: courseStatusEnum.default('Draft'),
    title: z.string().min(3, 'Title must be at least 3 characters').max(120, 'Title must be less than 120 characters'),
    userId: z.uuid('Invalid user id')
});

// Update course payload (id required, other fields optional)
export const updateCourseSchema = createCourseSchema
    .omit({ userId: true })
    .partial()
    .extend({
        id: z.uuid('Invalid course id')
    });

// Param helpers
export const courseIdSchema = z.object({ id: z.uuid('Invalid course id') });
export const courseIdParamSchema = z.uuid('Invalid course id');
export const courseSlugSchema = z.object({
    slug: z.string().regex(slugRegex, 'Use lowercase letters, numbers, and hyphens only')
});

export type CourseLevel = z.infer<typeof courseLevelEnum>;
export type CourseStatus = z.infer<typeof courseStatusEnum>;
export type CreateCourseInput = z.infer<typeof createCourseSchema>;
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>;

// Module schemas
export const createModuleSchema = z.object({
    courseId: z.uuid('Invalid course ID'),
    order: z.number().int(),
    title: z.string().min(1, 'Title is required').max(100, 'Title is too long')
});

export const updateModuleSchema = z.object({
    id: z.uuid('Invalid module ID'),
    order: z.number().int().optional(),
    title: z.string().min(1, 'Title is required').max(100, 'Title is too long').optional()
});

// Lesson schemas
export const createLessonSchema = z.object({
    moduleId: z.uuid('Invalid module ID'),
    order: z.number().int(),
    title: z.string().min(1, 'Title is required').max(100, 'Title is too long')
});

export const updateLessonSchema = z.object({
    description: z.string().optional(),
    id: z.uuid('Invalid lesson ID'),
    order: z.number().int().optional(),
    title: z.string().min(1, 'Title is required').max(100, 'Title is too long').optional(),
    videoUrl: z.string().optional() // Allow empty string or invalid URL for drafts
});

export const reorderSchema = z.object({
    list: z.array(
        z.object({
            id: z.uuid(),
            position: z.number().int()
        })
    )
});
