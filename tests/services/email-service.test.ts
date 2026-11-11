import { http, HttpResponse } from 'msw';
import { server } from 'tests/mocks/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock server-only to prevent Node.js import errors in test environment
vi.mock('server-only', () => ({}));

// Mock the env module
vi.mock('@/server/config/env', () => ({
    env: { RESEND_API_KEY: 'test-resend-key' }
}));

// Mock the logger
vi.mock('@/server/logging/server', () => ({
    logs: {
        api: {
            error: vi.fn(),
            info: vi.fn()
        }
    }
}));

// Mock email templates
vi.mock('@/server/email/templates/otp-verification-email', () => ({
    OtpVerificationEmail: vi.fn(() => '<div>OTP Email</div>')
}));

vi.mock('@/server/email/templates/password-reset-email', () => ({
    PasswordResetEmail: vi.fn(() => '<div>Reset Email</div>')
}));

// MSW state
let lastRequestBody: any = null;
let mockResponse: { body?: any; networkError?: boolean; status?: number } = {
    body: { id: 'email-default' },
    status: 200
};

const corsHeaders = {
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Max-Age': '86400'
};

const { sendOtpVerificationEmail, sendPasswordResetEmail } = await import('@/server/email/email-service');

describe('Email Service', () => {
    beforeEach(() => {
        lastRequestBody = null;
        mockResponse = { body: { id: 'email-1' }, status: 200 };

        // Register MSW handlers before every test since afterEach resets them
        server.use(
            http.options('https://api.resend.com/emails', () => {
                return new HttpResponse(null, { headers: corsHeaders });
            }),
            http.post('https://api.resend.com/emails', async ({ request }) => {
                try {
                    lastRequestBody = await request.json();
                } catch {
                    // ignore
                }

                if (mockResponse.networkError) {
                    return HttpResponse.error();
                }

                return HttpResponse.json(mockResponse.body, {
                    headers: {
                        'Access-Control-Allow-Origin': '*'
                    },
                    status: mockResponse.status ?? 200
                });
            })
        );
    });

    describe('sendOtpVerificationEmail', () => {
        it('calls resend.emails.send with the correct parameters', async () => {
            await sendOtpVerificationEmail({
                email: 'user@example.com',
                otp: '123456'
            });

            expect(lastRequestBody).not.toBeNull();
            expect(lastRequestBody.to).toEqual(['user@example.com']);
            expect(lastRequestBody.subject).toBe('Verify Your Email - Courseroad');
            expect(lastRequestBody.from).toContain('Courseroad');
        });

        it('returns success with data on success', async () => {
            const result = await sendOtpVerificationEmail({
                email: 'user@example.com',
                otp: '123456'
            });

            expect(result.success).toBe(true);
            expect(result.data).toEqual({ id: 'email-1' });
        });

        it('throws when Resend returns an error', async () => {
            mockResponse = {
                body: { message: 'Rate limit exceeded', name: 'rate_limit_exceeded' },
                status: 400
            };

            await expect(sendOtpVerificationEmail({ email: 'user@example.com', otp: '123456' })).rejects.toThrow(
                'Failed to send email: Rate limit exceeded'
            );
        });

        it('throws when Resend throws an exception', async () => {
            mockResponse = { networkError: true };

            await expect(sendOtpVerificationEmail({ email: 'user@example.com', otp: '123456' })).rejects.toThrow(
                'Unable to fetch data'
            );
        });
    });

    describe('sendPasswordResetEmail', () => {
        it('calls resend.emails.send with the correct parameters', async () => {
            mockResponse = { body: { id: 'email-2' }, status: 200 };

            await sendPasswordResetEmail({
                email: 'user@example.com',
                resetUrl: 'https://example.com/reset/token-abc',
                userName: 'Alice'
            });

            expect(lastRequestBody).not.toBeNull();
            expect(lastRequestBody.to).toEqual(['user@example.com']);
            expect(lastRequestBody.subject).toBe('Reset Your Password - Courseroad');
        });

        it('returns success with data', async () => {
            mockResponse = { body: { id: 'email-2' }, status: 200 };

            const result = await sendPasswordResetEmail({
                email: 'user@example.com',
                resetUrl: 'https://example.com/reset'
            });

            expect(result.success).toBe(true);
        });

        it('throws when Resend returns an error', async () => {
            mockResponse = {
                body: { message: 'Invalid API key', name: 'invalid_api_key' },
                status: 400
            };

            await expect(
                sendPasswordResetEmail({
                    email: 'user@example.com',
                    resetUrl: 'https://example.com/reset'
                })
            ).rejects.toThrow('Failed to send email: Invalid API key');
        });
    });
});
