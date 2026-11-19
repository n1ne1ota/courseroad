import { describe, expect, it } from 'vitest';

import { isNavLinkActive } from './nav-links';

describe('isNavLinkActive', () => {
    it('matches the exact path', () => {
        expect(isNavLinkActive('/pricing', '/pricing')).toBe(true);
    });

    it('matches child paths by whole segment', () => {
        expect(isNavLinkActive('/courses/abc', '/courses')).toBe(true);
        expect(isNavLinkActive('/blogging', '/blog')).toBe(false);
    });

    it('does not match unrelated or missing paths', () => {
        expect(isNavLinkActive('/about', '/pricing')).toBe(false);
        expect(isNavLinkActive(null, '/pricing')).toBe(false);
    });

    it('never treats the root as an ancestor of every page', () => {
        expect(isNavLinkActive('/pricing', '/')).toBe(false);
        expect(isNavLinkActive('/', '/')).toBe(true);
    });
});
