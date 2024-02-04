import { expect, Page } from "@playwright/test"

export const colsCount = 5;
export const rowsCount = 4;

export const getTable = (page: Page) => {
    const editorFrame = page.frameLocator('iframe[name="editor-canvas"]');
    const table = editorFrame.getByLabel("Block: Tableberg");

    return table;
}

export const expectMergeToBeDisabled = async (page: Page) => {
    await page.getByLabel('Edit table').click();
    await expect(page.getByRole('menuitem', { name: 'Merge' }))
        .toHaveAttribute("disabled");
    await page.getByLabel('Edit table').first().click();
}

export const getNthCell = (page: Page, n: number) => {
    const table = getTable(page);
    return table.locator("td").nth(n);
}

export const getCell = (page: Page, row: number, col: number) => {
    const table = getTable(page);
    return table.locator("tr").nth(row).locator("td").nth(col);
}

export const getAllCells = (page: Page) => {
    const table = getTable(page);
    return table.locator("td");
}

export const clickOnCell = async (page: Page, row: number, col: number, options: Record<string, any> = {}) => {
    await getCell(page, row, col).click(options);
}

export const ctrlClickOnCell = async (page: Page, row: number, col: number) => {
    await clickOnCell(page, row, col, {
        modifiers: ["Control"]
    });
}

export const clickMerge = async (page: Page) => {
    await page.getByLabel('Edit table').click();
    await page.getByRole('menuitem', { name: 'Merge' }).click();
}

export const clickOnInsertColAfter = async (page: Page) => {
    await page.getByLabel('Edit table').click();
    await page.getByRole('menuitem', { name: 'Insert column after' }).click();
}

export const clickOnInsertRowAfter = async (page: Page) => {
    await page.getByLabel('Edit table').click();
    await page.getByRole('menuitem', { name: 'Insert row after' }).click();
}
export const getAllRows = (page: Page) => {
    const table = getTable(page);
    return table.locator("tr");
}

