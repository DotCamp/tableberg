import { test, expect } from "@playwright/test";

const baseURL = "http://127.0.0.1";

test.describe("test cells merging", async () => {
    test("create table and verify size", async ({ page }) => {
        await page.goto(`${baseURL}/wp-admin/`);
        await page.getByLabel("Username or Email Address").fill("admin");
        await page.getByLabel("Password", { exact: true }).fill("admin");
        await page.getByRole("button", { name: "Log In" }).click();

        await page.goto(`${baseURL}/wp-admin/post-new.php`);

        await page.frameLocator('iframe[name="editor-canvas"]').getByLabel('Add block').click();
        await page.getByPlaceholder('Search').fill('tableberg');
        await page.getByRole('option', { name: 'Tableberg' }).click();

        const colsCount = 5;
        const rowsCount = 4;

        await page.frameLocator('iframe[name="editor-canvas"]').getByLabel('Column count').click();
        await page.frameLocator('iframe[name="editor-canvas"]').getByLabel('Column count').press('Control+a');
        await page.frameLocator('iframe[name="editor-canvas"]').getByLabel('Column count').fill(String(colsCount));
        await page.frameLocator('iframe[name="editor-canvas"]').getByLabel('Row count').click();
        await page.frameLocator('iframe[name="editor-canvas"]').getByLabel('Row count').press('Control+a');
        await page.frameLocator('iframe[name="editor-canvas"]').getByLabel('Row count').fill(String(rowsCount));
        await page.frameLocator('iframe[name="editor-canvas"]').getByRole('button', { name: 'Create Table' }).click();

        const table = page.frameLocator('iframe[name="editor-canvas"]').getByLabel("Block: Tableberg");

        const tableRows = table.locator("tr");
        await expect(tableRows).toHaveCount(rowsCount);

        const rowCols = tableRows.locator("td");
        await expect(rowCols).toHaveCount(colsCount * rowsCount);
    })
});
