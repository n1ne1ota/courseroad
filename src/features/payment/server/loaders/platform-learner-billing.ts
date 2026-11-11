import 'server-only';

import { type PurchaseItem } from '@/features/payment/types';
import { getAuthenticatedUser } from '@/server/auth/session';
import { prismaClient } from '@/server/db/client';

/** Authorized payment projection for BillingContent. */
export async function loadBillingContent() {
    const user = await getAuthenticatedUser();
    const [coursePurchases, platformPurchases] = await Promise.all([
        prismaClient.purchase.findMany({
            orderBy: { createdAt: 'desc' },
            where: { userId: user.id }
        }),
        prismaClient.platformPurchase.findMany({
            orderBy: { createdAt: 'desc' },
            where: { userId: user.id }
        })
    ]);
    const courseIds = [...new Set(coursePurchases.map(p => p.courseId))];
    const courses = await prismaClient.course.findMany({
        select: { id: true, title: true },
        where: { id: { in: courseIds } }
    });
    const courseMap = new Map(courses.map(c => [c.id, c.title]));
    const unifiedPurchases: PurchaseItem[] = [
        ...coursePurchases.map(p => ({
            amount: p.amount,
            createdAt: p.createdAt,
            currency: p.currency,
            description: `Course: ${courseMap.get(p.courseId) || 'Unknown Course'}`,
            id: p.id,
            isPlatform: false,
            status: p.status
        })),
        ...platformPurchases.map(p => ({
            amount: p.amount,
            createdAt: p.createdAt,
            currency: p.currency,
            description: p.description || 'Platform Purchase',
            id: p.id,
            isPlatform: true,
            status: p.status
        }))
    ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    return { unifiedPurchases };
}
