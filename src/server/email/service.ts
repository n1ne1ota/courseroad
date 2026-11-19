import 'server-only';

import type { ReactElement } from 'react';

import { Resend } from 'resend';

import { MagicLinkEmail } from '@/server/email/templates/magic-link-email';
import {
    OrganizationInvitationEmail,
    type OrganizationInvitationEmailProps
} from '@/server/email/templates/organization-invitation-email';
import { OtpVerificationEmail } from '@/server/email/templates/otp-verification-email';
import { PasswordResetEmail } from '@/server/email/templates/password-reset-email';

/**
 * Mail service configuration options.
 * The API key and sender address are injected at initialization,
 * keeping this module decoupled from any specific env configuration.
 */
export interface MailConfig {
    /** Configured application URL used to construct invitation links. */
    appUrl: string;
    /** Resend API key */
    apiKey: string;
    /** Default "from" address (e.g., 'Courseroad <onboarding@resend.dev>') */
    defaultFrom: string;
}

/** One message of a batch. Every recipient gets their own email, so one address is never exposed to another. */
export interface BatchEmail {
    headers?: Record<string, string>;
    react: ReactElement;
    subject: string;
    to: string;
}

export type OrganizationInvitationEmailInput = Omit<OrganizationInvitationEmailProps, 'invitationUrl'> & {
    invitationId: string;
};

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
 *     appUrl: env.NEXT_PUBLIC_APP_URL,
 *     defaultFrom: 'Courseroad <onboarding@resend.dev>'
 * });
 *
 * await mail.sendOtpVerification({ email: 'user@example.com', otp: '123456' });
 * ```
 */
export function createMailService(config: MailConfig, logger: MailLogger = noopLogger) {
    const resend = new Resend(config.apiKey);

    async function sendEmail(params: { to: string; subject: string; react: ReactElement; redactErrors?: boolean }) {
        const { data, error } = await resend.emails.send({
            from: config.defaultFrom,
            react: params.react,
            subject: params.subject,
            to: [params.to]
        });

        if (error || !data?.id) {
            logger.error(
                `Failed to send email: ${params.subject}`,
                params.redactErrors ? { name: error?.name ?? 'missing_response' } : error
            );
            throw new Error(
                params.redactErrors
                    ? 'The invitation email could not be submitted.'
                    : `Failed to send email: ${error?.message ?? 'Missing provider response'}`
            );
        }

        logger.info(`Email sent: ${params.subject}`, { data });
        return { data, success: true as const };
    }

    return {
        /**
         * Submit up to 100 emails in one request, each addressed to one recipient. The idempotency key makes a retried
         * request safe: Resend returns the first result instead of sending the batch twice.
         */
        async sendBatch(emails: readonly BatchEmail[], options: { idempotencyKey: string }) {
            const { data, error } = await resend.batch.send(
                emails.map(email => ({
                    from: config.defaultFrom,
                    react: email.react,
                    subject: email.subject,
                    to: [email.to],
                    ...(email.headers ? { headers: email.headers } : {})
                })),
                { idempotencyKey: options.idempotencyKey }
            );

            if (error || !data) {
                logger.error('Failed to send email batch', { name: error?.name ?? 'missing_response' });
                throw new Error(`Failed to send email batch: ${error?.message ?? 'Missing provider response'}`);
            }

            logger.info('Email batch sent', { count: data.data.length });
            return { ids: data.data.map(item => item.id) };
        },
        /** Submit a membership invitation using server-generated invitation data. */
        async sendOrganizationInvitation({ invitationId, ...params }: OrganizationInvitationEmailInput) {
            const invitationUrl = new URL(
                `/accept-invitation/${encodeURIComponent(invitationId)}`,
                config.appUrl
            ).toString();
            return sendEmail({
                react: OrganizationInvitationEmail({ ...params, invitationUrl }),
                subject: `Invitation to join ${params.organizationName} - Courseroad`,
                to: params.email,
                redactErrors: true
            });
        },
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
export { MagicLinkEmail, OrganizationInvitationEmail, OtpVerificationEmail, PasswordResetEmail };
