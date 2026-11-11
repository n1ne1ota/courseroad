import 'server-only';

import { getPlatformUser } from '@/server/auth/session';
import { prismaClient } from '@/server/db/client';

/** Authorized course projection for CreatorDashboardCoursesPage. */
export async function loadCreatorDashboardCoursesPage() {
    const user = await getPlatformUser('CREATOR');
    const courses = await prismaClient.course.findMany({
        include: {
            _count: {
                select: { enrollments: true }
            }
        },
        orderBy: { createdAt: 'desc' },
        where: { userId: user.id }
    });
    return { courses };
}
