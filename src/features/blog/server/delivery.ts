import 'server-only';

import type { PrismaClient } from '@prisma/client';

import { AnnouncementEmail } from '@/server/email/templates/announcement-email';

import type { BatchEmail } from '@/server/email/service';

import { announcementPath, UNSUBSCRIBE_API_PATH, UNSUBSCRIBE_PAGE_PATH } from '../lib/announcement-routes';
import { sanitizeAnnouncementHtml } from './sanitize';
import { signUnsubscribeToken } from './unsubscribe-token';

import type { EmailRecipient } from './db/audience';

/** Resend takes up to 100 emails per batch request and allows 10 requests per second per team by default. */
export const BATCH_SIZE = 100;
export const MIN_BATCH_INTERVAL_MS = 100;

export interface DeliveryDeps {
    appUrl: string;
    db: Pick<PrismaClient, 'announcement'>;
    log: { error: (message: string, error?: unknown) => void };
    secret: string;
    sendBatch: (emails: BatchEmail[], options: { idempotencyKey: string }) => Promise<unknown>;
    sleep?: (ms: number) => Promise<void>;
}

export type DeliveryResult = { sent: number; status: 'Sent' | 'Partial' | 'Failed' } | { status: 'skipped' };

const wait = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

/**
 * Emails a published announcement to its recipients and records the outcome on it.
 *
 * One email per recipient, 100 to a request, no faster than 10 requests a second, and each with its own unsubscribe
 * link, `List-Unsubscribe` and `List-Unsubscribe-Post` headers and an idempotency key of the form
 * `announcement:<id>:batch:<n>`. A failing batch stops the rest: the result is `Partial` if any went out and `Failed` if
 * none did, and nothing is retried automatically. The announcement itself stays published either way.
 */
export async function deliverAnnouncement(
    deps: DeliveryDeps,
    announcementId: string,
    recipients: readonly EmailRecipient[]
): Promise<DeliveryResult> {
    const announcement = await deps.db.announcement.findFirst({
        select: {
            author: { select: { firstName: true, lastName: true, name: true } },
            bodyHtml: true,
            course: { select: { title: true } },
            id: true,
            organization: { select: { name: true, slug: true } },
            title: true
        },
        where: { deletedAt: null, id: announcementId, status: 'Published' }
    });
    if (!announcement || recipients.length === 0) return { status: 'skipped' };
    const { title } = announcement;

    const sleep = deps.sleep ?? wait;
    const contextName = announcement.course?.title ?? announcement.organization?.name ?? 'Courseroad';
    const authorName =
        announcement.author.name ?? (`${announcement.author.firstName} ${announcement.author.lastName}`.trim() || null);
    const bodyHtml = sanitizeAnnouncementHtml(announcement.bodyHtml);
    const announcementUrl = new URL(
        announcementPath({ id: announcement.id, organizationSlug: announcement.organization?.slug }),
        deps.appUrl
    ).toString();

    function emailFor(recipient: EmailRecipient): BatchEmail {
        const token = signUnsubscribeToken(recipient.id, deps.secret);
        const unsubscribePage = new URL(UNSUBSCRIBE_PAGE_PATH, deps.appUrl);
        unsubscribePage.searchParams.set('token', token);
        const unsubscribeApi = new URL(UNSUBSCRIBE_API_PATH, deps.appUrl);
        unsubscribeApi.searchParams.set('token', token);

        return {
            headers: {
                'List-Unsubscribe': `<${unsubscribeApi.toString()}>`,
                'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click'
            },
            react: AnnouncementEmail({
                announcementUrl,
                authorName,
                bodyHtml,
                contextName,
                title,
                unsubscribeUrl: unsubscribePage.toString()
            }),
            subject: `${contextName}: ${title}`,
            to: recipient.email
        };
    }

    let sent = 0;
    let failed = false;

    for (let start = 0, batch = 0; start < recipients.length; start += BATCH_SIZE, batch += 1) {
        if (batch > 0) await sleep(MIN_BATCH_INTERVAL_MS);
        const slice = recipients.slice(start, start + BATCH_SIZE);

        try {
            await deps.sendBatch(slice.map(emailFor), {
                idempotencyKey: `announcement:${announcementId}:batch:${batch}`
            });
            sent += slice.length;
        } catch (error) {
            deps.log.error(`Announcement email batch ${batch} failed`, error);
            failed = true;
            break;
        }
    }

    const status = !failed ? 'Sent' : sent > 0 ? 'Partial' : 'Failed';
    try {
        await deps.db.announcement.update({
            data: { emailRecipientCount: sent, emailStatus: status },
            where: { id: announcementId }
        });
    } catch (error) {
        deps.log.error('Could not record the announcement email outcome', error);
    }
    return { sent, status };
}
