import '@testing-library/jest-dom/vitest';

import { cleanup } from '@testing-library/react';
import { server } from 'tests/mocks/server';
import { afterAll, afterEach, beforeAll, expect, vi } from 'vitest';
import * as axeMatchers from 'vitest-axe/matchers';
expect.extend(axeMatchers);

// Unit tests run outside Next.js; retain the production server-only imports.
vi.mock('server-only', () => ({}));

// Mock process.env variables checked directly by libraries
process.env.DATABASE_URL = 'postgresql://localhost:5432/test';

// Mock environment variables to bypass validation in tests
vi.mock('@/server/config/env', () => ({
    env: {
        ADMIN_EMAILS: [],
        ARCJET_API_KEY: 'ajkey_test',
        BETTER_AUTH_SECRET: 'test-secret-12345678901234567890123456789012',
        BETTER_AUTH_URL: 'http://localhost:3000',
        BUNNY_STORAGE_API_KEY: 'bunny_storage_key',
        BUNNY_STORAGE_HOSTNAME: 'storage.bunny.net',
        BUNNY_STORAGE_ZONE_NAME: 'test-zone',
        BUNNY_STREAM_API_KEY: 'bunny_stream_key',
        BUNNY_STREAM_VIDEO_LIBRARY_ID: '12345',
        CREATOR_EMAILS: [],
        DATABASE_URL: 'postgresql://localhost:5432/test',
        DEV_ACCOUNTS: [],
        GITHUB_CLIENT_ID: 'github-id',
        GITHUB_CLIENT_SECRET: 'github-secret',
        GOOGLE_CLIENT_ID: 'google-id',
        GOOGLE_CLIENT_SECRET: 'google-secret',
        NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
        NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: 'pk_test_123',
        RESEND_API_KEY: 're_test',
        STAFF_EMAILS: [],
        STRIPE_ACTIVATION_PRICE_ID: 'price_123',
        STRIPE_SECRET_KEY: 'sk_test_123',
        STRIPE_WEBHOOK_SECRET: 'whsec_123'
    }
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
    redirect: (url: string) => {
        const error = new Error(`NEXT_REDIRECT:${url}`);
        (error as Error & { digest: string }).digest = `NEXT_REDIRECT;307;${url};`;
        throw error;
    },
    usePathname: () => '/',
    useRouter: () => ({
        back: vi.fn(),
        forward: vi.fn(),
        push: vi.fn(),
        refresh: vi.fn()
    }),
    useSearchParams: () => new URLSearchParams()
}));

// Mock redirect error utility to handle mocked redirects in safe actions
vi.mock('next/dist/client/components/redirect-error', () => ({
    isRedirectError: (error: unknown) => {
        return (
            error instanceof Error &&
            (error.message.startsWith('NEXT_REDIRECT') ||
                (error as Error & { digest?: string }).digest?.startsWith('NEXT_REDIRECT'))
        );
    }
}));

// Setup MSW
beforeAll(() => server.listen());
afterEach(() => {
    cleanup();
    server.resetHandlers();
});
afterAll(() => server.close());
