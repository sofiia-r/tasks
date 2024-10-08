import { defineConfig, devices } from "@playwright/test";
import { BASE } from "./src/providers/urlProvider";

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  timeout: 5 * 60 * 1000,
  testMatch: "*.ts",
  testDir: "./src/tests",
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Give failing tests 1 retry attempts */
  retries: 1,
  /* Limit the number of workers on CI, use default locally */
  workers: process.env.CI ? 2 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: "html",
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: BASE,
    /*  Record a trace only when retrying a test for the first time. See https://playwright.dev/docs/trace-viewer */
    trace: "on-first-retry",
    /* Capture screenshot after each test failure. */
    screenshot: "only-on-failure",
    /* Run browser in headless mode. */
    headless: true,
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: "Desktop",
      grep: /@desktop|@api/,
      use: { ...devices["Desktop Chrome"] },
    },
    /* Test against mobile viewports. */
    {
      name: "Mobile",
      grep: /@mobile/,
      use: { ...devices["Pixel 5"] },
    },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://127.0.0.1:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
