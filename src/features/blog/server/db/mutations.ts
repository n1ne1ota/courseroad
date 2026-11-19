import 'server-only';

import type { PrismaClient } from '@prisma/client';

import { AccessError } from '@/server/auth/session';

import {
    type CreateAnnouncementInput,
    EMAILED_PER_DAY_LIMIT,
    type UpdateAnnouncementInput
} from '../../schemas/announcement-schemas';
import { type AuthorizationDb, resolveAuthoringTarget, targetOf } from '../authorization';
import { plainText, sanitizeAnnouncementHtml } from '../sanitize';
import { type AudienceDb, type EmailRecipient, listEmailRecipients } from './audience';

export type MutationDb = AudienceDb & AuthorizationDb & Pick<PrismaClient, '$transaction'>;

/** Sanitizes a body for storage and refuses one that has no text once the markup is gone. */
function cleanBody(bodyHtml: string): string {
    const clean = sanitizeAnnouncementHtml(bodyHtml);
    if (!plainText(clean)) throw new Error('Write a message');
    return clean;
}

/** Loads a live announcement and checks the user may manage it, in one place for every authoring operation. */
async function loadManageable(db: MutationDb, userId: string, announcementId: string) {
    const announcement = await db.announcement.findFirst({
        where: { deletedAt: null, id: announcementId }
    });
    if (!announcement) throw new AccessError('Announcement not found', 404);
    await resolveAuthoringTarget(db, userId, targetOf(announcement));
    return announcement;
}

/** Creates a draft. The place it belongs to comes from the authorized target, never from the caller's other fields. */
export async function createAnnouncement(db: MutationDb, userId: string, input: CreateAnnouncementInput) {
    const target = await resolveAuthoringTarget(
        db,
        userId,
        input.scope === 'Course'
            ? { courseId: input.courseId, scope: 'Course' }
            : { organizationId: input.organizationId, scope: 'Organization' }
    );

    return db.announcement.create({
        data: {
            authorId: userId,
            bodyHtml: cleanBody(input.bodyHtml),
            courseId: target.courseId,
            organizationId: target.organizationId,
            pinned: input.pinned,
            scope: target.scope,
            title: input.title
        }
    });
}

/** Edits the title, body and pin of an announcement. Its scope, course and organization cannot change. */
export async function updateAnnouncement(db: MutationDb, userId: string, input: UpdateAnnouncementInput) {
    await loadManageable(db, userId, input.announcementId);

    return db.announcement.update({
        data: {
            bodyHtml: cleanBody(input.bodyHtml),
            ...(input.pinned === undefined ? {} : { pinned: input.pinned }),
            title: input.title
        },
        where: { id: input.announcementId }
    });
}

export async function setPinned(db: MutationDb, userId: string, announcementId: string, pinned: boolean) {
    await loadManageable(db, userId, announcementId);
    return db.announcement.update({ data: { pinned }, where: { id: announcementId } });
}

/** Soft delete: the row stays, readers and the feed stop seeing it. Deleting twice is a not-found, not a second delete. */
export async function deleteAnnouncement(db: MutationDb, userId: string, announcementId: string, now = new Date()) {
    await loadManageable(db, userId, announcementId);
    await db.announcement.update({ data: { deletedAt: now }, where: { id: announcementId } });
}

export type PublishResult =
    | { alreadyPublished: true; announcementId: string }
    | { alreadyPublished: false; announcementId: string; email: EmailDecision };

export type EmailDecision =
    | { outcome: 'not-requested' }
    | { cap: number; outcome: 'disabled' }
    | { cap: number; outcome: 'over-cap'; recipientCount: number }
    | { limit: number; outcome: 'rate-limited' }
    | { outcome: 'no-recipients' }
    | { outcome: 'send'; recipientCount: number; recipients: EmailRecipient[]; skipped: number };

/**
 * Publishes a draft. Publishing an announcement that is already published changes nothing, so it never emails twice.
 * When email is requested, whether it may go out is decided here, in the same transaction that publishes: the cap, and
 * at most three emailed announcements per course or organization in 24 hours. A chosen send records the recipient count
 * now, which is what the 24-hour limit counts.
 */
export async function publishAnnouncement(
    db: MutationDb,
    userId: string,
    announcementId: string,
    email: { cap: number; sendEmail: boolean },
    now: Date = new Date()
): Promise<PublishResult> {
    const announcement = await loadManageable(db, userId, announcementId);
    if (announcement.status === 'Published') return { alreadyPublished: true, announcementId };

    // Recipients are worked out before the transaction, so it only holds the cheap checks and the writes.
    const audience =
        email.sendEmail && email.cap > 0
            ? await listEmailRecipients(db, announcement, now)
            : { recipients: [], skipped: 0 };
    const recipientCount = audience.recipients.length;

    return db.$transaction(async tx => {
        const claimed = await tx.announcement.updateMany({
            data: { publishedAt: now, status: 'Published' },
            where: { deletedAt: null, id: announcementId, status: 'Draft' }
        });
        if (claimed.count === 0) return { alreadyPublished: true, announcementId } as const;

        let decision: EmailDecision = { outcome: 'not-requested' };
        if (email.sendEmail) {
            if (email.cap <= 0) {
                decision = { cap: email.cap, outcome: 'disabled' };
            } else if (recipientCount === 0) {
                decision = { outcome: 'no-recipients' };
            } else if (recipientCount > email.cap) {
                decision = { cap: email.cap, outcome: 'over-cap', recipientCount };
            } else {
                const since = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                const emailed = await tx.announcement.count({
                    where: {
                        emailRecipientCount: { not: null },
                        id: { not: announcementId },
                        publishedAt: { gte: since },
                        ...(announcement.courseId
                            ? { courseId: announcement.courseId }
                            : { courseId: null, organizationId: announcement.organizationId })
                    }
                });
                decision =
                    emailed >= EMAILED_PER_DAY_LIMIT
                        ? { limit: EMAILED_PER_DAY_LIMIT, outcome: 'rate-limited' }
                        : {
                              outcome: 'send',
                              recipientCount,
                              recipients: audience.recipients,
                              skipped: audience.skipped
                          };
            }
        }

        if (decision.outcome === 'send') {
            await tx.announcement.update({
                data: { emailRecipientCount: decision.recipientCount },
                where: { id: announcementId }
            });
        }
        return { alreadyPublished: false, announcementId, email: decision } as const;
    });
}
