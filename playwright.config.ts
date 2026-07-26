import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: 'e2e',
  timeout: 30_000,
  retries: process.env.CI ? 2 : 0,
  use: {
    viewport: { width: 430, height: 900 },
    hasTouch: true,
  },
  webServer: {
    command: 'pnpm --filter example-vue3 dev -- --port 5199 --strictPort',
    port: 5199,
    reuseExistingServer: !process.env.CI,
  },
})
