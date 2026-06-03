import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  // Retry transient failures in CI (e.g. msedge persistent-context launch
  // occasionally exceeds the 30s context-setup timeout under xvfb). Keep 0
  // retries locally so flakiness is visible during development.
  retries: process.env.CI ? 2 : 0,
  projects: [
    {
      name: 'chrome',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'Microsoft Edge',
      use: {
        ...devices['Desktop Edge'],
        channel: 'msedge'
      },
    },
  ],
});
