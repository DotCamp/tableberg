import {
    BlockEditProps,
    registerBlockType,
    BlockInstance,
    BlockSaveProps,
    InnerBlockTemplate,
    createBlock,
    cloneBlock,
} from "@wordpress/blocks";
import {
    BlockVerticalAlignmentToolbar,
    BlockControls,
    store as blockEditorStore,
    ButtonBlockAppender,
} from "@wordpress/block-editor";

import {
    useBlockProps,
    useInnerBlocksProps,
    // @ts-ignore
    useBlockEditingMode,
} from "@wordpress/block-editor";
import { useDispatch, useSelect } from "@wordpress/data";
import { ToolbarDropdownMenu } from "@wordpress/components";
import { ToolbarWithDropdown } from "@tableberg/components";
import {
    tableRowBefore,
    tableRowAfter,
    tableRowDelete,
    tableColumnAfter,
    tableColumnBefore,
    tableColumnDelete,
    table,
    alignNone,
    arrowRight,
    arrowLeft,
    arrowUp,
    arrowDown,
} from "@wordpress/icons";

import classNames from "classnames";

import { store as tbStore } from "../store";
import { TablebergCtx } from "../";

import "./style.scss";
import "./editor.scss";

import metadata from "./block.json";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import TablebergControls from "../controls";
import { DropdownOption } from "@wordpress/components/build-types/dropdown-menu/types";
import {
    TablebergBlockAttrs,
    TablebergCellBlockAttrs,
    TablebergCellInstance,
} from "@tableberg/shared/types";

import {
    DuplicateRowIcon,
    DuplicateColumnIcon,
} from "@tableberg/shared/icons/enhancements";

import TablebergProIcon from "@tableberg/shared/icons/tableberg-pro";
import { UpsellEnhancedModal } from "../components/UpsellModal";
import {
    getBorderRadiusVar,
    getSpacingCssSingle,
} from "@tableberg/shared/utils/styling-helpers";
import { getBorderVariablesCss } from "../utils/styling-helpers";

const IS_PRO = TABLEBERG_CFG.IS_PRO;

const ALLOWED_BLOCKS = [
    "core/paragraph",
    "tableberg/button",
    "tableberg/image",
    "core/list",
];

const CELL_TEMPLATE: InnerBlockTemplate[] = [["core/paragraph"]];

const createSingleCell = (
    row: number,
    col: number,
    isHeader: boolean,
): TablebergCellInstance => {
    return createBlock(
        "tableberg/cell",
        {
            col: col,
            row,
            tagName: isHeader ? "th" : "td",
        },
        [createBlock("core/paragraph")],
    ) as TablebergCellInstance;
};

const addRow = (
    tableBlock: BlockInstance<TablebergBlockAttrs>,
    storeActions: BlockEditorStoreActions,
    rowIndex: number,
) => {
    let skipCols: Map<number, number> = new Map();
    let skipCount = 0;

    const cellBlocks: TablebergCellInstance[] = [];
    const postCells: TablebergCellInstance[] = [];

    tableBlock.innerBlocks.forEach((cell) => {
        const attrs: TablebergCellBlockAttrs = cell.attributes as any;
        if (attrs.isTmp) {
            return;
        }
        if (attrs.row >= rowIndex) {
            cell.attributes.row += 1;
            postCells.push(cell as TablebergCellInstance);
        } else {
            if (attrs.row < rowIndex && attrs.row + attrs.rowspan > rowIndex) {
                cell.attributes.rowspan += 1;
                skipCols.set(cell.attributes.col, cell.attributes.colspan);
                skipCount += cell.attributes.colspan;
            }
            cellBlocks.push(cell as TablebergCellInstance);
        }
    });

    for (let i = 0; i < tableBlock.attributes.cols; i++) {
        const skip = skipCols.get(i);
        if (skip) {
            i += skip - 1;
        } else {
            cellBlocks.push(createSingleCell(rowIndex, i, false));
        }
    }

    postCells.forEach((cell) => {
        cellBlocks.push(cell);
    });

    const rowStyles: TablebergBlockAttrs["rowStyles"] = {};

    tableBlock.attributes.rowStyles ||= {};

    for (const i in tableBlock.attributes.rowStyles) {
        const numI = Number(i);
        if (numI < rowIndex) {
            rowStyles[numI] = tableBlock.attributes.rowStyles[i];
        } else {
            rowStyles[numI + 1] = tableBlock.attributes.rowStyles[i];
        }
    }

    storeActions.replaceInnerBlocks(tableBlock.clientId, cellBlocks, false);
    storeActions.updateBlockAttributes(tableBlock.clientId, {
        rows: tableBlock.attributes.rows + 1,
        cells: cellBlocks.length,
        rowStyles,
    });
};

const addCol = (
    tableBlock: BlockInstance<TablebergBlockAttrs>,
    storeActions: BlockEditorStoreActions,
    colIndex: number,
) => {
    const cellBlocks: TablebergCellInstance[] = Array(
        tableBlock.innerBlocks.length,
    );
    let lastIndex = 0,
        lastInsertedRow = -1;

    const lastRow = tableBlock.attributes.rows - 1;

    tableBlock.innerBlocks.forEach((cell) => {
        const attrs = cell.attributes as TablebergCellBlockAttrs;
        if (attrs.isTmp) {
            return;
        }
        if (attrs.col < colIndex && attrs.col + attrs.colspan > colIndex) {
            attrs.colspan += 1;

            lastInsertedRow = attrs.row + attrs.rowspan - 1;

            cellBlocks[lastIndex++] = cell as TablebergCellInstance;
            return;
        }

        if (attrs.col >= colIndex) {
            cell.attributes.col += 1;
        }

        if (lastInsertedRow >= attrs.row) {
            cellBlocks[lastIndex++] = cell as TablebergCellInstance;
            return;
        }

        if (attrs.col < colIndex) {
            const prevRow = attrs.row - 1;
            if (lastInsertedRow == prevRow) {
                cellBlocks[lastIndex++] = cell as TablebergCellInstance;
                return;
            }
            const toInsertCount = prevRow - lastInsertedRow;
            for (let i = 1; i <= toInsertCount; i++) {
                const row = lastInsertedRow + i;
                cellBlocks[lastIndex++] = createSingleCell(
                    row,
                    colIndex,
                    !!(
                        (tableBlock.attributes.enableTableHeader && row == 0) ||
                        (tableBlock.attributes.enableTableFooter &&
                            row == lastRow)
                    ),
                );
            }
            lastInsertedRow = prevRow;
        } else {
            const missedCount = attrs.row - lastInsertedRow;
            for (let i = 1; i <= missedCount; i++) {
                const row = lastInsertedRow + i;
                cellBlocks[lastIndex++] = createSingleCell(
                    row,
                    colIndex,
                    !!(
                        (tableBlock.attributes.enableTableHeader && row == 0) ||
                        (tableBlock.attributes.enableTableFooter &&
                            row == lastRow)
                    ),
                );
            }
            lastInsertedRow = attrs.row;
        }

        cellBlocks[lastIndex++] = cell as TablebergCellInstance;
    });

    lastInsertedRow++;
    for (; lastInsertedRow < tableBlock.attributes.rows; lastInsertedRow++) {
        cellBlocks[lastIndex++] = createSingleCell(
            lastInsertedRow,
            colIndex,
            !!(tableBlock.attributes.enableTableHeader && lastInsertedRow == 0),
        );
    }

    const colStyles: TablebergBlockAttrs["colStyles"] = {};
    tableBlock.attributes.colStyles ||= {};
    for (const i in tableBlock.attributes.colStyles) {
        const numI = Number(i);
        if (numI < colIndex) {
            colStyles[numI] = tableBlock.attributes.colStyles[i];
        } else {
            colStyles[numI + 1] = tableBlock.attributes.colStyles[i];
        }
    }

    storeActions.replaceInnerBlocks(tableBlock.clientId, cellBlocks, false);
    storeActions.updateBlockAttributes(tableBlock.clientId, {
        cols: tableBlock.attributes.cols + 1,
        cells: cellBlocks.length,
        colStyles,
    });
};

const deleteCol = (
    tableBlock: BlockInstance<TablebergBlockAttrs>,
    storeActions: BlockEditorStoreActions,
    colIndex: number,
    span: number,
) => {
    const cellBlocks: TablebergCellInstance[] = [];
    const endCol = colIndex + span;

    tableBlock.innerBlocks.forEach((cell) => {
        const col = cell.attributes.col;

        if (col === colIndex && cell.attributes.colspan > span) {
            cell.attributes.colspan -= span;
            cellBlocks.push(cell as any);
            return;
        }

        if (cell.attributes.isTmp || (col >= colIndex && col < endCol)) {
            return;
        }

        if (col > colIndex) {
            cell.attributes.col -= span;
        } else if (col < colIndex && col + cell.attributes.colspan > colIndex) {
            cell.attributes.colspan -= span;
        }
        cellBlocks.push(cell as any);
    });

    const colStyles: TablebergBlockAttrs["colStyles"] = {};
    tableBlock.attributes.colStyles ||= {};
    let idx = 0;
    for (const i in tableBlock.attributes.colStyles) {
        const numI = Number(i);
        if (numI < colIndex || numI >= endCol) {
            colStyles[idx++] = tableBlock.attributes.colStyles[i];
        }
    }

    storeActions.replaceInnerBlocks(tableBlock.clientId, cellBlocks, false);
    storeActions.updateBlockAttributes(tableBlock.clientId, {
        cols: tableBlock.attributes.cols - span,
        cells: cellBlocks.length,
        colStyles,
    });
};

const deleteRow = (
    tableBlock: BlockInstance<TablebergBlockAttrs>,
    storeActions: BlockEditorStoreActions,
    rowIndex: number,
    span: number,
) => {
    const cellBlocks: TablebergCellInstance[] = [];
    const endRow = rowIndex + span;

    tableBlock.innerBlocks.forEach((cell) => {
        const row = cell.attributes.row;

        if (row === rowIndex && cell.attributes.rowspan > span) {
            cell.attributes.rowspan -= span;
            cellBlocks.push(cell as any);
            return;
        }

        if (
            cell.attributes.isTmp ||
            (cell.attributes.row >= rowIndex && cell.attributes.row < endRow)
        ) {
            return;
        }
        if (cell.attributes.row > rowIndex) {
            cell.attributes.row -= span;
        } else if (
            cell.attributes.row < rowIndex &&
            cell.attributes.row + cell.attributes.rowspan > rowIndex
        ) {
            cell.attributes.rowspan -= span;
        }
        cellBlocks.push(cell as any);
    });

    const rowStyles: TablebergBlockAttrs["rowStyles"] = {};
    tableBlock.attributes.rowStyles ||= {};
    let idx = 0;
    for (const i in tableBlock.attributes.rowStyles) {
        const numI = Number(i);
        if (numI < rowIndex || numI >= endRow) {
            rowStyles[idx++] = tableBlock.attributes.rowStyles[i];
        }
    }

    storeActions.replaceInnerBlocks(tableBlock.clientId, cellBlocks, false);
    storeActions.updateBlockAttributes(tableBlock.clientId, {
        rows: tableBlock.attributes.rows - span,
        cells: cellBlocks.length,
        rowStyles,
    });
};

const useMerging = (
    clientId: string,
    tableBlock: BlockInstance<TablebergBlockAttrs>,
    storeActions: BlockEditorStoreActions,
) => {
    const { selectForMerge, endCellMultiSelect } = useDispatch(tbStore);
    const { isCellSelected, isMergable, getSpans, getIndexes } = useSelect(
        (select) => {
            const { getIndexes, isCellSelected, getSpans } = select(tbStore);

            return {
                getIndexes,
                isMergable: () => getIndexes(tableBlock.clientId),
                isCellSelected,
                getSpans,
            };
        },
        [],
    );

    const storeSelect = useSelect((select) => {
        return select(blockEditorStore) as BlockEditorStoreSelectors;
    }, []);

    const elClickEvt = function (this: HTMLElement, evt: MouseEvent) {
        const cell: TablebergCellInstance = storeSelect.getBlock(
            clientId,
        ) as any;

        if (!evt.shiftKey) {
            if (
                getIndexes(tableBlock.clientId) &&
                !isCellSelected(
                    tableBlock.clientId,
                    cell.attributes.row,
                    cell.attributes.col,
                )
            ) {
                endCellMultiSelect(tableBlock.clientId);
            }
            return;
        }

        const focus = storeSelect.getSelectedBlock();
        if (!focus) {
            return;
        }
        const parentIds = storeSelect.getBlockParents(focus.clientId);
        let focusedCell: TablebergCellInstance | undefined;
        for (let i = 0; i < parentIds.length; i++) {
            const maybeCell = storeSelect.getBlock(parentIds[i]);
            if (maybeCell && maybeCell.name === "tableberg/cell") {
                focusedCell = maybeCell as TablebergCellInstance;
                break;
            }
        }

        if (!focusedCell || focusedCell.clientId === clientId) {
            return;
        }
        evt.preventDefault();
        evt.stopImmediatePropagation();

        let from: any, to: any;

        if (
            cell.attributes.col <= focusedCell.attributes.col &&
            cell.attributes.row <= focusedCell.attributes.row
        ) {
            from = {
                col: cell.attributes.col,
                row: cell.attributes.row,
            };
            to = {
                col:
                    focusedCell.attributes.col + focusedCell.attributes.colspan,
                row:
                    focusedCell.attributes.row + focusedCell.attributes.rowspan,
            };
        } else {
            to = {
                col: cell.attributes.col + cell.attributes.colspan,
                row: cell.attributes.row + cell.attributes.rowspan,
            };
            from = {
                col: focusedCell.attributes.col,
                row: focusedCell.attributes.row,
            };
        }

        tableBlock = storeSelect.getBlock(tableBlock.clientId) as any;

        selectForMerge(
            tableBlock.clientId,
            tableBlock.innerBlocks as any,
            from,
            to,
        );
    };

    const mergeCells = () => {
        const cells: TablebergCellInstance[] = [];

        let destination: TablebergCellInstance | undefined;

        getIndexes(tableBlock.clientId)?.forEach((idx) => {
            const cell = tableBlock.innerBlocks[idx] as TablebergCellInstance;
            if (!destination) {
                destination = cell;
            } else {
                cells.push(cell);
            }
        });

        if (!destination) {
            return;
        }

        let { rowStyles, colStyles, rows, cols } = tableBlock.attributes;

        storeActions.updateBlockAttributes(tableBlock.clientId, {
            cells: tableBlock.attributes.cells - cells.length,
        });

        const newInnerBlocks: TablebergCellInstance[] =
            destination.innerBlocks as any;

        const toRemoves: string[] = [];
        for (let i = 0; i < cells.length; i++) {
            cells[i].innerBlocks.forEach((b) => {
                if (b.name !== "core/paragraph" || b.attributes.content?.text) {
                    newInnerBlocks.push(cloneBlock(b) as any);
                }
                toRemoves.push(b.clientId);
            });
            toRemoves.push(cells[i].clientId);
        }

        storeActions.removeBlocks(toRemoves);
        storeActions.replaceInnerBlocks(destination.clientId, newInnerBlocks);

        const oldSpans = getSpans();
        const newSpans = { ...oldSpans };
        let removeRows = 0,
            removeCols = 0;
        if (oldSpans.col == tableBlock.attributes.cols && oldSpans.row > 1) {
            removeRows = oldSpans.row - 1;
            const endRow = destination.attributes.row + removeRows;
            const newStyles: TablebergBlockAttrs["rowStyles"] = {};
            for (const key in rowStyles) {
                // @ts-ignore
                if (key < destination.attributes.row) {
                    newStyles[key] = rowStyles[key];
                    continue;
                }
                // @ts-ignore
                if (key <= endRow) {
                    continue;
                }
                newStyles[Number(key) - removeRows] = rowStyles[key];
            }
            rowStyles = newStyles;
            newSpans.row = 1;
        }
        if (oldSpans.row == tableBlock.attributes.rows && oldSpans.col > 1) {
            removeCols = oldSpans.col - 1;
            const endCol = destination.attributes.col + removeCols;
            const newStyles: TablebergBlockAttrs["colStyles"] = {};
            for (const key in colStyles) {
                // @ts-ignore
                if (key < destination.attributes.col) {
                    newStyles[key] = colStyles[key];
                    continue;
                }
                // @ts-ignore
                if (key <= endCol) {
                    continue;
                }
                newStyles[Number(key) - removeCols] = colStyles[key];
            }
            colStyles = newStyles;
            newSpans.col = 1;
        }

        if (removeRows || removeCols) {
            const updatedCells: TablebergCellInstance[] = Array(
                tableBlock.innerBlocks.length,
            );
            let lastIdx = 0;
            // @ts-ignore
            tableBlock.innerBlocks.forEach((cell: TablebergCellInstance) => {
                if (
                    removeRows &&
                    cell.attributes.row > destination!.attributes.row
                ) {
                    cell.attributes.row -= removeRows;
                }
                if (
                    removeCols &&
                    cell.attributes.col > destination!.attributes.col
                ) {
                    cell.attributes.col -= removeCols;
                }
                updatedCells[lastIdx++] = cell;
            });
            rows -= removeRows;
            cols -= removeCols;
            storeActions.replaceInnerBlocks(tableBlock.clientId, updatedCells);
        }

        storeActions.updateBlockAttributes(destination.clientId, {
            colspan: newSpans.col,
            rowspan: newSpans.row,
        });
        storeActions.updateBlockAttributes(tableBlock.clientId, {
            rowStyles,
            colStyles,
            rows,
            cols,
        });
        storeActions.removeBlocks(toRemoves);

        endCellMultiSelect(tableBlock.clientId);
    };

    const unMergeCells = () => {
        let startIdx = 0,
            cell: TablebergCellInstance | null = null;
        const newCells: TablebergCellInstance[] = [];
        for (; startIdx < tableBlock.innerBlocks.length; startIdx++) {
            cell = tableBlock.innerBlocks[startIdx] as any;
            newCells.push(cell as any);
            if (cell?.clientId === clientId) {
                break;
            }
        }
        if (!cell) {
            return;
        }

        let curCol = cell.attributes.col;
        let curRow = cell.attributes.row;
        let toCol = curCol + cell.attributes.colspan;
        let toRow = curRow + cell.attributes.rowspan;

        const toInsertMap = new Map();
        if (cell.attributes.colspan > 1) {
            toInsertMap.set(curRow, {
                from: curCol + 1,
                to: toCol,
            });
        }

        if (cell.attributes.rowspan > 1) {
            for (let row = curRow + 1; row < toRow; row++) {
                toInsertMap.set(row, {
                    from: curCol,
                    to: toCol,
                });
            }
        }

        cell.attributes.colspan = 1;
        cell.attributes.rowspan = 1;
        let lastInseredRow = curRow - 1;
        startIdx++;
        for (; startIdx < tableBlock.innerBlocks.length; startIdx++) {
            const cell = tableBlock.innerBlocks[
                startIdx
            ] as TablebergCellInstance;
            const row = cell.attributes.row;

            if (row === lastInseredRow || row >= toRow) {
                const lastToRow = toRow - 1;
                if (lastInseredRow < lastToRow) {
                    const toInserts = toInsertMap.get(lastToRow);
                    for (let col = toInserts.from; col < toInserts.to; col++) {
                        newCells.push(createSingleCell(lastToRow, col, false));
                    }
                    lastInseredRow = lastToRow;
                }
                newCells.push(cell);
                continue;
            }

            const toInserts = toInsertMap.get(row);
            if (!toInserts) {
                newCells.push(cell);
                continue;
            }
            const prevRow = cell.attributes.row - 1;
            if (lastInseredRow !== prevRow) {
                const prevInsert = toInsertMap.get(prevRow);
                if (prevInsert) {
                    for (
                        let col = prevInsert.from;
                        col < prevInsert.to;
                        col++
                    ) {
                        newCells.push(createSingleCell(prevRow, col, false));
                    }
                }
                lastInseredRow = prevRow;
            }

            if (toInserts.from > cell.attributes.col) {
                newCells.push(cell);
                continue;
            }

            for (let col = toInserts.from; col < toInserts.to; col++) {
                newCells.push(createSingleCell(row, col, false));
            }
            lastInseredRow = row;
            newCells.push(cell);
        }

        const lastToRow = toRow - 1;

        if (lastInseredRow < lastToRow) {
            const toInserts = toInsertMap.get(lastToRow);
            for (let col = toInserts.from; col < toInserts.to; col++) {
                newCells.push(createSingleCell(lastToRow, col, false));
            }
        }

        storeActions.updateBlockAttributes(tableBlock.clientId, {
            cells: newCells.length,
        });
        storeActions.replaceInnerBlocks(tableBlock.clientId, newCells);
    };

    return {
        endCellMultiSelect,
        isCellSelected,
        isMergable,
        addMergingEvt: (el?: HTMLElement) => {
            el?.addEventListener("pointerdown", elClickEvt, { capture: true });
        },
        mergeCells,
        unMergeCells,
    };
};

function edit(
    props: BlockEditProps<TablebergCellBlockAttrs> & { proProps?: any },
) {
    const { clientId, attributes, setAttributes, isSelected } = props;
    const cellRef = useRef<HTMLTableCellElement>();
    useBlockEditingMode(attributes.isTmp ? "disabled" : "default");

    const storeActions: BlockEditorStoreActions = useDispatch(
        blockEditorStore,
    ) as any;

    const {
        storeSelect,
        tableBlock,
        childBlocks,
        isOddRow,
        isHeaderRow,
        isFooterRow,
        rowStyle,
        colBorders,
        rowBorders,
        colRadius,
        rowRadius,
    } = useSelect(
        (select) => {
            const storeSelect = select(
                blockEditorStore,
            ) as BlockEditorStoreSelectors;

            const parentBlocks = storeSelect.getBlockParents(clientId);

            const tableBlockId = parentBlocks.find(
                (parentId: string) =>
                    storeSelect.getBlockName(parentId) === "tableberg/table",
            )!;

            const tableBlock: BlockInstance<TablebergBlockAttrs> =
                storeSelect.getBlock(tableBlockId)! as any;

            const childBlocks = storeSelect.getBlock(clientId)?.innerBlocks;

            const headerEnabled = tableBlock.attributes.enableTableHeader;

            const rowStyle =
                tableBlock.attributes.rowStyles[attributes.row] || {};
            const colStyle =
                tableBlock.attributes.colStyles[attributes.col] || {};

            const colBorders = getBorderVariablesCss(colStyle?.border, "col");
            const rowBorders = getBorderVariablesCss(rowStyle?.border, "row");

            const colRadius = getBorderRadiusVar(
                colStyle?.borderRadius,
                "--tableberg-col",
            );

            const rowRadius = getBorderRadiusVar(
                rowStyle?.borderRadius,
                "--tableberg-row",
            );

            return {
                storeSelect,
                tableBlock,
                tableBlockId,
                childBlocks,
                isOddRow: (attributes.row + (headerEnabled ? 0 : 1)) % 2 == 1,
                isHeaderRow: headerEnabled && attributes.row === 0,
                isFooterRow:
                    tableBlock.attributes.enableTableFooter &&
                    attributes.row + 1 === tableBlock.attributes.rows,
                rowStyle,
                colBorders,
                rowBorders,
                colRadius,
                rowRadius,
            };
        },
        [clientId],
    );
    const {
        isMergable,
        addMergingEvt,
        isCellSelected,
        mergeCells,
        unMergeCells,
    } = useMerging(clientId, tableBlock, storeActions);

    const { hasSelected, isParagraphSelected } = useSelect(
        (select) => {
            let hasSelected = false;

            if (isSelected) {
                return {
                    hasSelected,
                };
            }

            const sel = select(blockEditorStore) as BlockEditorStoreSelectors;
            const selectedBlock = sel.getSelectedBlock();
            if (!selectedBlock) {
                return { hasSelected };
            }

            const selParents = sel.getBlockParents(selectedBlock.clientId);

            hasSelected = selParents.findIndex((val) => val === clientId) > -1;

            return {
                hasSelected,
                isParagraphSelected: selectedBlock.name === "core/paragraph",
            };
        },
        [isSelected],
    );

    const blockProps = useBlockProps({
        style: {
            verticalAlign:
                attributes.vAlign === "center" ? "middle" : attributes.vAlign,
            height: rowStyle.height,
            background: attributes.bgGradient || attributes.background,
            "--tableberg-block-spacing":
                attributes.blockSpacing?.[0] !== "0"
                    ? getSpacingCssSingle(attributes.blockSpacing)
                    : undefined,
            ...colBorders,
            ...rowBorders,
            ...colRadius,
            ...rowRadius,
        },
        ref: cellRef,
        className: classNames({
            "tableberg-odd-row-cell": isOddRow,
            "tableberg-even-row-cell": !isOddRow,
            "tableberg-header-cell": isHeaderRow,
            "tableberg-footer-cell": isFooterRow,
            "tableberg-has-selected": hasSelected,
            "is-multi-selected": isCellSelected(
                tableBlock.clientId,
                attributes.row,
                attributes.col,
            ),
        }),
    });

    const innerBlocksProps = useInnerBlocksProps({
        allowedBlocks: ALLOWED_BLOCKS,
        template: CELL_TEMPLATE,
        renderAppender: false,
        className: classNames({
            "tableberg-cell-inner": true,
            "tableberg-cell-horizontal": attributes.isHorizontal,
        }),
        style: {
            justifyContent: attributes.justifyContent,
            flexWrap: (attributes.wrapItems ? "wrap" : "nowrap") as any,
        },
    });

    useEffect(() => {
        cellRef.current?.addEventListener(
            "keydown",
            (evt) => {
                if (evt.key !== "Backspace") {
                    return;
                }
                const innerBlocks: BlockInstance[] =
                    storeSelect.getBlocks(clientId);
                if (innerBlocks.length > 1) {
                    return;
                }
                const block = innerBlocks[0];
                if (
                    block.name === "core/paragraph" &&
                    (!block.attributes.content ||
                        !block.attributes.content.length)
                ) {
                    evt.preventDefault();
                    evt.stopImmediatePropagation();
                }
            },
            { capture: true },
        );
        addMergingEvt(cellRef.current);
    }, [cellRef.current]);

    useEffect(() => {
        const pro = props.proProps;
        if (pro?.DragNDropSorting && cellRef.current) {
            const dins = new pro.DragNDropSorting(
                cellRef.current,
                attributes.row,
                attributes.col,
                attributes.rowspan,
                attributes.colspan,
                pro.makeMove,
            );
            return () => dins.remove();
        }
    }, [cellRef.current, attributes.row, attributes.col]);
    const [upsell, setUpsell] = useState<string | null>(null);

    const tableControls: DropdownOption[] = [
        {
            icon: tableRowBefore,
            title: "Insert row before",
            onClick: () => addRow(tableBlock, storeActions, attributes.row),
        },
        {
            icon: tableRowAfter,
            title: "Insert row after",
            onClick: () =>
                addRow(
                    tableBlock,
                    storeActions,
                    attributes.row + attributes.rowspan,
                ),
        },
        {
            icon: tableColumnBefore,
            title: "Insert column before",
            onClick: () => addCol(tableBlock, storeActions, attributes.col),
        },
        {
            icon: tableColumnAfter,
            title: "Insert column after",
            onClick: () =>
                addCol(
                    tableBlock,
                    storeActions,
                    attributes.col + attributes.colspan,
                ),
        },
        {
            icon: tableRowDelete,
            title: "Delete row",
            onClick: () =>
                deleteRow(
                    tableBlock,
                    storeActions,
                    attributes.row,
                    attributes.rowspan,
                ),
        },
        {
            icon: tableColumnDelete,
            title: "Delete column",
            onClick: () =>
                deleteCol(
                    tableBlock,
                    storeActions,
                    attributes.col,
                    attributes.colspan,
                ),
        },
    ];

    let tableControlsPro: DropdownOption[] = [];

    if (!IS_PRO) {
        tableControlsPro = [
            {
                icon: DuplicateRowIcon,
                title: "[PRO] Duplicate this row",
                onClick: () => {
                    setUpsell("duplicate-row-col");
                },
            },
            {
                icon: DuplicateColumnIcon,
                title: "[PRO] Duplicate this column",
                onClick: () => {
                    setUpsell("duplicate-row-col");
                },
            },
            {
                icon: arrowRight,
                title: "[PRO] Move column right",
                onClick: () => {
                    setUpsell("move-row-col");
                },
            },
            {
                icon: arrowLeft,
                title: "[PRO] Move column left",
                onClick: () => {
                    setUpsell("move-row-col");
                },
            },
            {
                icon: arrowUp,
                title: "[PRO] Move row up",
                onClick: () => {
                    setUpsell("move-row-col");
                },
            },
            {
                icon: arrowDown,
                title: "[PRO] Move row down",
                onClick: () => {
                    setUpsell("move-row-col");
                },
            },
        ];
    }

    if (isMergable()) {
        tableControls.push({
            icon: table,
            title: "Merge",
            onClick: mergeCells,
        });
    }

    if (attributes.colspan > 1 || attributes.rowspan > 1) {
        tableControls.push({
            icon: table,
            title: "Split Cells",
            onClick: unMergeCells,
        });
    }

    const TagName = attributes.tagName ?? "td";

    const setVAlign = (newValue: "bottom" | "center" | "top") => {
        setAttributes({ vAlign: newValue });
    };

    const changeChildrenAlign = (align: string | undefined) => {
        childBlocks?.forEach((block) => {
            storeActions.updateBlockAttributes(block.clientId, { align });
        });
    };

    return (
        <>
            <TablebergCtx.Consumer>
                {({ rootEl, render }) => {
                    let targetEl;
                    if (render === "primary") {
                        if (!attributes.isTmp)
                            targetEl =
                                rootEl?.querySelector("tbody")?.children?.[
                                    attributes.row
                                ];
                    } else if (attributes.responsiveTarget) {
                        targetEl = rootEl?.querySelector(
                            attributes.responsiveTarget,
                        );
                    }

                    return targetEl ? (
                        createPortal(
                            <TagName
                                {...blockProps}
                                rowSpan={attributes.rowspan}
                                colSpan={attributes.colspan}
                            >
                                <div {...innerBlocksProps} />
                            </TagName>,
                            targetEl,
                        )
                    ) : (
                        <TagName
                            {...blockProps}
                            rowSpan={attributes.rowspan}
                            colSpan={attributes.colspan}
                        />
                    );
                }}
            </TablebergCtx.Consumer>
            {cellRef.current &&
                (isSelected || (hasSelected && !isParagraphSelected)) &&
                createPortal(
                    <div className="tableberg-appender-wrapper">
                        <ButtonBlockAppender
                            className="tablberg-block-appender"
                            rootClientId={clientId}
                        />
                    </div>,
                    cellRef.current,
                )}
            <BlockControls group="block">
                <BlockVerticalAlignmentToolbar
                    value={attributes.vAlign}
                    onChange={setVAlign}
                />
                <ToolbarWithDropdown
                    icon={alignNone}
                    title="Align cell children"
                    onChange={changeChildrenAlign}
                    value={undefined}
                    controlset="alignment"
                />
            </BlockControls>

            <BlockControls group="other" __experimentalShareWithChildBlocks>
                <ToolbarDropdownMenu
                    icon={table}
                    label={"Edit table"}
                    controls={tableControls}
                />
            </BlockControls>
            {!IS_PRO && (
                <>
                    <BlockControls
                        group="other"
                        __experimentalShareWithChildBlocks
                    >
                        <ToolbarDropdownMenu
                            icon={TablebergProIcon}
                            label={"[PRO] Edit table"}
                            controls={tableControlsPro}
                        />
                    </BlockControls>
                    {upsell &&
                        createPortal(
                            <UpsellEnhancedModal
                                selected={upsell}
                                onClose={() => setUpsell(null)}
                            />,
                            document.body,
                        )}
                </>
            )}
            <TablebergControls
                clientId={clientId}
                attributes={attributes}
                setAttributes={setAttributes}
            />
        </>
    );
}

function save(props: BlockSaveProps<TablebergCellBlockAttrs>) {
    const { attributes } = props;
    const blockProps = useBlockProps.save();
    const innerBlocksProps = useInnerBlocksProps.save(blockProps);
    const TagName = attributes.tagName ?? "td";
    return (
        <TagName {...(attributes.isEmpty ? blockProps : innerBlocksProps)} />
    );
}

// @ts-ignore This is a weird case.
// Need to investigate further why this is happening
registerBlockType(metadata.name, {
    title: metadata.title,
    category: metadata.category,
    attributes: metadata.attributes,
    example: {},
    edit,
    save,
});
