import 'server-only';

import { getOrganizationContext } from '@/server/auth/organization-context';
import { getAuthenticatedUser } from '@/server/auth/session';
import { getTenantPrisma } from '@/server/db/get-tenant-prisma';

/** Authorized course projection for LearnerCoursesView. */
export async function loadLearnerCoursesView() {
    await getOrganizationContext(undefined, 'learner');
    const user = await getAuthenticatedUser();
    const prisma = await getTenantPrisma(undefined, 'learner');
    const dbUser = await prisma.user.findUnique({
        select: {
            id: true,
            name: true,
            firstName: true,
            lastName: true,
            email: true,
            image: true,
            username: true,
            role: true
        },
        where: { id: user.id }
    });
    return { dbUser };
}
