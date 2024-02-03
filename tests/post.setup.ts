import { test as setup } from "@playwright/test";
import { POST_NAME } from "./vars";

setup("create test post", async ({ page }) => {
    await page.goto(`/wp-admin/post-new.php`);
    await page.frameLocator('iframe[name="editor-canvas"]').getByLabel('Add title').click();
    await page.frameLocator('iframe[name="editor-canvas"]').getByLabel('Add title').fill(POST_NAME);
    await page.getByLabel('Save draft').click();
});

