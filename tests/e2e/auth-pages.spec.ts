import { expect, test } from '@playwright/test';

test.describe('Auth Pages Smoke Tests', () => {
    test('sign-in page loads and shows the sign-in heading', async ({ page }) => {
        await page.goto('/sign-in');

        await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
    });

    test('sign-in page shows email form after clicking continue with email', async ({ page }) => {
        await page.goto('/sign-in');

        // The sign-in page starts with OAuth buttons, click "Continue with Email"
        await page.getByRole('button', { name: /continue with email/i }).click();

        // Email and password fields should now be visible
        await expect(page.locator('[name="email"]')).toBeVisible();
        await expect(page.locator('[name="password"]')).toBeVisible();
    });

    test('sign-up page loads and shows the sign-up heading', async ({ page }) => {
        await page.goto('/sign-up');

        await expect(page.getByRole('heading', { name: /sign up/i })).toBeVisible();
    });

    test('reset-password page loads', async ({ page }) => {
        await page.goto('/reset-password');

        await expect(page.locator('main').first()).toBeVisible();
    });

    test('new-password page loads', async ({ page }) => {
        await page.goto('/new-password');

        await expect(page.locator('main').first()).toBeVisible();
    });
});
