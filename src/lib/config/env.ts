import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const emptyStringAsUndefined = (value: unknown) => {
    if (typeof value !== 'string') return value;
    return value.trim() === '' ? undefined : value;
};

export const parseStringList = (value: unknown) => {
    if (typeof value !== 'string') return [];

    const normalized = value.trim();
    if (!normalized) return [];

    return normalized
        .split(',')
        .map(item => item.trim().toLowerCase())
        .filter(Boolean);
};

export const parseJsonArray = <T>(value: unknown, fallback: T): T => {
    if (typeof value !== 'string') return fallback;

    const normalized = value.trim();
    if (!normalized) return fallback;

    try {
        const parsed = JSON.parse(normalized);
        return Array.isArray(parsed) ? (parsed as T) : fallback;
    } catch {
        console.warn('Invalid JSON config value ignored; using fallback instead.');
        return fallback;
    }
};

/** Validated public configuration safe to import from browser modules. */
export const env = createEnv({
    client: {
        NEXT_PUBLIC_APP_URL: z.preprocess(emptyStringAsUndefined, z.url().default('http://localhost:3000')),
        NEXT_PUBLIC_BUNNY_CDN_HOSTNAME: z.preprocess(emptyStringAsUndefined, z.string().trim().min(1).optional()),
        NEXT_PUBLIC_BUNNY_STORAGE_CDN: z.preprocess(emptyStringAsUndefined, z.string().trim().min(1).optional()),
        NEXT_PUBLIC_BUNNY_STREAM_LIBRARY_ID: z.preprocess(emptyStringAsUndefined, z.string().trim().min(1).optional()),
        NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.preprocess(emptyStringAsUndefined, z.string().trim().min(1).optional())
    },
    runtimeEnv: {
        NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL?.trim() || 'http://localhost:3000',
        NEXT_PUBLIC_BUNNY_CDN_HOSTNAME: process.env.NEXT_PUBLIC_BUNNY_CDN_HOSTNAME?.trim() || undefined,
        NEXT_PUBLIC_BUNNY_STORAGE_CDN: process.env.NEXT_PUBLIC_BUNNY_STORAGE_CDN?.trim() || undefined,
        NEXT_PUBLIC_BUNNY_STREAM_LIBRARY_ID: process.env.NEXT_PUBLIC_BUNNY_STREAM_LIBRARY_ID?.trim() || undefined,
        NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim() || undefined
    }
});
