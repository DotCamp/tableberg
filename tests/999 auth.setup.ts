import { test as setup, expect } from "@playwright/test";
import dotenv from "dotenv";

dotenv.config();

const authFile = "playwright/.auth/user.json";

setup("authenticate", async ({ page }) => {
    await page.goto("/wp-admin/");
    await page.getByLabel("Username or Email Address").fill(process.env.WP_USER ?? "admin");
    await page.getByLabel("Password", { exact: true }).fill(process.env.WP_PASSWORD ?? "admin");
    await page.getByRole("button", { name: "Log In" }).click();

    await page.waitForURL(`/wp-admin/`);
    await expect(page.getByRole('link', { name: 'Howdy, admin' })).toBeVisible();

    await page.context().storageState({ path: authFile });
});

