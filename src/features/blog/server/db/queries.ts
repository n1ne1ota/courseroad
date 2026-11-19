import 'server-only';

import type { Prisma, PrismaClient } from '@prisma/client';

import { AccessError } from '@/server/auth/session';

import { type AuthoringTarget, FEED_PAGE_SIZE } from '../../schemas/announcement-schemas';
import { type AuthorizationDb, resolveAuthoringTarget, targetOf } from '../authorization';
import { plainText, sanitizeAnnouncementHtml } from '../sanitize';
import { type AudienceDb, readableWhere } from './audience';
import { decodeCursor, encodeCursor } from './cursor';

import type { AnnouncementDetail, AnnouncementSummary, AuthoredAnnouncement } from '../../types/announcement-types';

export type QueryDb = AudienceDb & AuthorizationDb & Pick<PrismaClient, 'announcementRead'>;

const EXCERPT_LENGTH = 160;

const summarySelect = {
    author: { select: { firstName: true, lastName: true, name: true } },
    bodyHtml: true,
    course: { select: { title: true } },
    id: true,
    organization: { select: { name: true } },
    pinned: true,
    publishedAt: true,
    scope: true,
    title: true
} satisfies Prisma.AnnouncementSelect;

type Row = Prisma.AnnouncementGetPayload<{ select: typeof summarySelect }>;

function authorName(author: Row['author']) {
    return author.name ?? (`${author.firstName} ${author.lastName}`.trim() || null);
}

function toSummary(row: Row, read: boolean): AnnouncementSummary {
    const text = plainText(sanitizeAnnouncementHtml(row.bodyHtml));
    return {
        authorName: authorName(row.author),
        courseTitle: row.course?.title ?? null,
        excerpt: text.length > EXCERPT_LENGTH ? `${text.slice(0, EXCERPT_LENGTH).trimEnd()}...` : text,
        id: row.id,
        organizationName: row.organization?.name ?? null,
        pinned: row.pinned,
        publishedAt: row.publishedAt?.toISOString() ?? null,
        read,
        scope: row.scope,
        title: row.title
    };
}

/** One page of the feed: pinned first, then newest first, 20 at a time, by a keyset cursor. */
export async function listFeed(
    db: QueryDb,
    userId: string,
    options: { cursor?: string | undefined; now?: Date; organizationId: string | null }
): Promise<{ items: AnnouncementSummary[]; nextCursor: string | null }> {
    const now = options.now ?? new Date();
    const base = await readableWhere(db, userId, now, { organizationId: options.organizationId });
    const cursor = decodeCursor(options.cursor);

    const after: Prisma.AnnouncementWhereInput[] = [];
    if (cursor) {
        const at = new Date(cursor.publishedAt);
        const olderThanCursor: Prisma.AnnouncementWhereInput = {
            OR: [{ publishedAt: { lt: at } }, { id: { lt: cursor.id }, publishedAt: at }]
        };
        after.push(
            cursor.pinned
                ? { OR: [{ pinned: false }, { AND: [{ pinned: true }, olderThanCursor] }] }
                : { AND: [{ pinned: false }, olderThanCursor] }
        );
    }

    const rows = await db.announcement.findMany({
        orderBy: [{ pinned: 'desc' }, { publishedAt: 'desc' }, { id: 'desc' }],
        select: summarySelect,
        take: FEED_PAGE_SIZE + 1,
        where: { ...base, AND: [...(Array.isArray(base.AND) ? base.AND : base.AND ? [base.AND] : []), ...after] }
    });

    const page = rows.slice(0, FEED_PAGE_SIZE);
    const reads = await db.announcementRead.findMany({
        select: { announcementId: true },
        where: { announcementId: { in: page.map(row => row.id) }, userId }
    });
    const readIds = new Set(reads.map(read => read.announcementId));

    const last = page.at(-1);
    const nextCursor =
        rows.length > FEED_PAGE_SIZE && last?.publishedAt
            ? encodeCursor({ id: last.id, pinned: last.pinned, publishedAt: last.publishedAt.toISOString() })
            : null;

    return { items: page.map(row => toSummary(row, readIds.has(row.id))), nextCursor };
}

/** Published announcements in the user's audience that they have not opened. */
export async function getUnreadCount(
    db: QueryDb,
    userId: string,
    options: { now?: Date; organizationId: string | null }
): Promise<number> {
    const base = await readableWhere(db, userId, options.now ?? new Date(), { organizationId: options.organizationId });
    return db.announcement.count({ where: { ...base, reads: { none: { userId } } } });
}

/** One announcement for a reader. Anything outside their audience, a draft or a deleted one is not found. */
export async function getReadableAnnouncement(
    db: QueryDb,
    userId: string,
    announcementId: string,
    now: Date = new Date()
): Promise<AnnouncementDetail> {
    const base = await readableWhere(db, userId, now);
    const row = await db.announcement.findFirst({ select: summarySelect, where: { ...base, id: announcementId } });
    if (!row) throw new AccessError('Announcement not found', 404);

    const read = await db.announcementRead.findUnique({
        select: { userId: true },
        where: { userId_announcementId: { announcementId, userId } }
    });
    return { ...toSummary(row, Boolean(read)), bodyHtml: sanitizeAnnouncementHtml(row.bodyHtml) };
}

/** Records that the user opened an announcement. Repeating it changes nothing. */
export async function markRead(db: QueryDb, userId: string, announcementId: string, now: Date = new Date()) {
    await getReadableAnnouncement(db, userId, announcementId, now);
    const { count } = await db.announcementRead.createMany({
        data: [{ announcementId, userId }],
        skipDuplicates: true
    });
    return { newlyRead: count > 0 };
}

const authoredSelect = {
    ...summarySelect,
    emailRecipientCount: true,
    emailStatus: true,
    status: true,
    updatedAt: true
} satisfies Prisma.AnnouncementSelect;

function toAuthored(row: Prisma.AnnouncementGetPayload<{ select: typeof authoredSelect }>): AuthoredAnnouncement {
    return {
        ...toSummary(row, true),
        bodyHtml: sanitizeAnnouncementHtml(row.bodyHtml),
        emailRecipientCount: row.emailRecipientCount,
        emailStatus: row.emailStatus,
        status: row.status,
        updatedAt: row.updatedAt.toISOString()
    };
}

/** Announcements an author can manage for a course or organization, drafts included, newest first. */
export async function listAuthored(db: QueryDb, userId: string, target: AuthoringTarget) {
    const resolved = await resolveAuthoringTarget(db, userId, target);
    const rows = await db.announcement.findMany({
        orderBy: [{ createdAt: 'desc' }],
        select: authoredSelect,
        where:
            resolved.scope === 'Course'
                ? { courseId: resolved.courseId, deletedAt: null }
                : { deletedAt: null, organizationId: resolved.organizationId, scope: 'Organization' }
    });
    return rows.map(toAuthored);
}

/** One announcement for its authors, to edit. Not found unless the user may post to its course or organization. */
export async function getAuthoredAnnouncement(db: QueryDb, userId: string, announcementId: string) {
    const row = await db.announcement.findFirst({
        select: { ...authoredSelect, courseId: true, organizationId: true },
        where: { deletedAt: null, id: announcementId }
    });
    if (!row) throw new AccessError('Announcement not found', 404);
    await resolveAuthoringTarget(db, userId, targetOf(row));
    return toAuthored(row);
}
