import 'server-only';

import type { Prisma } from '@prisma/client';

import { getUsersSchema } from '@/lib/auth/user-schemas';

import { getPlatformUser } from '@/server/auth/session';
import { prismaClient as prisma } from '@/server/db/client';
import { logs } from '@/server/logging/server';
const USERS_PER_PAGE = 20;
/** Authoritative, validated admin list query used directly by Server Components. */
export async function getUsers(input: unknown) {
    await getPlatformUser('admin');
    const params = getUsersSchema.parse(input);
    const { page, roleFilter, search, sortField, sortOrder } = params;
    const skip = (page - 1) * USERS_PER_PAGE;

    let whereClause: Prisma.UserWhereInput = {};

    if (search) {
        const searchInt = parseInt(search, 10);
        whereClause = {
            OR: [
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
                { username: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                ...(isNaN(searchInt) ? [] : [{ uid: searchInt }])
            ]
        };
    }

    if (roleFilter) whereClause.role = roleFilter;

    let orderBy: Prisma.UserOrderByWithRelationInput;
    const order = sortOrder as 'asc' | 'desc';
    switch (sortField) {
        case 'uid':
            orderBy = { uid: order };
            break;
        case 'firstName':
            orderBy = { firstName: order };
            break;
        case 'email':
            orderBy = { email: order };
            break;
        case 'role':
            orderBy = { role: order };
            break;
        case 'createdAt':
        default:
            orderBy = { createdAt: order };
            break;
    }

    try {
        const [users, totalCount] = await Promise.all([
            prisma.user.findMany({
                orderBy,
                select: {
                    createdAt: true,
                    email: true,
                    firstName: true,
                    hasPaidActivationFee: true,
                    id: true,
                    image: true,
                    lastName: true,
                    role: true,
                    uid: true,
                    username: true
                },
                skip,
                take: USERS_PER_PAGE,
                where: whereClause
            }),
            prisma.user.count({ where: whereClause })
        ]);

        return {
            totalCount,
            totalPages: Math.ceil(totalCount / USERS_PER_PAGE),
            users
        };
    } catch (error) {
        logs.db.error('Failed to get users', error);
        throw new Error('Failed to fetch users');
    }
}
