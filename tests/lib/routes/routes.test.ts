import { describe, expect, it } from 'vitest';

import { routes } from '@/lib/routes';
import { apiRoutes } from '@/lib/routes/api';
import { authPagePaths, authRoutes } from '@/lib/routes/auth';
import { protectedRoutes } from '@/lib/routes/protected';
import { publicPagePaths, publicRoutes } from '@/lib/routes/public';

describe('Route Registry', () => {
    describe('Given publicRoutes', () => {
        it('contains the home route', () => {
            expect(publicRoutes.home).toBe('/');
        });

        it('contains the pricing route', () => {
            expect(publicRoutes.pricing).toBe('/pricing');
        });

        it('contains the courses route', () => {
            expect(publicRoutes.courses).toBe('/courses');
        });

        it('contains the reset-password route', () => {
            expect(publicRoutes.resetPassword).toBe('/reset-password');
        });

        it('contains the new-password route', () => {
            expect(publicRoutes.newPassword).toBe('/new-password');
        });

        it('produces a publicPagePaths array matching its values', () => {
            const expected = Object.values(publicRoutes);
            expect(publicPagePaths).toEqual(expected);
        });
    });

    describe('Given authRoutes', () => {
        it('contains sign-in and sign-up', () => {
            expect(authRoutes.signIn).toBe('/sign-in');
            expect(authRoutes.signUp).toBe('/sign-up');
        });

        it('contains OTP route', () => {
            expect(authRoutes.otp).toBe('/otp');
        });

        it('produces an authPagePaths array matching its values', () => {
            const expected = Object.values(authRoutes);
            expect(authPagePaths).toEqual(expected);
        });
    });

    describe('Given protectedRoutes', () => {
        it('contains the select-organization route', () => {
            expect(protectedRoutes.selectOrganization).toBe('/select-organization');
        });

        it('contains the create-organization route', () => {
            expect(protectedRoutes.createOrganization).toBe('/create-organization');
        });

        it('contains the admin dashboard route', () => {
            expect(protectedRoutes.adminDashboard).toBe('/admin/dashboard');
        });
    });

    describe('Given apiRoutes', () => {
        it('contains the auth API base path', () => {
            expect(apiRoutes.auth).toBe('/api/auth');
        });
    });

    describe('Given the combined routes object', () => {
        it('merges all route registries', () => {
            // Public routes
            expect(routes.home).toBe('/');
            expect(routes.pricing).toBe('/pricing');

            // Auth routes
            expect(routes.signIn).toBe('/sign-in');
            expect(routes.signUp).toBe('/sign-up');

            // Protected routes
            expect(routes.adminDashboard).toBe('/admin/dashboard');

            // API routes
            expect(routes.auth).toBe('/api/auth');
        });
    });

    describe('Given route isolation', () => {
        it('has no path overlap between public and protected routes', () => {
            const publicPaths = new Set(Object.values(publicRoutes));
            const protectedPaths = Object.values(protectedRoutes);

            for (const protectedPath of protectedPaths) {
                expect(publicPaths.has(protectedPath as never)).toBe(false);
            }
        });

        it('has no path overlap between auth and protected routes', () => {
            const authPaths = new Set(Object.values(authRoutes));
            const protectedPaths = Object.values(protectedRoutes);

            for (const protectedPath of protectedPaths) {
                expect(authPaths.has(protectedPath as never)).toBe(false);
            }
        });

        it('ensures all protected routes start with a role prefix or are platform routes', () => {
            const allowedPrefixes = [
                '/select-organization',
                '/create-organization',
                '/setup',
                '/onboarding',
                '/admin',
                '/staff',
                '/learner',
                '/creator'
            ];
            const protectedPaths = Object.values(protectedRoutes);

            for (const path of protectedPaths) {
                const hasAllowedPrefix = allowedPrefixes.some(prefix => path.startsWith(prefix));
                expect(hasAllowedPrefix).toBe(true);
            }
        });
    });
});
