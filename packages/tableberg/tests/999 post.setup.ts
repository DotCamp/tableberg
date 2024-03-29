import { test as setup, expect } from "@playwright/test";
import { POST_NAME } from "./vars";

const colsCount = 5;
const rowsCount = 4;

setup("create test post", async ({ page }) => {
    await page.goto(`/wp-admin/post-new.php`);
    await page.frameLocator('iframe[name="editor-canvas"]').getByLabel('Add title').click();
    await page.frameLocator('iframe[name="editor-canvas"]').getByLabel('Add title').fill(POST_NAME);
    await page.getByLabel('Save draft').click();

    const editorFrame = page.frameLocator('iframe[name="editor-canvas"]');

    await editorFrame.getByLabel("Add block").click();
    await page.getByPlaceholder("Search").fill("tableberg");
    await page.getByRole("option", { name: "Tableberg" }).click();

    await editorFrame.getByLabel("Column count").click();
    await editorFrame.getByLabel("Column count").press("Control+a");
    await editorFrame.getByLabel("Column count").fill(String(colsCount));
    await editorFrame.getByLabel("Row count").click();
    await editorFrame.getByLabel("Row count").press("Control+a");
    await editorFrame.getByLabel("Row count").fill(String(rowsCount));
    await editorFrame.getByRole("button", { name: "Create Table" }).click();

    const table = editorFrame.getByLabel("Block: Tableberg");

    const tableRows = table.locator("tr");
    await expect(tableRows).toHaveCount(rowsCount);

    for (let i = 1; i <= rowsCount; i++) {
        const rowCols = table.locator(`tr:nth-of-type(${i}) td`);
        await expect(rowCols).toHaveCount(colsCount);
    }

    for (let i = 0; i < colsCount * rowsCount; i++) {
        const cell = editorFrame.locator("td").nth(i);
        await cell.getByLabel("Empty block; start writing or").first().click();
        await cell.getByLabel("Empty block; start writing or").first().fill(`playwright test, cell ${i}`);
    }

    await page.getByLabel("Save draft").click();
    await expect(page.getByLabel("Saved")).toContainText("Saved");
});

