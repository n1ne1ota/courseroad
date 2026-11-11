import 'server-only';

import { revalidatePath } from 'next/cache';

import { bulkDeleteUsersSchema, bulkUpdateRoleSchema, updateUserRoleSchema } from '@/lib/auth/user-schemas';

import { createAdminAction } from '@/server/actions/create-admin-action';
import { prismaClient as prisma } from '@/server/db/client';
import { logs } from '@/server/logging/server';

export const updateUserRole = createAdminAction(updateUserRoleSchema, async ({ targetRole, userId }, { user }) => {
    try {
        const targetUser = await prisma.user.findUnique({
            select: { id: true, role: true },
            where: { id: userId }
        });

        if (!targetUser) throw new Error('User not found');
        if (targetUser.role === 'admin') throw new Error('Cannot modify admin roles');
        if (targetUser.id === user.id) throw new Error('Cannot modify your own active admin role');

        await prisma.user.update({
            data: { role: targetRole },
            where: { id: targetUser.id }
        });

        revalidatePath('/admin/dashboard/users');
    } catch (error) {
        logs.db.error('Failed to update user role', error);
        if (error instanceof Error) throw error;
        throw new Error('Failed to update user role');
    }
});

export const bulkUpdateUserRoles = createAdminAction(
    bulkUpdateRoleSchema,
    async ({ targetRole, userIds }, { user }) => {
        try {
            const result = await prisma.user.updateMany({
                data: { role: targetRole },
                where: {
                    id: { in: userIds, not: user.id },
                    role: { not: 'admin' }
                }
            });

            revalidatePath('/admin/dashboard/users');
            return { updatedCount: result.count };
        } catch (error) {
            logs.db.error('Failed to bulk update user roles', error);
            throw new Error('Failed to bulk update user roles');
        }
    }
);

export const bulkDeleteUsers = createAdminAction(bulkDeleteUsersSchema, async ({ userIds }, { user }) => {
    try {
        const result = await prisma.user.deleteMany({
            where: {
                id: { in: userIds, not: user.id },
                role: { not: 'admin' }
            }
        });

        revalidatePath('/admin/dashboard/users');
        return { deletedCount: result.count };
    } catch (error) {
        logs.db.error('Failed to bulk delete users', error);
        throw new Error('Failed to bulk delete users');
    }
});
