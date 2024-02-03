import { defineConfig, devices } from "@playwright/test";
import dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
    testDir: "./tests",
    /* Fail the build on CI if you accidentally left test.only in the source code. */
    forbidOnly: !!process.env.CI,
    /* Retry on CI only */
    retries: process.env.CI ? 2 : 0,
    /* Opt out of parallel tests on CI. */
    workers: process.env.CI ? 1 : undefined,
    /* Reporter to use. See https://playwright.dev/docs/test-reporters */
    reporter: "html",
    /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
    use: {
        /* Base URL to use in actions like `await page.goto("/")`. */
        baseURL: process.env.baseURL ?? "http://127.0.0.1",

        /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
        trace: "on-first-retry",
    },
    // globalSetup: require.resolve("./global-setup"),
    /* Configure projects for major browsers */
    projects: [
        {
            name: "auth setup",
            testMatch: /auth\.setup\.ts/,
        },
        {
            name: "post setup",
            testMatch: /post\.setup\.ts/,
            use: {
                storageState: "playwright/.auth/user.json",
            },
            dependencies: ["auth setup"],
            teardown: "post delete"
        },
        {
            name: "post delete",
            testMatch: /post\.teardown\.ts/,
            use: {
                storageState: "playwright/.auth/user.json",
            },
        },
        {
            name: "chromium",
            use: {
                ...devices["Desktop Chrome"],
                storageState: 'playwright/.auth/user.json',
            },
            dependencies: ["post setup"]
        },
    ],
});
