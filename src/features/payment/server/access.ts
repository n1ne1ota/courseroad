import 'server-only';

import { z } from 'zod';

import { getOrganizationContext } from '@/server/auth/organization-context';
import { AccessError, getAuthenticatedUser } from '@/server/auth/session';
import { prismaClient } from '@/server/db/client';

/** Checkout independently validates the course and its organization membership. */
export async function requireCoursePurchase(input: string) {
    const courseId = z.uuid().parse(input);
    const user = await getAuthenticatedUser();
    const course = await prismaClient.course.findUnique({
        where: { id: courseId },
        select: { id: true, userId: true, organizationId: true, status: true, price: true }
    });
    if (!course || course.status !== 'Published') throw new AccessError('Course not found', 404);
    if (course.organizationId) {
        const organization = await prismaClient.organization.findUnique({
            where: { id: course.organizationId },
            select: { slug: true }
        });
        if (!organization) throw new AccessError('Course not found', 404);
        await getOrganizationContext(organization.slug);
    }
    return { user, course };
}
