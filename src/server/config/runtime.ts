import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

import { emptyStringAsUndefined, parseJsonArray, parseStringList, env as publicEnv } from '@/lib/config/env';

const emailListSchema = z.preprocess(
    value => parseStringList(value),
    z
        .array(
            z
                .string()
                .trim()
                .min(1)
                .transform(value => value.toLowerCase())
        )
        .default([])
);

const devAccountsSchema = z.preprocess(
    value => {
        if (typeof value !== 'string') return [];

        return parseJsonArray<Array<{ email: string; password: string; role: string }>>(value, []);
    },
    z
        .array(
            z.object({
                email: z.email(),
                password: z.string().min(1),
                role: z
                    .string()
                    .trim()
                    .transform(value => value.toUpperCase())
                    .pipe(z.enum(['ADMIN', 'STAFF', 'CREATOR', 'LEARNER']))
            })
        )
        .default([])
);

/** Private configuration is evaluated exclusively on the server. */
export const env = createEnv({
    extends: [publicEnv],
    server: {
        // Role assignment emails (comma-separated lists)
        ADMIN_EMAILS: emailListSchema,
        CREATOR_EMAILS: emailListSchema,
        STAFF_EMAILS: emailListSchema,
        // Development-only hardcoded accounts for testing
        // Format: JSON array of {email, password, role}
        // Example: '[{"email":"admin@courseroad.dev","password":"devpassword123","role":"ADMIN"}]'
        DEV_ACCOUNTS: devAccountsSchema,
        // Postgres database
        DATABASE_URL: z.preprocess(emptyStringAsUndefined, z.string().trim().min(1)),
        DIRECT_URL: z.preprocess(emptyStringAsUndefined, z.string().trim().min(1).optional()),
        // Better Auth
        BETTER_AUTH_API_KEY: z.preprocess(emptyStringAsUndefined, z.string().trim().min(1).optional()),
        BETTER_AUTH_SECRET: z.preprocess(emptyStringAsUndefined, z.string().trim().min(1)),
        BETTER_AUTH_URL: z.preprocess(emptyStringAsUndefined, z.url().default('http://localhost:3000')),
        // GitHub OAuth
        GITHUB_CLIENT_ID: z.preprocess(emptyStringAsUndefined, z.string().trim().min(1)),
        GITHUB_CLIENT_SECRET: z.preprocess(emptyStringAsUndefined, z.string().trim().min(1)),
        // Google OAuth
        GOOGLE_CLIENT_ID: z.preprocess(emptyStringAsUndefined, z.string().trim().min(1)),
        GOOGLE_CLIENT_SECRET: z.preprocess(emptyStringAsUndefined, z.string().trim().min(1)),
        // Resend email service
        RESEND_API_KEY: z.preprocess(emptyStringAsUndefined, z.string().trim().min(1)),
        // Arcjet security service
        ARCJET_API_KEY: z.preprocess(emptyStringAsUndefined, z.string().trim().min(1)),
        // Bunny Stream
        BUNNY_STREAM_API_KEY: z.preprocess(emptyStringAsUndefined, z.string().trim().min(1)),
        BUNNY_STREAM_TOKEN_AUTH_KEY: z.preprocess(emptyStringAsUndefined, z.string().trim().min(1).optional()),
        BUNNY_STREAM_VIDEO_LIBRARY_ID: z.preprocess(emptyStringAsUndefined, z.string().trim().min(1)),
        BUNNY_WEBHOOK_SECRET: z.preprocess(emptyStringAsUndefined, z.string().trim().min(1).optional()),
        // Bunny Storage
        BUNNY_STORAGE_API_KEY: z.preprocess(emptyStringAsUndefined, z.string().trim().min(1)),
        BUNNY_STORAGE_HOSTNAME: z.preprocess(emptyStringAsUndefined, z.string().trim().min(1)),
        BUNNY_STORAGE_ZONE_NAME: z.preprocess(emptyStringAsUndefined, z.string().trim().min(1)),
        // Structured logging
        LOG_LEVEL: z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal']).default('info'),
        // Stripe
        STRIPE_ACTIVATION_PRICE_ID: z.preprocess(emptyStringAsUndefined, z.string().trim().min(1)),
        STRIPE_SECRET_KEY: z.preprocess(emptyStringAsUndefined, z.string().trim().min(1)),
        STRIPE_WEBHOOK_SECRET: z.preprocess(emptyStringAsUndefined, z.string().trim().min(1))
    },
    runtimeEnv: {
        ADMIN_EMAILS: process.env.ADMIN_EMAILS?.trim() || undefined,
        ARCJET_API_KEY: process.env.ARCJET_API_KEY?.trim() || undefined,
        BETTER_AUTH_API_KEY: process.env.BETTER_AUTH_API_KEY?.trim() || undefined,
        BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET?.trim() || undefined,
        BETTER_AUTH_URL: process.env.BETTER_AUTH_URL?.trim() || 'http://localhost:3000',
        BUNNY_STORAGE_API_KEY: process.env.BUNNY_STORAGE_API_KEY?.trim() || undefined,
        BUNNY_STORAGE_HOSTNAME: process.env.BUNNY_STORAGE_HOSTNAME?.trim() || undefined,
        BUNNY_STORAGE_ZONE_NAME: process.env.BUNNY_STORAGE_ZONE_NAME?.trim() || undefined,
        BUNNY_STREAM_API_KEY: process.env.BUNNY_STREAM_API_KEY?.trim() || undefined,
        BUNNY_STREAM_TOKEN_AUTH_KEY: process.env.BUNNY_STREAM_TOKEN_AUTH_KEY?.trim() || undefined,
        BUNNY_STREAM_VIDEO_LIBRARY_ID: process.env.BUNNY_STREAM_VIDEO_LIBRARY_ID?.trim() || undefined,
        BUNNY_WEBHOOK_SECRET: process.env.BUNNY_WEBHOOK_SECRET?.trim() || undefined,
        CREATOR_EMAILS: process.env.CREATOR_EMAILS?.trim() || process.env.TEACHER_EMAILS?.trim() || undefined,
        DATABASE_URL: process.env.DATABASE_URL?.trim() || undefined,
        DEV_ACCOUNTS: process.env.DEV_ACCOUNTS?.trim() || undefined,
        DIRECT_URL: process.env.DIRECT_URL?.trim() || undefined,
        GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID?.trim() || undefined,
        GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET?.trim() || undefined,
        GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID?.trim() || undefined,
        GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET?.trim() || undefined,
        LOG_LEVEL: process.env.LOG_LEVEL?.trim() || undefined,
        RESEND_API_KEY: process.env.RESEND_API_KEY?.trim() || undefined,
        STAFF_EMAILS: process.env.STAFF_EMAILS?.trim() || undefined,
        STRIPE_ACTIVATION_PRICE_ID: process.env.STRIPE_ACTIVATION_PRICE_ID?.trim() || undefined,
        STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY?.trim() || undefined,
        STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET?.trim() || undefined
    }
});
