import 'server-only';

import { getOrganizationContext } from '@/server/auth/organization-context';
import { missingResource } from '@/server/auth/read-errors';
import { AccessError } from '@/server/auth/session';
import { getAuthenticatedUser } from '@/server/auth/session';
import { getTenantPrisma } from '@/server/db/get-tenant-prisma';

/** Authorized course projection for CourseEditorFetcher. */
export async function loadCourseEditorFetcher({ courseId, orgSlug }: { courseId: string; orgSlug: string }) {
    await getOrganizationContext(orgSlug, 'creator');
    const user = await getAuthenticatedUser();
    const prisma = await getTenantPrisma(orgSlug, 'creator');
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(courseId)) {
        return missingResource();
    }
    const course = await prisma.course.findFirst({
        where: { id: courseId, userId: user.id },
        include: {
            modules: {
                include: {
                    lessons: {
                        orderBy: { order: 'asc' }
                    }
                },
                orderBy: { order: 'asc' }
            }
        }
    });
    if (!course) return missingResource();
    if (course && course.userId !== user.id) {
        const access = await getOrganizationContext(orgSlug, 'creator');
        if (!['owner', 'manager'].includes(access.member.role)) throw new AccessError('Not found', 404);
    }
    return { course };
}
