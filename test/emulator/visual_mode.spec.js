import { testInOptions } from './fixtures.js';

// THM-02: visual mode radio write-through to chrome.storage.sync

testInOptions('visual mode: light radio writes chrome.storage.sync visualMode key',
  async () => {
    await chrome.storage.sync.clear();
  },
  async ({ page, expect }) => {
    await page.locator('#lightVisualRadioButton').check();
  },
  async () => {
    const data = await chrome.storage.sync.get(['visualMode']);
    self.assertTrue(data.visualMode === 'light');
    await chrome.storage.sync.clear();
  }
);

// THM-02: default radio removes data-theme attribute (not sets to 'default')

testInOptions('visual mode: default radio removes data-theme attribute',
  async () => {
    await chrome.storage.sync.set({ visualMode: 'dark' });
  },
  async ({ page, expect }) => {
    expect(await page.locator('#darkVisualRadioButton').isChecked()).toBeTruthy();
    await page.locator('#defaultVisualRadioButton').check();
    const dataTheme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
    expect(dataTheme).toBeNull();
    const lsValue = await page.evaluate(() => localStorage.getItem('visualMode'));
    expect(lsValue).toBe('default');
  },
  async () => {
    await chrome.storage.sync.clear();
  }
);

// THM-02: dark radio applies data-theme immediately without reload

testInOptions('visual mode: dark radio sets data-theme immediately without reload',
  async () => {
    await chrome.storage.sync.clear();
  },
  async ({ page, expect }) => {
    await page.locator('#darkVisualRadioButton').check();
    const dataTheme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
    expect(dataTheme).toBe('dark');
    const lsValue = await page.evaluate(() => localStorage.getItem('visualMode'));
    expect(lsValue).toBe('dark');
  },
  async () => {
    await chrome.storage.sync.clear();
  }
);

// THM-04: storage.onChanged live-updates data-theme on already-open page

testInOptions('visual mode: storage.onChanged live-updates data-theme on already-open page',
  async () => {
    await chrome.storage.sync.clear();
  },
  async ({ page, expect }) => {
    await page.evaluate(() => chrome.storage.sync.set({ visualMode: 'dark' }));
    await page.waitForTimeout(300);
    const dataTheme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
    expect(dataTheme).toBe('dark');
  },
  async () => {
    await chrome.storage.sync.clear();
  }
);
