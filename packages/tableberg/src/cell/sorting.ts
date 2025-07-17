import { TablebergBlockAttrs } from "@tableberg/shared/types";
import { BlockInstance, cloneBlock } from "@wordpress/blocks";

function getCellValue(row: any, colIndex: number) {
    let cellIndex = 0;
    for (let cell of row.cells) {
        if (cellIndex === colIndex)
            return cell.textContent.trim().toLowerCase();
        cellIndex += cell.colSpan;
    }
    return "";
}

export const sortTableV = (
    rootEl: HTMLElement,
    tableBlockID: string,
    byCol: number,
    storeSelect: BlockEditorStoreSelectors,
    storeAction: BlockEditorStoreActions,
) => {
    const tableBlock: BlockInstance<TablebergBlockAttrs> = storeSelect.getBlock(
        tableBlockID,
    )! as any;

    const table = rootEl.querySelector("table")!;
    const rows = Array.from(table.tBodies[0].rows);

    const indexedRows = rows.map((row, index) => ({
        originalIndex: index,
        content: getCellValue(row, byCol),
    }));

    let carry = 0;

    if (tableBlock.attributes.enableTableHeader) {
        indexedRows.splice(0, 1);
        carry = 1;
    }

    if (tableBlock.attributes.enableTableFooter) {
        indexedRows.pop();
    }

    const old = tableBlock.attributes.sort?.vertical;
    const newOrder = old?.col == byCol && old?.order === "asc" ? "desc" : "asc";

    if (newOrder === "asc") {
        indexedRows.sort((a, b) => {
            if (a.content < b.content) return -1;
            if (a.content > b.content) return 1;
            return 0;
        });
    } else {
        indexedRows.sort((a, b) => {
            if (a.content < b.content) return 1;
            if (a.content > b.content) return -1;
            return 0;
        });
    }

    const indexMap: Record<number, number> = {};

    const oldRowStyless = { ...tableBlock.attributes.rowStyles };
    const rowStyles: Record<number, any> = {};

    indexedRows.forEach((item, newIndex) => {
        indexMap[item.originalIndex] = newIndex + carry;
        rowStyles[newIndex + carry] = oldRowStyless[item.originalIndex];
        delete oldRowStyless[item.originalIndex];
    });

    for (const key in oldRowStyless) {
        rowStyles[key] = oldRowStyless[key];
    }

    const newInnerBlocks = tableBlock.innerBlocks.map((cell) => {
        if (!cell.attributes.isTmp) {
            const newRowIndex =
                indexMap[cell.attributes.row] ?? cell.attributes.row;
            const newColIndex = cell.attributes.col;
            return {
                ...cell,
                attributes: {
                    ...cell.attributes,
                    row: newRowIndex,
                    col: newColIndex,
                },
            };
        }
        return cell;
    });

    newInnerBlocks.sort(
        ({ attributes: a }, { attributes: b }) =>
            a.row * a.col + a.col - b.row * b.col - b.col,
    );

    storeAction.replaceInnerBlocks(tableBlockID, newInnerBlocks);

    storeAction.updateBlockAttributes(tableBlockID, {
        sort: {
            vertical: {
                enabled: true,
                order: newOrder,
                col: byCol,
            },
            horizontal: tableBlock.attributes.sort?.horizontal,
        },
        rowStyles,
    });
};

export const sortTableH = (
    rootEl: HTMLElement,
    tableBlockID: string,
    byRow: number,
    storeSelect: BlockEditorStoreSelectors,
    storeAction: BlockEditorStoreActions,
) => {
    const tableBlock: BlockInstance<TablebergBlockAttrs> = storeSelect.getBlock(
        tableBlockID,
    )! as any;

    const table = rootEl.querySelector("table")!;
    const cols = Array.from(table.tBodies[0].rows[byRow].cells);

    const indexedCols: { content: string; originalIndex: number }[] = [];

    let lastIdx = 0;
    cols.forEach((col) => {
        indexedCols.push({
            originalIndex: lastIdx++,
            content: col.textContent!.trim().toLowerCase(),
        });

        for (let i = 1; i < col.colSpan; i++) {
            indexedCols.push({
                originalIndex: lastIdx++,
                content: "",
            });
        }
    });

    const old = tableBlock.attributes.sort?.horizontal;
    const newOrder = old?.row == byRow && old?.order === "asc" ? "desc" : "asc";

    if (newOrder === "asc") {
        indexedCols.sort((a, b) => {
            if (a.content < b.content) return -1;
            if (a.content > b.content) return 1;
            return 0;
        });
    } else {
        indexedCols.sort((a, b) => {
            if (a.content < b.content) return 1;
            if (a.content > b.content) return -1;
            return 0;
        });
    }

    const indexMap: Record<number, number> = {};
    const oldColStyless = { ...tableBlock.attributes.colStyles };
    const colStyles: Record<number, any> = {};

    indexedCols.forEach((item, newIndex) => {
        indexMap[item.originalIndex] = newIndex;
        colStyles[newIndex] = oldColStyless[item.originalIndex];
        delete oldColStyless[item.originalIndex];
    });

    for (const key in oldColStyless) {
        colStyles[key] = oldColStyless[key];
    }

    const newInnerBlocks = tableBlock.innerBlocks.map((cell) => {
        const newColIndex = indexMap[cell.attributes.col];
        const newCell = cloneBlock(cell) as any;
        newCell.attributes.col = newColIndex;
        return newCell;
    });

    newInnerBlocks.sort(
        ({ attributes: a }, { attributes: b }) =>
            a.row * a.col + a.col - b.row * b.col - b.col,
    );

    storeAction.replaceInnerBlocks(tableBlockID, newInnerBlocks);

    storeAction.updateBlockAttributes(tableBlockID, {
        sort: {
            horizontal: {
                enabled: true,
                order: newOrder,
                row: byRow,
            },
            vertical: tableBlock.attributes.sort?.vertical,
        },
        colStyles,
    });
};
