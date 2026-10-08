import { expect, test } from '@playwright/test';

import { PROTECTED_ORG_ROUTES, PROTECTED_PLATFORM_ROUTES } from './helpers/constants';

test.describe('Route Protection Smoke Tests', () => {
    test.describe('Platform routes redirect unauthenticated users', () => {
        for (const path of PROTECTED_PLATFORM_ROUTES) {
            test(`${path} redirects to /sign-in`, async ({ page }) => {
                await page.goto(path);

                await expect(page).toHaveURL(/sign-in/);
            });
        }
    });

    test.describe('Org-scoped routes redirect unauthenticated users', () => {
        for (const path of PROTECTED_ORG_ROUTES) {
            test(`${path} redirects to /sign-in`, async ({ page }) => {
                await page.goto(path);

                await expect(page).toHaveURL(/sign-in/);
            });
        }
    });
});
