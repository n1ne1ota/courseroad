import { expect, test } from '@playwright/test';

import { PUBLIC_ROUTES } from './helpers/constants';

test.describe('Public Pages Smoke Tests', () => {
    for (const route of PUBLIC_ROUTES) {
        test(`${route} loads successfully`, async ({ page }) => {
            const response = await page.goto(route);

            expect(response?.status()).toBe(200);
            await expect(page.locator('main').first()).toBeVisible();
        });
    }

    test('landing page renders the hero section', async ({ page }) => {
        await page.goto('/');

        await expect(page).toHaveTitle(/courseroad/i);
        await expect(page.locator('main').first()).toBeVisible();
    });

    test('nonexistent route returns 404', async ({ page }) => {
        const response = await page.goto('/this-page-does-not-exist-abc123');

        expect(response?.status()).toBe(404);
    });
});
