import { test, expect } from "@playwright/test";
import { POST_NAME } from "./vars"
import * as tableberg from "./utils"

test.beforeEach("go to test post", async ({ page }) => {
    await page.goto("/wp-admin/edit.php");
    await page.getByLabel(`“${POST_NAME}” (Edit)`).click();
});

test.describe("test cells merging", async () => {
    test("merge two cells side by side", async ({ page }) => {
        await tableberg.getNthCell(page, 0).click();
        await tableberg.getNthCell(page, 1).click({
            modifiers: ["Control"]
        });
        await page.getByLabel('Edit table').click();
        await page.getByRole('menuitem', { name: 'Merge' }).click();

        await expect(tableberg.getNthCell(page, 0)).toHaveAttribute("colspan", "2")
        await expect(tableberg.getAllCells(page)).toHaveCount((tableberg.rowsCount * tableberg.colsCount) - 1);
    });

    test("merge two cells up and down", async ({ page }) => {
        await tableberg.getNthCell(page, 0).click();
        await tableberg.ctrlClickOnCell(page, 1, 0);

        await tableberg.clickMerge(page);

        await expect(tableberg.getNthCell(page, 0)).toHaveAttribute("rowspan", "2")
        await expect(tableberg.getAllCells(page)).toHaveCount((tableberg.rowsCount * tableberg.colsCount) - 1);
    });

    test("merge four cells side by side", async ({ page }) => {
        await tableberg.clickOnCell(page, 0, 0);
        await tableberg.ctrlClickOnCell(page, 0, 1);
        await tableberg.ctrlClickOnCell(page, 0, 2);
        await tableberg.ctrlClickOnCell(page, 0, 3);

        await tableberg.clickMerge(page);

        await expect(tableberg.getNthCell(page, 0)).toHaveAttribute("colspan", "4")
        await expect(tableberg.getAllCells(page)).toHaveCount((tableberg.rowsCount * tableberg.colsCount) - 3);
    });

    test("merge four cells up and down", async ({ page }) => {
        await tableberg.clickOnCell(page, 0, 0);
        await tableberg.ctrlClickOnCell(page, 1, 0);
        await tableberg.ctrlClickOnCell(page, 2, 0);
        await tableberg.ctrlClickOnCell(page, 3, 0);

        await tableberg.clickMerge(page);

        await expect(tableberg.getNthCell(page, 0)).toHaveAttribute("rowspan", "4")
        await expect(tableberg.getAllCells(page)).toHaveCount((tableberg.rowsCount * tableberg.colsCount) - 3);
    });

    test("merging disabled when selected cells are non adjacent/non homogeneous", async ({ page }) => {
        await tableberg.clickOnCell(page, 0, 0);
        await tableberg.ctrlClickOnCell(page, 1, 1);
        await tableberg.expectMergeToBeDisabled(page);

        await tableberg.ctrlClickOnCell(page, 0, 1);
        await tableberg.ctrlClickOnCell(page, 2, 1);
        await tableberg.expectMergeToBeDisabled(page);

        await tableberg.ctrlClickOnCell(page, 1, 0);
        await tableberg.expectMergeToBeDisabled(page);

        await tableberg.ctrlClickOnCell(page, 2, 0);
        await tableberg.clickMerge(page);

        await expect(tableberg.getNthCell(page, 0)).toHaveAttribute("rowspan", "3")
        await expect(tableberg.getNthCell(page, 0)).toHaveAttribute("colspan", "2")
        await expect(tableberg.getAllCells(page)).toHaveCount((tableberg.rowsCount * tableberg.colsCount) - 5);
    });

    test("reduce a row by merging", async ({ page }) => {
        await tableberg.clickOnCell(page, tableberg.rowsCount - 1, 0);
        for (let i = 1; i < tableberg.colsCount; i++) {
            await tableberg.ctrlClickOnCell(page, tableberg.rowsCount - 1, i);
        }
        await tableberg.clickMerge(page);

        await tableberg.clickOnCell(page, tableberg.rowsCount - 2, 0);
        for (let i = 1; i < tableberg.colsCount; i++) {
            await tableberg.ctrlClickOnCell(page, tableberg.rowsCount - 2, i);
        }
        await tableberg.clickMerge(page);

        await tableberg.clickOnCell(page, tableberg.rowsCount - 1, 0);
        await tableberg.ctrlClickOnCell(page, tableberg.rowsCount - 2, 0);
        await tableberg.clickMerge(page);

        await expect(tableberg.getAllCells(page)).toHaveCount((tableberg.rowsCount * tableberg.colsCount) - (1 + (2 * (tableberg.colsCount - 1))));
        await tableberg.clickOnCell(page, 2, 0);
        await tableberg.clickOnInsertColAfter(page);
        await expect(tableberg.getAllRows(page)).toHaveCount(tableberg.rowsCount - 1);
    });

    test("reduce a column by merging", async ({ page }) => {
        await tableberg.clickOnCell(page, 0, tableberg.colsCount - 1);
        for (let i = 1; i < tableberg.rowsCount; i++) {
            await tableberg.ctrlClickOnCell(page, i, tableberg.colsCount - 1);
        }
        await tableberg.clickMerge(page);

        await tableberg.clickOnCell(page, 0, tableberg.colsCount - 2);
        for (let i = 1; i < tableberg.rowsCount; i++) {
            await tableberg.ctrlClickOnCell(page, i, tableberg.colsCount - 2);
        }
        await tableberg.clickMerge(page);

        await tableberg.clickOnCell(page, 0, tableberg.colsCount - 1);
        await tableberg.ctrlClickOnCell(page, 0, tableberg.colsCount - 2);
        await tableberg.clickMerge(page);

        await expect(tableberg.getAllCells(page)).toHaveCount((tableberg.rowsCount * tableberg.colsCount) - (1 + (2 * (tableberg.rowsCount - 1))));
        await tableberg.clickOnCell(page, tableberg.rowsCount - 1, 0);
        await tableberg.clickOnInsertRowAfter(page);

        const table = tableberg.getTable(page);
        await expect(table.locator("tr").nth(tableberg.rowsCount).locator("td")).toHaveCount(tableberg.colsCount - 1);
    });
});

