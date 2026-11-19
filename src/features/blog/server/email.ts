import 'server-only';

import { env } from '@/server/config/env';
import { env as runtimeEnv } from '@/server/config/runtime';
import { prismaClient } from '@/server/db/client';
import { sendEmailBatch } from '@/server/email/email-service';
import { log } from '@/server/logging/server';

import { deliverAnnouncement } from './delivery';

import type { EmailRecipient } from './db/audience';

/** Delivers an announcement with the application's mail service, database and secret. Never throws. */
export async function deliverAnnouncementEmail(announcementId: string, recipients: readonly EmailRecipient[]) {
    try {
        return await deliverAnnouncement(
            {
                appUrl: env.NEXT_PUBLIC_APP_URL,
                db: prismaClient,
                log,
                secret: runtimeEnv.BETTER_AUTH_SECRET,
                sendBatch: sendEmailBatch
            },
            announcementId,
            recipients
        );
    } catch (error) {
        log.error('Announcement email delivery failed', error);
        return { status: 'skipped' as const };
    }
}
