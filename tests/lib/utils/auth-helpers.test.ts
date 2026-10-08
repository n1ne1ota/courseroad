import { describe, expect, it } from 'vitest';

import { transformSessionUser } from '@/lib/utils/auth-helpers';

import type { BetterAuthSession } from '@/types/user.types';

describe('Auth Helpers', () => {
    describe('transformSessionUser', () => {
        it('maps all session fields to UserDropdownData', () => {
            const session: BetterAuthSession = {
                user: {
                    email: 'alice@example.com',
                    id: 'user-1',
                    image: 'https://example.com/avatar.jpg',
                    name: 'Alice'
                }
            };

            const result = transformSessionUser(session);

            expect(result).toEqual({
                email: 'alice@example.com',
                id: 'user-1',
                image: 'https://example.com/avatar.jpg',
                name: 'Alice'
            });
        });

        it('maps null image to null', () => {
            const session: BetterAuthSession = {
                user: {
                    email: 'bob@example.com',
                    id: 'user-2',
                    image: null,
                    name: 'Bob'
                }
            };

            expect(transformSessionUser(session).image).toBeNull();
        });

        it('maps undefined image to null via nullish coalescing', () => {
            const session: BetterAuthSession = {
                user: {
                    email: 'carol@example.com',
                    id: 'user-3',
                    image: undefined,
                    name: 'Carol'
                }
            };

            expect(transformSessionUser(session).image).toBeNull();
        });

        it('maps undefined name to undefined', () => {
            const session: BetterAuthSession = {
                user: {
                    email: 'dave@example.com',
                    id: 'user-4',
                    image: null
                }
            };

            expect(transformSessionUser(session).name).toBeUndefined();
        });
    });
});
