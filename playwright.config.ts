import { defineConfig, devices } from '@playwright/test';

const port = Number(process.env.PLAYWRIGHT_PORT || 4173);

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: false,
  reporter: 'list',
  use: {
    baseURL: `http://127.0.0.1:${port}`,
    trace: 'on-first-retry',
    headless: true
  },
  webServer: {
    command: `PORT=${port} TEST_MODE=1 NEXT_PUBLIC_TEST_MODE=1 pnpm start`,
    url: `http://127.0.0.1:${port}`,
    reuseExistingServer: false,
    timeout: 120000
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }]
});
