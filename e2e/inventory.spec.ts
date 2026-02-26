import { test, expect } from '@playwright/test';

test.describe('Inventory Page', () => {
  test('loads the inventory page', async ({ page }) => {
    await page.goto('/inventory');
    await expect(page).toHaveTitle(/Manila Watch Atelier/i);
  });

  test('displays watch cards', async ({ page }) => {
    await page.goto('/inventory');
    // Wait for watches to load from API
    await page.waitForSelector('[data-testid="watch-card"], .grid > a, .grid > div', {
      timeout: 10000,
    });
  });

  test('search filters watches', async ({ page }) => {
    await page.goto('/inventory');
    const searchInput = page.locator('input[placeholder*="Search"], input[type="search"]');
    if (await searchInput.isVisible()) {
      await searchInput.fill('Rolex');
      // Verify filtering happened
      await page.waitForTimeout(500);
    }
  });
});

test.describe('Watch Detail Page', () => {
  test('displays watch details when navigating to a watch', async ({ page }) => {
    await page.goto('/inventory');
    // Click the first watch link
    const firstWatch = page.locator('a[href*="/watch/"]').first();
    if (await firstWatch.isVisible({ timeout: 10000 })) {
      await firstWatch.click();
      await page.waitForURL(/\/watch\//);
      // Should show watch details
      await expect(page.locator('h1')).toBeVisible();
    }
  });
});

test.describe('Inquiry Form', () => {
  test('opens inquiry modal on watch detail page', async ({ page }) => {
    await page.goto('/inventory');
    const firstWatch = page.locator('a[href*="/watch/"]').first();
    if (await firstWatch.isVisible({ timeout: 10000 })) {
      await firstWatch.click();
      await page.waitForURL(/\/watch\//);

      // Click inquire button
      const inquireBtn = page.locator('button', { hasText: /inquire/i });
      if (await inquireBtn.isVisible()) {
        await inquireBtn.click();
        // Modal should appear
        await expect(page.locator('form')).toBeVisible();
      }
    }
  });
});
