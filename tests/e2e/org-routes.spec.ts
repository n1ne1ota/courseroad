import { expect, test } from '@playwright/test';

test.describe('Org-Scoped Route Smoke Tests', () => {
    const orgRoutes = [
        '/org/nonexistent-slug/dashboard',
        '/org/nonexistent-slug/courses',
        '/org/nonexistent-slug/settings',
        '/org/nonexistent-slug/members'
    ];

    for (const route of orgRoutes) {
        test(`${route} without auth redirects to sign-in`, async ({ page }) => {
            await page.goto(route, { waitUntil: 'commit' });

            await expect(page).toHaveURL(/sign-in/, { timeout: 15_000 });
        });
    }
});
