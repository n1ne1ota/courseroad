import { describe, expect, it } from 'vitest';

import { loginSchema, otpSchema, signupSchema } from '@/lib/auth/schemas';

describe('Auth Validation Schemas', () => {
    describe('signupSchema', () => {
        it('validates correct signup data', () => {
            const validData = {
                confirmPassword: 'Password123',
                email: 'test@example.com',
                firstName: 'John',
                lastName: 'Doe',
                password: 'Password123',
                username: 'testuser'
            };

            const result = signupSchema.safeParse(validData);

            expect(result.success).toBe(true);
        });

        it('fails with invalid email', () => {
            const invalidData = {
                confirmPassword: 'Password123',
                email: 'invalid-email',
                firstName: 'John',
                lastName: 'Doe',
                password: 'Password123',
                username: 'testuser'
            };

            const result = signupSchema.safeParse(invalidData);

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0]?.message).toBe('Invalid email address');
            }
        });

        it('fails with weak password', () => {
            const invalidData = {
                confirmPassword: 'weak',
                email: 'test@example.com',
                firstName: 'John',
                lastName: 'Doe',
                password: 'weak',
                username: 'testuser'
            };

            const result = signupSchema.safeParse(invalidData);

            expect(result.success).toBe(false);
        });

        it('fails when passwords do not match', () => {
            const invalidData = {
                confirmPassword: 'DifferentPassword123',
                email: 'test@example.com',
                firstName: 'John',
                lastName: 'Doe',
                password: 'Password123',
                username: 'testuser'
            };

            const result = signupSchema.safeParse(invalidData);

            expect(result.success).toBe(false);
            if (!result.success) {
                const passwordError = result.error.issues.find(issue => issue.path.includes('confirmPassword'));

                expect(passwordError?.message).toBe("Passwords don't match");
            }
        });

        it('fails with invalid username', () => {
            const invalidData = {
                confirmPassword: 'Password123',
                email: 'test@example.com',
                firstName: 'John',
                lastName: 'Doe',
                password: 'Password123',
                username: 'a'
            };

            const result = signupSchema.safeParse(invalidData);

            expect(result.success).toBe(false);
        });
    });

    describe('loginSchema', () => {
        it('validates correct login data', () => {
            const validData = {
                email: 'test@example.com',
                password: 'anypassword'
            };

            const result = loginSchema.safeParse(validData);

            expect(result.success).toBe(true);
        });

        it('fails with invalid email', () => {
            const invalidData = {
                email: 'invalid-email',
                password: 'password'
            };

            const result = loginSchema.safeParse(invalidData);

            expect(result.success).toBe(false);
        });

        it('fails with empty password', () => {
            const invalidData = {
                email: 'test@example.com',
                password: ''
            };

            const result = loginSchema.safeParse(invalidData);

            expect(result.success).toBe(false);
        });
    });

    describe('otpSchema', () => {
        it('validates correct OTP data', () => {
            const validData = {
                email: 'test@example.com',
                otp: '123456'
            };

            const result = otpSchema.safeParse(validData);

            expect(result.success).toBe(true);
        });

        it('fails with invalid OTP length', () => {
            const invalidData = {
                email: 'test@example.com',
                otp: '123'
            };

            const result = otpSchema.safeParse(invalidData);

            expect(result.success).toBe(false);
        });

        it('fails with non-numeric OTP', () => {
            const invalidData = {
                email: 'test@example.com',
                otp: 'abc123'
            };

            const result = otpSchema.safeParse(invalidData);

            expect(result.success).toBe(false);
        });
    });
});
