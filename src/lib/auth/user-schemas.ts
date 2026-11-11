import { z } from 'zod';

export const updateUserRoleSchema = z.object({
    targetRole: z.enum(['STAFF', 'CREATOR', 'PRO_LEARNER', 'LEARNER']),
    userId: z.uuid()
});

export const getUsersSchema = z.object({
    page: z.number().int().positive().optional().default(1),
    roleFilter: z.enum(['ADMIN', 'STAFF', 'CREATOR', 'PRO_LEARNER', 'LEARNER']).optional(),
    search: z.string().optional(),
    sortField: z.enum(['uid', 'firstName', 'email', 'role', 'createdAt']).optional().default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc')
});

export const bulkUpdateRoleSchema = z.object({
    targetRole: z.enum(['STAFF', 'CREATOR', 'PRO_LEARNER', 'LEARNER']),
    userIds: z.array(z.uuid()).min(1)
});

export const bulkDeleteUsersSchema = z.object({
    userIds: z.array(z.uuid()).min(1)
});
