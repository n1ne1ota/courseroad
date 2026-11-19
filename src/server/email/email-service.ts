import 'server-only';

import { env } from '@/server/config/env';
import { createMailService } from '@/server/email/service';
import { logs } from '@/server/logging/server';

/**
 * Email Service - Infrastructure Layer
 *
 * Creates a mail service instance configured with app-specific env and logging.
 * Email templates and the Resend integration live alongside this configuration.
 */
const mail = createMailService(
    {
        apiKey: env.RESEND_API_KEY,
        appUrl: env.NEXT_PUBLIC_APP_URL,
        defaultFrom: env.RESEND_FROM_EMAIL
    },
    {
        error: (message, error) => logs.api.error(message, error),
        info: (message, meta) => logs.api.info(message, meta)
    }
);

/** Send OTP Verification Email */
export const sendOtpVerificationEmail = mail.sendOtpVerification;

/** Send Password Reset Email */
export const sendPasswordResetEmail = mail.sendPasswordReset;

/** Send Magic Link Email */
export const sendMagicLinkEmail = mail.sendMagicLink;

/** Submit an organization invitation; provider failures propagate to the caller. */
export const sendOrganizationInvitationEmail = mail.sendOrganizationInvitation;

/** Submit up to 100 individually addressed emails in one request. */
export const sendEmailBatch = mail.sendBatch;
