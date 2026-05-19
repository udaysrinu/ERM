import { defineConfig } from '@playwright/test';

const baseURL = process.env.E2E_BASE_URL || 'http://127.0.0.1:5173';

export default defineConfig({
  testDir: 'tests',
  testMatch: /.*\.spec\.ts/,
  use: { baseURL },
  // When E2E_BASE_URL is set (e.g. CI hitting a live preview deploy), do not
  // start a local dev server — just point at the URL. For local runs without
  // the env var, boot vite via `npm run dev`.
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: 'npm run dev',
        url: 'http://127.0.0.1:5173',
        reuseExistingServer: true,
        timeout: 60000,
      },
});
