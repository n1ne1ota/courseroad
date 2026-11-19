import 'server-only';

import type { Prisma, PrismaClient } from '@prisma/client';

export type AudienceDb = Pick<PrismaClient, 'announcement' | 'enrollment' | 'member' | 'user'>;

/** Enrollments whose access has not expired. */
function activeAccess(now: Date): Prisma.EnrollmentWhereInput {
    return { OR: [{ accessExpiresAt: null }, { accessExpiresAt: { gt: now } }] };
}

export interface FeedScope {
    /** A UUID for one organization's feed, `null` for the platform feed, `undefined` for everything the user can read. */
    organizationId?: string | null | undefined;
}

/**
 * The announcements `userId` may read: published, not deleted, and addressed to them. A course announcement reaches
 * learners with unexpired access to that course (and, for an organization course, who are still members); an
 * organization announcement reaches the organization's members. Drafts and deleted announcements never match.
 */
export async function readableWhere(
    db: AudienceDb,
    userId: string,
    now: Date,
    scope: FeedScope = {}
): Promise<Prisma.AnnouncementWhereInput> {
    const [enrollments, memberships] = await Promise.all([
        db.enrollment.findMany({ select: { courseId: true }, where: { userId, ...activeAccess(now) } }),
        db.member.findMany({ select: { organizationId: true }, where: { userId } })
    ]);
    const courseIds = enrollments.map(enrollment => enrollment.courseId);
    const organizationIds = memberships.map(member => member.organizationId);

    const audience: Prisma.AnnouncementWhereInput = {
        OR: [
            {
                course: { deletedAt: null },
                courseId: { in: courseIds },
                OR: [{ organizationId: null }, { organizationId: { in: organizationIds } }],
                scope: 'Course'
            },
            { organizationId: { in: organizationIds }, scope: 'Organization' }
        ]
    };

    return {
        AND: [audience, scope.organizationId === undefined ? {} : { organizationId: scope.organizationId }],
        deletedAt: null,
        status: 'Published'
    };
}

export interface EmailRecipient {
    email: string;
    id: string;
    name: string | null;
}

/**
 * Who an emailed announcement goes to: its audience, minus the author, anyone who opted out of announcement email and
 * anyone without a verified address. `skipped` counts audience members left out for those reasons.
 */
export async function listEmailRecipients(
    db: AudienceDb,
    announcement: { authorId: string; courseId: string | null; organizationId: string | null; scope: string },
    now: Date
): Promise<{ recipients: EmailRecipient[]; skipped: number }> {
    let audienceIds: string[];

    if (announcement.scope === 'Course' && announcement.courseId) {
        const enrollments = await db.enrollment.findMany({
            select: { userId: true },
            where: { courseId: announcement.courseId, ...activeAccess(now) }
        });
        audienceIds = enrollments.map(enrollment => enrollment.userId);

        if (announcement.organizationId) {
            const members = await db.member.findMany({
                select: { userId: true },
                where: { organizationId: announcement.organizationId, userId: { in: audienceIds } }
            });
            const memberIds = new Set(members.map(member => member.userId));
            audienceIds = audienceIds.filter(id => memberIds.has(id));
        }
    } else if (announcement.organizationId) {
        const members = await db.member.findMany({
            select: { userId: true },
            where: { organizationId: announcement.organizationId }
        });
        audienceIds = members.map(member => member.userId);
    } else {
        return { recipients: [], skipped: 0 };
    }

    audienceIds = [...new Set(audienceIds)].filter(id => id !== announcement.authorId);

    const users = await db.user.findMany({
        select: { announcementEmails: true, email: true, emailVerified: true, id: true, name: true },
        where: { id: { in: audienceIds } }
    });
    const eligible = users.filter(user => user.announcementEmails && user.emailVerified && user.email);

    return {
        recipients: eligible.map(({ email, id, name }) => ({ email, id, name })),
        skipped: audienceIds.length - eligible.length
    };
}
