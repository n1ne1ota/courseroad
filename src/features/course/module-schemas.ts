import { z } from 'zod';

export const createModuleSchema = z.object({
    courseId: z.uuid(),
    title: z.string().min(1)
});

export const updateModuleSchema = z.object({
    moduleId: z.uuid(),
    title: z.string().min(1)
});

export const deleteModuleSchema = z.object({
    moduleId: z.uuid()
});

export const reorderModulesSchema = z.array(
    z.object({
        id: z.uuid(),
        position: z.number().int()
    })
);
