import 'server-only';

import type { PrismaLike, UserInfo } from '@/server/auth/user-info';

/**
 * Batch-fetch users by an array of IDs.
 * Returns a `Map<userId, UserInfo>` for efficient lookups.
 */
export async function getUsersByIds(prisma: PrismaLike, userIds: string[]): Promise<Map<string, UserInfo>> {
    if (userIds.length === 0) return new Map();

    const users = await prisma.user.findMany({
        select: { firstName: true, id: true, lastName: true },
        where: { id: { in: userIds } }
    });

    return new Map(users.map((u: UserInfo) => [u.id, u]));
}
