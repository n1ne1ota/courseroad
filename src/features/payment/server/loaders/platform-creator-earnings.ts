import 'server-only';

import { getPlatformUser } from '@/server/auth/session';
import { prismaClient } from '@/server/db/client';

/** Authorized payment projection for CreatorDashboardEarningsPage. */
export async function loadCreatorDashboardEarningsPage() {
    const sessionUser = await getPlatformUser('CREATOR');
    const user = await prismaClient.user.findUniqueOrThrow({
        select: {
            id: true,
            stripeAccountId: true,
            stripeOnboardingComplete: true
        },
        where: { id: sessionUser.id }
    });
    const courses = await prismaClient.course.findMany({
        select: { id: true, title: true },
        where: { userId: user.id }
    });
    const courseMap = new Map(courses.map(c => [c.id, c.title]));
    const courseIds = courses.map(c => c.id);
    let purchases: Array<{
        amount: number;
        courseId: string;
        createdAt: Date;
        currency: string;
        id: string;
        status: string;
    }> = [];
    let totalEarnings = 0;
    if (courseIds.length > 0) {
        purchases = await prismaClient.purchase.findMany({
            orderBy: { createdAt: 'desc' },
            select: {
                amount: true,
                courseId: true,
                createdAt: true,
                currency: true,
                id: true,
                status: true
            },
            where: {
                courseId: { in: courseIds },
                status: 'Paid'
            }
        });

        totalEarnings = purchases.reduce((sum, p) => sum + p.amount, 0);
    }
    const displayTotalEarnings = (totalEarnings / 100).toLocaleString(undefined, {
        currency: 'USD',
        minimumFractionDigits: 2,
        style: 'currency'
    });
    return { user, courseMap, purchases, displayTotalEarnings };
}
