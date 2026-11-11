import 'server-only';

import { z } from 'zod';

import { getOrganizationContext } from '@/server/auth/organization-context';
import { getAuthenticatedUser } from '@/server/auth/session';
import { prismaClient } from '@/server/db/client';

/** Enrollment polling exposes only the caller's access and resource-derived learning URL. */
export async function getEnrollmentStatus(courseId: string) {
    const id = z.uuid().parse(courseId);
    const user = await getAuthenticatedUser();
    const enrollment = await prismaClient.enrollment.findUnique({
        where: { userId_courseId: { courseId: id, userId: user.id } },
        select: { id: true, course: { select: { organizationId: true } } }
    });
    const organization = enrollment?.course.organizationId
        ? await prismaClient.organization.findUnique({
              where: { id: enrollment.course.organizationId },
              select: { slug: true }
          })
        : null;
    if (organization) await getOrganizationContext(organization.slug);
    return {
        isEnrolled: !!enrollment,
        learnHref: organization
            ? `/organization/${organization.slug}/learner/dashboard/learn/${id}`
            : `/learner/dashboard/learn/${id}`
    };
}
