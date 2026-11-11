import 'server-only';

import type { ReactElement } from 'react';

import { Resend } from 'resend';

import { MagicLinkEmail } from '@/server/email/templates/magic-link-email';
import { OtpVerificationEmail } from '@/server/email/templates/otp-verification-email';
import { PasswordResetEmail } from '@/server/email/templates/password-reset-email';

/**
 * Mail service configuration options.
 * The API key and sender address are injected at initialization,
 * keeping this module decoupled from any specific env configuration.
 */
export interface MailConfig {
    /** Resend API key */
    apiKey: string;
    /** Default "from" address (e.g., 'Courseroad <onboarding@resend.dev>') */
    defaultFrom: string;
}

/**
 * Logger interface for injectable logging.
 * Accepts any object with `info` and `error` methods.
 */
interface MailLogger {
    error: (message: string, error?: unknown) => void;
    info: (message: string, meta?: Record<string, unknown>) => void;
}

/** Noop logger used when no logger is injected */
const noopLogger: MailLogger = {
    info: () => {},
    error: () => {}
};

/**
 * Creates a configured mail service instance.
 *
 * @example
 * ```ts
 * const mail = createMailService({
 *     apiKey: env.RESEND_API_KEY,
 *     defaultFrom: 'Courseroad <onboarding@resend.dev>'
 * });
 *
 * await mail.sendOtpVerification({ email: 'user@example.com', otp: '123456' });
 * ```
 */
export function createMailService(config: MailConfig, logger: MailLogger = noopLogger) {
    const resend = new Resend(config.apiKey);

    async function sendEmail(params: { to: string; subject: string; react: ReactElement }) {
        const { data, error } = await resend.emails.send({
            from: config.defaultFrom,
            react: params.react,
            subject: params.subject,
            to: [params.to]
        });

        if (error) {
            logger.error(`Failed to send email: ${params.subject}`, error);
            throw new Error(`Failed to send email: ${error.message}`);
        }

        logger.info(`Email sent: ${params.subject}`, { data });
        return { data, success: true as const };
    }

    return {
        /**
         * Send OTP verification email.
         * Called by Better Auth server configuration.
         */
        async sendOtpVerification(params: { email: string; otp: string }) {
            return sendEmail({
                react: OtpVerificationEmail(params),
                subject: 'Verify Your Email - Courseroad',
                to: params.email
            });
        },

        /**
         * Send password reset email.
         */
        async sendPasswordReset(params: { email: string; resetUrl: string; userName?: string }) {
            return sendEmail({
                react: PasswordResetEmail(params),
                subject: 'Reset Your Password - Courseroad',
                to: params.email
            });
        },

        /**
         * Send magic link sign-in email.
         */
        async sendMagicLink(params: { email: string; url: string }) {
            return sendEmail({
                react: MagicLinkEmail(params),
                subject: 'Sign In to Courseroad',
                to: params.email
            });
        }
    };
}

/** Mail service instance type */
export type MailService = ReturnType<typeof createMailService>;

/** Re-export templates for direct use */
export { MagicLinkEmail, OtpVerificationEmail, PasswordResetEmail };
