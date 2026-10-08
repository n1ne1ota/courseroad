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
        defaultFrom: 'Courseroad <onboarding@resend.dev>'
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
