import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock server-only to prevent import errors in test environment
vi.mock('server-only', () => ({}));

// Mock next/headers
const mockHeaders = vi.fn().mockResolvedValue(new Headers());
vi.mock('next/headers', () => ({
    headers: () => mockHeaders()
}));

// Mock next/navigation
const mockRedirect = vi.fn();
vi.mock('next/navigation', () => ({
    redirect: (url: string) => {
        mockRedirect(url);
        // redirect() in Next.js throws to halt execution
        throw new Error(`NEXT_REDIRECT:${url}`);
    }
}));

// Mock auth.api.getSession
const mockGetSession = vi.fn();
vi.mock('@/server/auth/auth', () => ({
    auth: {
        api: {
            getSession: (...args: unknown[]) => mockGetSession(...args)
        }
    }
}));

import { requireRole } from '@/server/auth/require-role';

describe('requireRole', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Given an unauthenticated user', () => {
        it('redirects to /sign-in when session is null', async () => {
            mockGetSession.mockResolvedValue(null);

            await expect(requireRole('admin')).rejects.toThrow('NEXT_REDIRECT:/sign-in');
            expect(mockRedirect).toHaveBeenCalledWith('/sign-in');
        });

        it('redirects to /sign-in when session.user is undefined', async () => {
            mockGetSession.mockResolvedValue({ user: undefined });

            await expect(requireRole('admin')).rejects.toThrow('NEXT_REDIRECT:/sign-in');
            expect(mockRedirect).toHaveBeenCalledWith('/sign-in');
        });
    });

    describe('Given an authenticated user with the wrong role', () => {
        it('redirects to the default redirect target', async () => {
            mockGetSession.mockResolvedValue({
                user: { id: 'user-1', role: 'learner' }
            });

            await expect(requireRole('admin')).rejects.toThrow('NEXT_REDIRECT');
            expect(mockRedirect).toHaveBeenCalledWith('/select-organization');
        });

        it('redirects to a custom redirectTo when provided', async () => {
            mockGetSession.mockResolvedValue({
                user: { id: 'user-1', role: 'learner' }
            });

            await expect(requireRole('admin', '/custom-redirect' as never)).rejects.toThrow(
                'NEXT_REDIRECT:/custom-redirect'
            );
            expect(mockRedirect).toHaveBeenCalledWith('/custom-redirect');
        });

        it('redirects when role is creator but guard requires admin', async () => {
            mockGetSession.mockResolvedValue({
                user: { id: 'user-1', role: 'creator' }
            });

            await expect(requireRole('admin')).rejects.toThrow('NEXT_REDIRECT');
            expect(mockRedirect).toHaveBeenCalledWith('/select-organization');
        });
    });

    describe('Given an authenticated user with the correct role', () => {
        it('returns the user object when roles match exactly', async () => {
            const mockUser = { id: 'user-1', role: 'admin' };
            mockGetSession.mockResolvedValue({ user: mockUser });

            const result = await requireRole('admin');
            expect(result).toEqual(mockUser);
            expect(mockRedirect).not.toHaveBeenCalled();
        });

        it('performs case-insensitive matching (uppercase guard)', async () => {
            const mockUser = { id: 'user-1', role: 'admin' };
            mockGetSession.mockResolvedValue({ user: mockUser });

            const result = await requireRole('ADMIN');
            expect(result).toEqual(mockUser);
            expect(mockRedirect).not.toHaveBeenCalled();
        });

        it('performs case-insensitive matching (mixed case guard)', async () => {
            const mockUser = { id: 'user-1', role: 'Creator' };
            mockGetSession.mockResolvedValue({ user: mockUser });

            const result = await requireRole('creator');
            expect(result).toEqual(mockUser);
            expect(mockRedirect).not.toHaveBeenCalled();
        });

        it('returns user for learner role', async () => {
            const mockUser = { id: 'user-1', role: 'learner' };
            mockGetSession.mockResolvedValue({ user: mockUser });

            const result = await requireRole('learner');
            expect(result).toEqual(mockUser);
            expect(mockRedirect).not.toHaveBeenCalled();
        });

        it('returns user for staff role', async () => {
            const mockUser = { id: 'user-1', role: 'staff' };
            mockGetSession.mockResolvedValue({ user: mockUser });

            const result = await requireRole('staff');
            expect(result).toEqual(mockUser);
            expect(mockRedirect).not.toHaveBeenCalled();
        });
    });

    describe('Given edge cases', () => {
        it('treats missing role field as empty string and redirects', async () => {
            mockGetSession.mockResolvedValue({
                user: { id: 'user-1' }
            });

            await expect(requireRole('admin')).rejects.toThrow('NEXT_REDIRECT');
            expect(mockRedirect).toHaveBeenCalledWith('/select-organization');
        });

        it('treats null role field as empty string and redirects', async () => {
            mockGetSession.mockResolvedValue({
                user: { id: 'user-1', role: null }
            });

            await expect(requireRole('admin')).rejects.toThrow('NEXT_REDIRECT');
            expect(mockRedirect).toHaveBeenCalledWith('/select-organization');
        });
    });
});
