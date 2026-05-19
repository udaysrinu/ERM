import { test, expect } from '@playwright/test';

test('login → questionnaire → dashboard happy path', async ({ page }) => {
  await page.goto('http://127.0.0.1:5173/');
  await page.fill('input[type=email]', 'test@gmail.com');
  await page.fill('input[type=password]', 'demo');
  await page.click('button:has-text("Enter the navigator")');

  // scope screen
  await expect(page.getByText('operating unit')).toBeVisible({ timeout: 10000 });

  // pick first BU
  await page.click('button:has-text("Generation")');

  // questionnaire — answer all 100 by clicking score "3" repeatedly
  for (let i = 0; i < 100; i++) {
    await page.locator('button:has(span.display-num:text("3"))').first().click();
    await page.waitForTimeout(120);
  }

  // summary should appear
  await expect(page.getByText('All vectors captured')).toBeVisible({ timeout: 5000 });
  await page.click('button:has-text("Compute & finalize")');

  // dashboard
  await expect(page.getByText('Maturity score')).toBeVisible({ timeout: 30000 });
});
