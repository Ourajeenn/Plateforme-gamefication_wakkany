import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  testMatch: 'pwa-navigation.spec.js',
  fullyParallel: false,
  workers: 1,
  reporter: 'line',
  timeout: 30000,
  use: {
    ...devices['Desktop Chrome'],
    baseURL: 'http://localhost:4174',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npm run preview -- --host 0.0.0.0 --port 4174 --strictPort',
    url: 'http://localhost:4174',
    reuseExistingServer: true,
    timeout: 30000,
  },
});