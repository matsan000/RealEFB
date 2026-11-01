import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  use: { baseURL: 'http://127.0.0.1:5190', browserName: 'chromium' },
  webServer: {
    command: 'node tests/serve.mjs',
    url: 'http://127.0.0.1:5190',
    reuseExistingServer: false,
  },
});
