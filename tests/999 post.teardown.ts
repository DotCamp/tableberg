import { test as setup } from "@playwright/test";
import { POST_NAME } from "./vars";

setup("delete test post", async ({ page }) => {
    await page.goto("/wp-admin/edit.php");
    await page.getByRole('cell', { name: '“playwright test” (Edit) —' }).hover();
    await page.getByLabel(`Move “${POST_NAME}” to the Trash`).click({ force: true });
});

