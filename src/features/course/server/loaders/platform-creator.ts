import 'server-only';

import { getPlatformUser } from '@/server/auth/session';
import { prismaClient } from '@/server/db/client';

/** Authorized course projection for CreatorDashboardOverviewPage. */
export async function loadCreatorDashboardOverviewPage() {
    const user = await getPlatformUser('CREATOR');
    const courses = await prismaClient.course.findMany({
        select: { id: true },
        where: { userId: user.id }
    });
    const courseIds = courses.map(c => c.id);
    let activeLearners = 0;
    let totalEarnings = 0;
    let totalSales = 0;
    if (courseIds.length > 0) {
        activeLearners = await prismaClient.enrollment.count({
            where: { courseId: { in: courseIds } }
        });

        const purchasesSummary = await prismaClient.purchase.aggregate({
            _count: {
                id: true
            },
            _sum: {
                amount: true
            },
            where: {
                courseId: { in: courseIds },
                status: 'Paid'
            }
        });

        totalEarnings = purchasesSummary._sum.amount ?? 0;
        totalSales = purchasesSummary._count.id ?? 0;
    }
    return { user, activeLearners, totalEarnings, totalSales };
}
