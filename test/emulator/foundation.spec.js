import { testInPreview } from './fixtures.js';

// SC1: token value differs between light and dark (FND-01)
// This test starts RED until Wave 1 delivers src/css/tokens.css.
testInPreview('SC1: token computed-style differs between light and dark', async ({ page, expect }) => {
  await page.locator('#btn-dark').click();
  const darkBg = await page.locator('#token-probe').evaluate(el => getComputedStyle(el).backgroundColor);

  await page.locator('#btn-light').click();
  const lightBg = await page.locator('#token-probe').evaluate(el => getComputedStyle(el).backgroundColor);

  expect(darkBg).not.toBe(lightBg);
});

// SC2: component shells visible in both themes (FND-01)
testInPreview('SC2: component shells visible in both themes', async ({ page, expect }) => {
  await page.locator('#btn-light').click();
  expect(await page.locator('.aesr-btn.aesr-btn--primary').isVisible()).toBe(true);
  expect(await page.locator('.aesr-pane').isVisible()).toBe(true);

  await page.locator('#btn-dark').click();
  expect(await page.locator('.aesr-btn.aesr-btn--primary').isVisible()).toBe(true);
  expect(await page.locator('.aesr-state-empty').isVisible()).toBe(true);
});

// SC3-CSP: zero CSP console violations on load (THM-03)
testInPreview('SC3-CSP: zero CSP console violations on load', async ({ page, expect }) => {
  const violations = [];
  page.on('console', msg => {
    if (msg.type() === 'error' && msg.text().includes('Content Security Policy')) {
      violations.push(msg.text());
    }
  });
  await page.reload();
  await page.waitForLoadState('load');
  expect(violations.length).toBe(0);
});

// SC3-FOUC: data-theme present on <html> before paint when visualMode is stored (THM-03)
testInPreview('SC3-FOUC: data-theme present on <html> before paint when visualMode is stored', async ({ page, expect }) => {
  await page.evaluate(() => localStorage.setItem('visualMode', 'dark'));
  await page.reload();
  await page.waitForLoadState('load');
  const theme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
  expect(theme).toBe('dark');
  await page.evaluate(() => localStorage.removeItem('visualMode'));
});

// THM-05: color-scheme matches active theme on :root (THM-05)
testInPreview('THM-05: color-scheme matches active theme on :root', async ({ page, expect }) => {
  await page.locator('#btn-light').click();
  const lightScheme = await page.evaluate(() => getComputedStyle(document.documentElement).colorScheme);
  expect(lightScheme).toMatch(/light/);

  await page.locator('#btn-dark').click();
  const darkScheme = await page.evaluate(() => getComputedStyle(document.documentElement).colorScheme);
  expect(darkScheme).toMatch(/dark/);
});
