// @ts-check
const { defineConfig } = require('@playwright/test');
require('dotenv').config();

/**
 * LambdaTest Configuration
 * Sign up at https://www.lambdatest.com to get credentials
 * Set LT_USERNAME and LT_ACCESS_KEY in your .env file
 */

const LT_USERNAME = process.env.LT_USERNAME || 'YOUR_LT_USERNAME';
const LT_ACCESS_KEY = process.env.LT_ACCESS_KEY || 'YOUR_LT_ACCESS_KEY';

// LambdaTest capabilities
const ltCapabilities = {
  browserName: 'Chrome',
  browserVersion: 'latest',
  'LT:Options': {
    platform: 'Windows 10',
    build: 'Amazon Automation Build',
    name: 'Amazon Product Tests',
    project: 'Amazon-Playwright-Assignment',
    smartWait: 5000,
    network: true,
    video: true,
    visual: true,
    console: true,
    tunnel: false,
  },
};

module.exports = defineConfig({
  testDir: './tests',
  fullyParallel: true,
  workers: 2,
  timeout: 120000,

  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
  ],

  use: {
    baseURL: 'https://www.amazon.in',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
    trace: 'on-first-retry',
    viewport: { width: 1280, height: 720 },
    actionTimeout: 30000,
    navigationTimeout: 60000,
  },

  projects: [
    {
      name: 'lambdatest-chrome',
      use: {
        connectOptions: {
          wsEndpoint: `wss://cdp.lambdatest.com/playwright?capabilities=${encodeURIComponent(
            JSON.stringify({
              ...ltCapabilities,
              'LT:Options': {
                ...ltCapabilities['LT:Options'],
                username: LT_USERNAME,
                accessKey: LT_ACCESS_KEY,
              },
            })
          )}`,
        },
      },
    },
  ],
});
