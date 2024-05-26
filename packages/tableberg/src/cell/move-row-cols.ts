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
    if (Math.abs(subject - target) < 2) {
        return;
    }

    const cells: TablebergCellInstance[] = tableBlock.innerBlocks as any;
    let pendingCols: TablebergCellInstance[] = [];
    const newCells: TablebergCellInstance[] = [];
    let canMove = true;
    let lastRowInserted = -1;

    const toRight = subject < target;

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

        if (toRight) {
            if (attrs.col === subject) {
                if (attrs.colspan > 1) {
                    canMove = false;
                    break;
                }
                cloned.attributes.col = target - 1;
                pendingCols.push(cloned);

                continue;
            }
            if (attrs.col < subject) {
                newCells.push(cloned);
                continue;
            }
            if (attrs.col < target) {
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
        } else {
            if (attrs.col === subject) {
                if (attrs.colspan > 1) {
                    canMove = false;
                    break;
                }
                cloned.attributes.col = target;
                pendingCols.push(cloned);

                continue;
            }
            if (attrs.col < target) {
                newCells.push(cloned);
                continue;
            }
            if (lastRowInserted !== attrs.row) {
                lastRowInserted = attrs.row;
                newCells.push(...pendingCols);
                pendingCols = [];
            }
            if (attrs.col < subject) {
                cloned.attributes.col += 1;
                newCells.push(cloned);
                continue;
            }

            newCells.push(cloned);
        }
    }
    if (pendingCols.length > 0) {
        newCells.push(...pendingCols);
        pendingCols = [];
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
