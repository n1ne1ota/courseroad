import 'server-only';

import { createOrgRoutes } from '@/lib/routes/org';

import { getCoursesByUserId } from '@/features/course/server/repositories/queries/get-courses';
import { getOrganizationContext } from '@/server/auth/organization-context';
import { getAuthenticatedUser } from '@/server/auth/session';
import { getTenantPrisma } from '@/server/db/get-tenant-prisma';
type CreatorCoursesViewProps = {
    orgSlug: string;
    role: string;
};
/** Authorized course projection for CreatorCoursesView. */
export async function loadCreatorCoursesView({ orgSlug, role }: CreatorCoursesViewProps) {
    await getOrganizationContext(orgSlug, 'creator');
    const user = await getAuthenticatedUser();
    const prisma = await getTenantPrisma(orgSlug, 'creator');
    const courses = await getCoursesByUserId(prisma, user.id);
    const orgRoutes = createOrgRoutes(orgSlug, role);
    return { courses, orgRoutes };
}
