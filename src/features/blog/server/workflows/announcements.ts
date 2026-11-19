import 'server-only';

import { revalidatePath } from 'next/cache';
import { after } from 'next/server';

import { createAuthAction } from '@/server/actions/create-auth-action';
import { env } from '@/server/config/runtime';
import { prismaClient } from '@/server/db/client';

import {
    announcementEmailPreferenceSchema,
    announcementIdSchema,
    createAnnouncementSchema,
    feedQuerySchema,
    pinAnnouncementSchema,
    publishAnnouncementSchema,
    updateAnnouncementSchema
} from '../../schemas/announcement-schemas';
import {
    createAnnouncement,
    deleteAnnouncement,
    publishAnnouncement,
    setPinned,
    updateAnnouncement
} from '../db/mutations';
import { listFeed, markRead } from '../db/queries';
import { unsubscribeByToken } from '../db/unsubscribe';
import { deliverAnnouncementEmail } from '../email';

/** Dashboards render announcement lists and counts on the server, so a change refreshes them. */
function refresh() {
    revalidatePath('/learner/dashboard', 'layout');
    revalidatePath('/creator/dashboard', 'layout');
    revalidatePath('/organization/[slug]', 'layout');
}

export const createAnnouncementAction = createAuthAction(createAnnouncementSchema, async (input, { user }) => {
    const created = await createAnnouncement(prismaClient, user.id, input);
    refresh();
    return { id: created.id };
});

export const updateAnnouncementAction = createAuthAction(updateAnnouncementSchema, async (input, { user }) => {
    await updateAnnouncement(prismaClient, user.id, input);
    refresh();
    return { id: input.announcementId };
});

export const pinAnnouncementAction = createAuthAction(pinAnnouncementSchema, async (input, { user }) => {
    await setPinned(prismaClient, user.id, input.announcementId, input.pinned);
    refresh();
    return { id: input.announcementId };
});

export const deleteAnnouncementAction = createAuthAction(announcementIdSchema, async (input, { user }) => {
    await deleteAnnouncement(prismaClient, user.id, input.announcementId);
    refresh();
    return { id: input.announcementId };
});

/**
 * Publishes a draft and, when asked, emails it. The announcement commits first; delivery runs afterwards and its
 * outcome is recorded on the announcement, so a failed send never un-publishes.
 */
export const publishAnnouncementAction = createAuthAction(publishAnnouncementSchema, async (input, { user }) => {
    const result = await publishAnnouncement(prismaClient, user.id, input.announcementId, {
        cap: env.ANNOUNCEMENT_EMAIL_MAX_RECIPIENTS,
        sendEmail: input.sendEmail
    });
    refresh();

    if (result.alreadyPublished) return { alreadyPublished: true as const, id: result.announcementId };

    if (result.email.outcome === 'send') {
        const { announcementId } = result;
        const { recipients } = result.email;
        after(() => deliverAnnouncementEmail(announcementId, recipients));
    }
    // The browser learns the outcome and counts, never the recipients' addresses.
    const { email } = result;
    return {
        alreadyPublished: false as const,
        email: email.outcome === 'send' ? { outcome: 'send' as const, recipientCount: email.recipientCount } : email,
        id: result.announcementId
    };
});

export const markAnnouncementReadAction = createAuthAction(announcementIdSchema, async (input, { user }) => {
    const result = await markRead(prismaClient, user.id, input.announcementId);
    if (result.newlyRead) refresh();
    return result;
});

export const loadFeedAction = createAuthAction(feedQuerySchema, async (input, { user }) =>
    listFeed(prismaClient, user.id, input)
);

export const setAnnouncementEmailPreferenceAction = createAuthAction(
    announcementEmailPreferenceSchema,
    async ({ enabled }, { user }) => {
        await prismaClient.user.update({ data: { announcementEmails: enabled }, where: { id: user.id } });
        return { enabled };
    }
);

/** Switches off announcement emails using a signed email token, without requiring a session. */
export async function unsubscribeAnnouncementEmails(token: string | null | undefined): Promise<boolean> {
    return unsubscribeByToken(prismaClient, env.BETTER_AUTH_SECRET, token);
}
