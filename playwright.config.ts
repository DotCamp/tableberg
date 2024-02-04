import { defineConfig, devices } from "@playwright/test";
import dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
    testDir: "./tests",
    forbidOnly: !!process.env.CI,
    retries: 1,
    workers: process.env.CI ? 1 : undefined,
    reporter: "html",
    fullyParallel: true,
    use: {
        baseURL: process.env.BASE_URL ?? "http://127.0.0.1",
        trace: "on-first-retry",
        video: "on-first-retry"
    },
    projects: [
        {
            name: "auth setup",
            testMatch: /.*auth\.setup\.ts/,
        },
        {
            name: "post setup",
            testMatch: /.*post\.setup\.ts/,
            use: {
                storageState: "playwright/.auth/user.json",
            },
            dependencies: ["auth setup"],
            teardown: "post delete"
        },
        {
            name: "post delete",
            testMatch: /.*post\.teardown\.ts/,
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
