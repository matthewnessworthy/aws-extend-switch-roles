import AxeBuilder from '@axe-core/playwright';
import { testInPopup, testInOptions } from './fixtures.js';

// A11Y-01 / A11Y-04: automated WCAG 2.1 AA scan of popup + options in both themes.
// Validates the Plan 01 ARIA-label/alt and contrast fixes landed with zero violations.

testInPopup('a11y: popup passes WCAG 2.1 AA in light theme',
  async () => {
    await chrome.storage.sync.clear();
  },
  async ({ page, expect }) => {
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  },
  async () => {
    await chrome.storage.sync.clear();
  }
);

testInPopup('a11y: popup passes WCAG 2.1 AA in dark theme',
  async () => {
    await chrome.storage.sync.clear();
  },
  async ({ page, expect }) => {
    // popup_init.js mocks chrome.storage (callback-style, returns {}), so the real
    // visualMode -> theme-init dark path can't be exercised in the popup fixture.
    // Apply data-theme directly to render the popup in dark for the WCAG scan; the
    // storage -> theme application path itself is covered by visual_mode.spec.js.
    await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
    const dataTheme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
    expect(dataTheme).toBe('dark');
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  },
  async () => {
    await chrome.storage.sync.clear();
  }
);

testInOptions('a11y: options page passes WCAG 2.1 AA in light theme',
  async () => {
    await chrome.storage.sync.clear();
  },
  async ({ page, expect }) => {
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  },
  async () => {
    await chrome.storage.sync.clear();
  }
);

testInOptions('a11y: options page passes WCAG 2.1 AA in dark theme',
  async () => {
    await chrome.storage.sync.clear();
  },
  async ({ page, expect }) => {
    await page.evaluate(() => chrome.storage.sync.set({ visualMode: 'dark' }));
    await page.waitForTimeout(300);
    const dataTheme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
    expect(dataTheme).toBe('dark');
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  },
  async () => {
    await chrome.storage.sync.clear();
  }
);
