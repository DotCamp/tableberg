import {
    TablebergBlockAttrs,
    TablebergCellInstance,
} from "@tableberg/shared/types";
import { BlockInstance, cloneBlock } from "@wordpress/blocks";

export const moveCol = (
    storeActions: BlockEditorStoreActions,
    tableBlock: BlockInstance<TablebergBlockAttrs>,
    subject: number,
    target: number,
) => {
    if (subject === target) {
        return;
    }

    const cells: TablebergCellInstance[] = tableBlock.innerBlocks as any;
    let pendingCols: TablebergCellInstance[] = [];
    const newCells: TablebergCellInstance[] = [];
    let canMove = true;
    
    const toRight = subject < target;
    
    if (toRight) {
        let lastRowInserted = -1;
        for (let i = 0; i < cells.length; i++) {
            const cell = cells[i];
            const attrs = cell.attributes;
            if (attrs.col < target && attrs.col + attrs.colspan > target) {
                canMove = false;
                break;
            }
            const cloned = cloneBlock(cell);

            if (attrs.row - lastRowInserted > 1) {
                lastRowInserted = attrs.row - 1;
                newCells.push(...pendingCols);
                pendingCols = [];
            }
            if (attrs.col === subject) {
                if (attrs.colspan > 1) {
                    canMove = false;
                    break;
                }
                cloned.attributes.col = target;
                pendingCols.push(cloned);

                continue;
            }

            if (attrs.col < subject) {
                newCells.push(cloned);
                continue;
            }
            if (attrs.col <= target) {
                cloned.attributes.col -= 1;
                newCells.push(cloned);
                continue;
            }
            if (lastRowInserted !== attrs.row) {
                lastRowInserted = attrs.row;
                newCells.push(...pendingCols);

                pendingCols = [];
            }
            newCells.push(cloned);
        }

        if (pendingCols.length > 0) {
            newCells.push(...pendingCols);
            pendingCols = [];
        }
    } else {
        let lastRowInserted = tableBlock.attributes.rows;
        for (let i = cells.length - 1; i > -1; i--) {
            const cell = cells[i];
            const attrs = cell.attributes;
            if (attrs.col < target && attrs.col + attrs.colspan > target) {
                canMove = false;
                break;
            }
            const cloned = cloneBlock(cell);
            if (lastRowInserted - attrs.row > 1) {
                lastRowInserted = attrs.row - 1;
                newCells.push(...pendingCols);
                pendingCols = [];
            }
            if (attrs.col === subject) {
                if (attrs.colspan > 1) {
                    canMove = false;
                    break;
                }
                cloned.attributes.col = target;
                pendingCols.push(cloned);

                continue;
            }

            if (attrs.col > subject) {
                newCells.push(cloned);
                continue;
            }
            if (attrs.col >= target) {
                cloned.attributes.col += 1;
                newCells.push(cloned);
                continue;
            }
            if (lastRowInserted !== attrs.row) {
                lastRowInserted = attrs.row;
                newCells.push(...pendingCols);
                pendingCols = [];
            }
            newCells.push(cloned);
        }
        if (pendingCols.length > 0) {
            newCells.push(...pendingCols);
            pendingCols = [];
        }

        newCells.reverse();
    }

    if (!canMove) {
        console.warn("[Tableberg] Cannot move inside columns");
        storeActions.removeBlocks(newCells.map((cell) => cell.clientId));
        return;
    }

    storeActions.replaceInnerBlocks(tableBlock.clientId, newCells);
};

export const moveRow = (
    storeActions: BlockEditorStoreActions,
    tableBlock: BlockInstance<TablebergBlockAttrs>,
    subject: number,
    target: number,
) => {};
