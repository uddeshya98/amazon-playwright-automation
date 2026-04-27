// @ts-check
const { defineConfig, devices } = require('@playwright/test');
require('dotenv').config();

/**
 * Playwright Configuration
 * Docs: https://playwright.dev/docs/test-configuration
 *
 * KEY FIX: Uses system-installed Chrome (channel: 'chrome') instead of
 * Playwright's bundled Chromium. The real Chrome binary has genuine browser
 * fingerprints that Amazon's bot detection cannot distinguish from a real user.
 *
 * Tests run sequentially (1 worker) to avoid rate-limiting.
 */
module.exports = defineConfig({
  // Directory where test files are located
  testDir: './tests',

  // Run tests sequentially — Amazon rate-limits parallel requests
  fullyParallel: true,

  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,

  // Retry failed tests
  retries: process.env.CI ? 2 : 2,

  // Single worker — sequential execution to avoid rate limiting
  workers: 2,

  // Reporter configuration
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['json', { outputFile: 'test-results/results.json' }],
  ],

  // Shared settings for all test projects
  use: {
    // Base URL for the application under test
    baseURL: 'https://www.amazon.in',

    // Capture screenshots on failure
    screenshot: 'only-on-failure',

    // Capture video on first retry
    video: 'on-first-retry',

    // Collect trace when retrying the failed test
    trace: 'on-first-retry',

    // Set viewport size
    viewport: { width: 1366, height: 768 },

    // Browser launch options — stealth flags
    launchOptions: {
      slowMo: 100,
      args: [
        '--disable-blink-features=AutomationControlled',
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-infobars',
        '--window-size=1366,768',
        '--disable-extensions',
        '--disable-dev-shm-usage',
        '--lang=en-US,en',
      ],
    },

    // Extra HTTP headers to mimic a real browser session
    extraHTTPHeaders: {
      'Accept-Language': 'en-IN,en-GB;q=0.9,en-US;q=0.8,en;q=0.7',
    },

    // Geolocation for India
    geolocation: { latitude: 28.6139, longitude: 77.209 },
    locale: 'en-IN',
    timezoneId: 'Asia/Kolkata',

    // Default timeout for actions
    actionTimeout: 30000,

    // Default navigation timeout
    navigationTimeout: 60000,

    // Permissions
    permissions: ['geolocation'],
  },

  // Screenshot directory
  outputDir: './screenshots',

  // Global timeout for each test (generous for retries)
  timeout: 180000,

  // Test projects
  projects: [
    {
      name: 'chromium',
      use: {
        // USE REAL CHROME — not Playwright's bundled Chromium!
        // This is the #1 fix for Amazon bot detection.
        // Real Chrome has genuine fingerprints that pass bot checks.
        channel: 'chrome',

        // Real user agent (matches system Chrome)
        userAgent:
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36',
      },
    },
  ],
});
