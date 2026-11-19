import 'server-only';

import type { PrismaClient } from '@prisma/client';

import { meetsOrganizationRole } from '@/lib/auth/org-role-levels';

import { AccessError } from '@/server/auth/session';

import type { AuthoringTarget } from '../schemas/announcement-schemas';

/** The narrow part of the database client that authorization reads, so tests can supply a small fake. */
export type AuthorizationDb = Pick<PrismaClient, 'course' | 'member'>;

export interface ResolvedTarget {
    courseId: string | null;
    organizationId: string | null;
    scope: 'Course' | 'Organization';
}

const notFound = () => new AccessError('Announcement not found', 404);

async function roleIn(db: AuthorizationDb, userId: string, organizationId: string) {
    const member = await db.member.findUnique({
        select: { role: true },
        where: { userId_organizationId: { organizationId, userId } }
    });
    return member?.role ?? null;
}

/**
 * Decides whether `userId` may post to `target`, and returns the place the announcement belongs to. Anything the caller
 * may not post to is reported as not found, as the course editor does, so a foreign id reveals nothing.
 *
 * - Platform course: its owner.
 * - Organization course: its owner while still a member, or a member at `instructor` level or above.
 * - Organization-wide: a member at `manager` level or above.
 */
export async function resolveAuthoringTarget(
    db: AuthorizationDb,
    userId: string,
    target: AuthoringTarget
): Promise<ResolvedTarget> {
    if (target.scope === 'Organization') {
        const role = await roleIn(db, userId, target.organizationId);
        if (!role || !meetsOrganizationRole(role, 'manager')) throw notFound();
        return { courseId: null, organizationId: target.organizationId, scope: 'Organization' };
    }

    const course = await db.course.findFirst({
        select: { organizationId: true, userId: true },
        where: { deletedAt: null, id: target.courseId }
    });
    if (!course) throw notFound();

    if (!course.organizationId) {
        if (course.userId !== userId) throw notFound();
        return { courseId: target.courseId, organizationId: null, scope: 'Course' };
    }

    const role = await roleIn(db, userId, course.organizationId);
    if (!role) throw notFound();
    if (course.userId !== userId && !meetsOrganizationRole(role, 'instructor')) throw notFound();
    return { courseId: target.courseId, organizationId: course.organizationId, scope: 'Course' };
}

/** The target an existing announcement belongs to, in the shape `resolveAuthoringTarget` takes. */
export function targetOf(announcement: {
    courseId: string | null;
    organizationId: string | null;
    scope: 'Course' | 'Organization';
}): AuthoringTarget {
    if (announcement.scope === 'Course' && announcement.courseId) {
        return { courseId: announcement.courseId, scope: 'Course' };
    }
    if (announcement.scope === 'Organization' && announcement.organizationId) {
        return { organizationId: announcement.organizationId, scope: 'Organization' };
    }
    throw notFound();
}
