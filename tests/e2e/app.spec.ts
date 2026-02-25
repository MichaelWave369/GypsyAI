import { expect, test } from '@playwright/test';
import path from 'node:path';

test.beforeEach(async ({ context }) => {
  await context.addInitScript(() => {
    localStorage.setItem('gypsy-onboarded', '1');
  });
});

test('Landing -> Tarot flow', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('home-cta-tarot').click();
  await page.getByLabel('tarot-question', { exact: true }).fill('How can I focus this week?');
  await page.getByLabel('tarot-spread', { exact: true }).selectOption('three-card');
  await page.getByTestId('tarot-generate').click();
  await expect(page.getByText('Drawn Cards')).toBeVisible();
  await expect(page.locator('li').filter({ hasText: /Past:|Present:|Future:/ })).toHaveCount(3);
  await expect(page.getByTestId('tarot-reading')).toContainText('Opening');
  const dl = page.waitForEvent('download');
  await page.getByTestId('tarot-save').click();
  await page.getByText('MD').first().click();
  const d = await dl;
  expect(d.suggestedFilename()).toContain('.md');
});

test('Landing -> Astrology flow', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('home-cta-astrology').click();
  await page.getByLabel('astro-name', { exact: true }).fill('Test User');
  await page.getByLabel('astro-date', { exact: true }).fill('1990-01-01');
  await page.getByLabel('astro-time', { exact: true }).fill('12:00');
  await page.getByLabel('astro-place', { exact: true }).fill('');
  await page.getByLabel('astro-lat', { exact: true }).fill('40.7128');
  await page.getByLabel('astro-lon', { exact: true }).fill('-74.0060');
  await page.getByLabel('astro-timezone', { exact: true }).fill('America/New_York');
  await page.getByTestId('astro-generate').click();
  await expect(page.getByText('Planets')).toBeVisible();
  await expect(page.locator('svg')).toBeVisible();
  await page.getByTestId('astro-save-profile').click();
  const dl = page.waitForEvent('download');
  await page.getByTestId('astro-export-json').click();
  expect((await dl).suggestedFilename()).toContain('.json');
});

test('Gene Keys flow', async ({ page }) => {
  await page.goto('/genekeys');
  await page.getByLabel('gk-date', { exact: true }).fill('1991-06-21');
  await page.getByLabel('gk-time', { exact: true }).fill('10:10');
  await page.getByTestId('gk-generate').click();
  await expect(page.getByTestId('gk-reading')).toContainText('Activation Sequence overview');
  await page.getByTestId('gk-save').click();
  const popup = page.waitForEvent('popup');
  await page.getByTestId('gk-print').click();
  await popup;
});

test('Ancestry flow', async ({ page }) => {
  await page.goto('/ancestry/import');
  const filePath = path.resolve('tests/fixtures/sample.ged');
  await page.getByLabel('gedcom-file', { exact: true }).setInputFiles(filePath);
  await expect(page.getByText('Imported people: 6')).toBeVisible();
  await page.goto('/ancestry/people');
  await expect(page.getByText('Private Person').first()).toBeVisible();
  await page.goto('/ancestry/tree');
  await expect(page.locator('svg')).toBeVisible();
  await page.goto('/ancestry/read');
  await expect(page.getByTestId('ancestry-reading')).toContainText('Ancestral Pattern Reading');
  await expect(page.getByTestId('ancestry-sources')).toContainText('Ancestry patterns (derived)');
});

test('Assistant flow', async ({ page }) => {
  await page.goto('/assistant');
  await page.getByPlaceholder('Chat freely or ask for a reading...').fill('Hello, how are you?');
  await page.getByRole('button', { name: 'Send' }).click();
  await expect(page.getByText(/Demo assistant|Demo/).first()).toBeVisible();
  await page.getByPlaceholder('Chat freely or ask for a reading...').fill('Do a tarot reading about my next week');
  await page.getByRole('button', { name: 'Send' }).click();
  await expect(page.getByText('Spread overview')).toBeVisible();
});
