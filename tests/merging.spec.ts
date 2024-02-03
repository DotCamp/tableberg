import { test, expect } from "@playwright/test";
import { POST_NAME } from "./vars"

test.beforeEach("go to test post", async ({ page }) => {
    await page.goto("/wp-admin/edit.php");
    await page.getByLabel(`“${POST_NAME}” (Edit)`).click();
});

test.describe("test cells merging", async () => {
    test("create table and verify size", async ({ page }) => {
        const editorFrame = page.frameLocator('iframe[name="editor-canvas"]');

        await editorFrame.getByLabel("Add block").click();
        await page.getByPlaceholder("Search").fill("tableberg");
        await page.getByRole("option", { name: "Tableberg" }).click();

        const colsCount = 5;
        const rowsCount = 4;

        await editorFrame.getByLabel('Column count').click();
        await editorFrame.getByLabel('Column count').press('Control+a');
        await editorFrame.getByLabel('Column count').fill(String(colsCount));
        await editorFrame.getByLabel('Row count').click();
        await editorFrame.getByLabel('Row count').press('Control+a');
        await editorFrame.getByLabel('Row count').fill(String(rowsCount));
        await editorFrame.getByRole('button', { name: 'Create Table' }).click();

        const table = editorFrame.getByLabel("Block: Tableberg");

        const tableRows = table.locator("tr");
        await expect(tableRows).toHaveCount(rowsCount);

        for (let i = 1; i <= rowsCount; i++) {
            const rowCols = table.locator(`tr:nth-of-type(${i}) td`);
            await expect(rowCols).toHaveCount(colsCount);
        }

        await page.getByLabel("Save draft").click();
        await expect(page.getByLabel('Saved')).toContainText('Saved');
    })
    test("does this persist?", async ({ page }) => {
        const editorFrame = page.frameLocator('iframe[name="editor-canvas"]');

        const colsCount = 5;
        const rowsCount = 4;

        const table = editorFrame.getByLabel("Block: Tableberg");

        const tableRows = table.locator("tr");
        await expect(tableRows).toHaveCount(rowsCount);

        for (let i = 1; i <= rowsCount; i++) {
            const rowCols = table.locator(`tr:nth-of-type(${i}) td`);
            await expect(rowCols).toHaveCount(colsCount);
        }
    })
});

//merge two cells side by side
//  assert colspan is 2
//  assert number of cells is =-1
//  merge when they have different colspans
//      assert colspan is 3
//      assert number of cells
//
//merge two cells top and bottom
//  assert rowspan is 2
//  assert number of cells is =-1
//
//assert merge is disabled when cells are not adjacent
//
//assert merge is disabled when cells are not homogeneous
//
//reduce a column by merging
//  assert number of columns is =-1
//  add row
//      assert if an extra col is not added
//
//reduce a row by merging
//  assert number of rows is =-1
//  add col
//      assert if an extra row is not added


