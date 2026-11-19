import 'server-only';

import { z } from 'zod';

import { missingResource } from '@/server/auth/read-errors';
import { getPlatformUser } from '@/server/auth/session';
import { prismaClient } from '@/server/db/client';

/** A platform creator can load only their own organization-free course. */
export async function loadPlatformCreatorCourseEditor(courseId: string) {
    const user = await getPlatformUser('creator');
    const id = z.uuid().safeParse(courseId);
    if (!id.success) return missingResource();
    const course = await prismaClient.course.findFirst({
        where: { id: id.data, userId: user.id, organizationId: null },
        include: {
            modules: {
                orderBy: { order: 'asc' },
                include: { lessons: { orderBy: { order: 'asc' } } }
            }
        }
    });
    if (!course) return missingResource();
    return { course };
}
