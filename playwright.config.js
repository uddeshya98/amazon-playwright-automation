// @ts-check
const { defineConfig, devices } = require('@playwright/test');
require('dotenv').config();

const capabilities = {
  browserName: 'Chrome',
  browserVersion: 'latest',
  'LT:Options': {
    platform: 'Windows 10',
    build: 'Amazon Playwright Build',
    name: 'Amazon Parallel Tests',
    user: process.env.LT_USERNAME,
    accessKey: process.env.LT_ACCESS_KEY,
    network: true,
    video: true,
    console: true,
    headless: false // typically LambdaTest runs headed unless specified
  }
};

module.exports = defineConfig({
  testDir: './tests',

  // Run tests in parallel
  fullyParallel: true,

  forbidOnly: !!process.env.CI,

  retries: 2,

  // Use multiple workers for parallel execution
  workers: 2,

  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
  ],

  use: {
    baseURL: 'https://www.amazon.in',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
    trace: 'on-first-retry',
    viewport: { width: 1366, height: 768 },
    actionTimeout: 30000,
    navigationTimeout: 60000,
    permissions: ['geolocation'],
    geolocation: { latitude: 28.6139, longitude: 77.209 },
    locale: 'en-IN',
    timezoneId: 'Asia/Kolkata',
  },

  outputDir: './screenshots',

  timeout: 180000,

  projects: [
    {
      name: 'local',
      use: {
        channel: 'chrome',
        launchOptions: {
          args: [
            '--disable-blink-features=AutomationControlled',
            '--no-sandbox',
            '--disable-setuid-sandbox',
          ],
        },
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36',
      },
    },
    {
      name: 'lambdatest',
      use: {
        connectOptions: {
          wsEndpoint: `wss://cdp.lambdatest.com/playwright?capabilities=${encodeURIComponent(JSON.stringify(capabilities))}`
        }
      }
    }
  ],
});
