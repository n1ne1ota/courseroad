import 'server-only';

import { getAuthenticatedUser } from '@/server/auth/session';
import { env } from '@/server/config/runtime';
import { prismaClient } from '@/server/db/client';

import { resolveAuthoringTarget } from '../authorization';
import { listEmailRecipients } from '../db/audience';
import {
    getAuthoredAnnouncement,
    getReadableAnnouncement,
    getUnreadCount,
    listAuthored,
    listFeed
} from '../db/queries';
import { verifyUnsubscribeToken } from '../unsubscribe-token';

import type { AuthoringTarget } from '../../schemas/announcement-schemas';

/**
 * Reads for Server Components. Each one authenticates and authorizes on its own, whatever layout rendered it: the
 * audience rules live in the queries, so a user outside a course or organization gets an empty feed or a not-found.
 */

export async function readFeed(options: { cursor?: string | undefined; organizationId: string | null }) {
    const user = await getAuthenticatedUser();
    return listFeed(prismaClient, user.id, options);
}

export async function readUnreadCount(organizationId: string | null) {
    const user = await getAuthenticatedUser();
    return getUnreadCount(prismaClient, user.id, { organizationId });
}

export async function readAnnouncement(announcementId: string) {
    const user = await getAuthenticatedUser();
    return getReadableAnnouncement(prismaClient, user.id, announcementId);
}

export async function readAuthoredList(target: AuthoringTarget) {
    const user = await getAuthenticatedUser();
    return listAuthored(prismaClient, user.id, target);
}

export async function readAuthoredAnnouncement(announcementId: string) {
    const user = await getAuthenticatedUser();
    return getAuthoredAnnouncement(prismaClient, user.id, announcementId);
}

export async function readEmailPreference() {
    const user = await getAuthenticatedUser();
    const row = await prismaClient.user.findUnique({ select: { announcementEmails: true }, where: { id: user.id } });
    return row?.announcementEmails ?? true;
}

/**
 * What emailing an announcement to this course or organization would involve: the cap, and how many people it would
 * reach. The email option is hidden while the cap is 0, so no audience is counted then.
 */
export async function readEmailAudience(target: AuthoringTarget) {
    const user = await getAuthenticatedUser();
    const resolved = await resolveAuthoringTarget(prismaClient, user.id, target);
    const cap = env.ANNOUNCEMENT_EMAIL_MAX_RECIPIENTS;
    if (cap <= 0) return { cap, count: 0 };

    const { recipients } = await listEmailRecipients(
        prismaClient,
        {
            authorId: user.id,
            courseId: resolved.courseId,
            organizationId: resolved.organizationId,
            scope: resolved.scope
        },
        new Date()
    );
    return { cap, count: recipients.length };
}

/** Whether a signed announcement-unsubscribe link token is structurally valid and authentic. */
export function isValidUnsubscribeToken(token: string | null | undefined): boolean {
    return Boolean(verifyUnsubscribeToken(token, env.BETTER_AUTH_SECRET));
}
