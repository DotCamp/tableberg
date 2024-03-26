import {
    BlockEditProps,
    registerBlockType,
    BlockInstance,
    BlockSaveProps,
    InnerBlockTemplate,
    createBlock,
} from "@wordpress/blocks";
import {
    BlockVerticalAlignmentToolbar,
    BlockAlignmentToolbar,
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
import {
    tableRowBefore,
    tableRowAfter,
    tableRowDelete,
    tableColumnAfter,
    tableColumnBefore,
    tableColumnDelete,
    table,
} from "@wordpress/icons";

import classNames from "classnames";

import { store as tbStore } from "../store";
import { TablebergCtx } from "../";

import "./style.scss";
import "./editor.scss";

import metadata from "./block.json";
import { Fragment, useEffect, useRef } from "react";
import CellControls from "./controls";
import { createPortal } from "react-dom";
import { TablebergBlockAttrs } from "../types";

export interface TablebergCellBlockAttrs {
    vAlign: "bottom" | "center" | "top";
    tagName: "td" | "th";
    rowspan: number;
    colspan: number;
    row: number;
    col: number;
    responsiveTarget: string;
    isTmp: boolean;
}

export type TablebergCellInstance = BlockInstance<TablebergCellBlockAttrs>;

const ALLOWED_BLOCKS = [
    "core/paragraph",
    "tableberg/button",
    "tableberg/image",
    "core/list",
];

const CELL_TEMPLATE: InnerBlockTemplate[] = [
    [
        "core/paragraph",
        {
            style: {
                spacing: {
                    margin: {
                        top: "0",
                        bottom: "0",
                    },
                },
            },
        },
    ],
];

const createSingleCell = (
    row: number,
    col: number,
    isHeader: boolean
): TablebergCellInstance => {
    return createBlock("tableberg/cell", {
        col: col,
        row,
        tagName: isHeader ? "th" : "td",
    }) as TablebergCellInstance;
};

const addRow = (
    tableBlock: BlockInstance<TablebergBlockAttrs>,
    storeActions: BlockEditorStoreActions,
    rowIndex: number
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

    const rowHeights = tableBlock.attributes.rowHeights;
    let toInsert = "";
    for (let i = rowIndex; i < rowHeights.length; i++) {
        const old = rowHeights[i];
        rowHeights[i] = toInsert;
        toInsert = old;
    }
    rowHeights.push(toInsert);

    storeActions.replaceInnerBlocks(tableBlock.clientId, cellBlocks, false);
    storeActions.updateBlockAttributes(tableBlock.clientId, {
        rows: tableBlock.attributes.rows + 1,
        cells: cellBlocks.length,
        rowHeights,
    });
};

const addCol = (
    tableBlock: BlockInstance<TablebergBlockAttrs>,
    storeActions: BlockEditorStoreActions,
    colIndex: number
) => {
    const cellBlocks: TablebergCellInstance[] = Array(
        tableBlock.innerBlocks.length
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
                    )
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
                    )
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
            !!(tableBlock.attributes.enableTableHeader && lastInsertedRow == 0)
        );
    }

    const colWidths = tableBlock.attributes.colWidths;
    let toInsertRowHeight = "";
    for (let i = colIndex; i < colWidths.length; i++) {
        const old = colWidths[i];
        colWidths[i] = toInsertRowHeight;
        toInsertRowHeight = old;
    }
    colWidths.push(toInsertRowHeight);

    storeActions.replaceInnerBlocks(tableBlock.clientId, cellBlocks, false);
    storeActions.updateBlockAttributes(tableBlock.clientId, {
        cols: tableBlock.attributes.cols + 1,
        cells: cellBlocks.length,
        colWidths,
    });
};

const deleteCol = (
    tableBlock: BlockInstance<TablebergBlockAttrs>,
    storeActions: BlockEditorStoreActions,
    colIndex: number
) => {
    const cellBlocks: TablebergCellInstance[] = Array(
        tableBlock.innerBlocks.length - tableBlock.attributes.rows
    );

    let lastIdx = 0;

    tableBlock.innerBlocks.forEach((cell) => {
        if (cell.attributes.col === colIndex || cell.attributes.isTmp) {
            return;
        }
        if (cell.attributes.col > colIndex) {
            cell.attributes.col -= 1;
        } else if (
            cell.attributes.col < colIndex &&
            cell.attributes.col + cell.attributes.colspan > colIndex
        ) {
            cell.attributes.colspan -= 1;
        }
        cellBlocks[lastIdx++] = cell as any;
    });
    const colWidths = tableBlock.attributes.colWidths;
    colWidths.splice(colIndex, 1);

    storeActions.replaceInnerBlocks(tableBlock.clientId, cellBlocks, false);
    storeActions.updateBlockAttributes(tableBlock.clientId, {
        cols: tableBlock.attributes.cols - 1,
        cells: cellBlocks.length,
        colWidths,
    });
};

const deleteRow = (
    tableBlock: BlockInstance<TablebergBlockAttrs>,
    storeActions: BlockEditorStoreActions,
    rowIndex: number
) => {
    const cellBlocks: TablebergCellInstance[] = Array(
        tableBlock.innerBlocks.length - tableBlock.attributes.cols
    );
    let lastIdx = 0;

    tableBlock.innerBlocks.forEach((cell) => {
        if (cell.attributes.row === rowIndex || cell.attributes.isTmp) {
            return;
        }
        if (cell.attributes.row > rowIndex) {
            cell.attributes.row -= 1;
        } else if (
            cell.attributes.row < rowIndex &&
            cell.attributes.row + cell.attributes.rowspan > rowIndex
        ) {
            cell.attributes.rowspan -= 1;
        }
        cellBlocks[lastIdx++] = cell as any;
    });
    const rowHeights = tableBlock.attributes.rowHeights;
    rowHeights.splice(rowIndex, 1);

    storeActions.replaceInnerBlocks(tableBlock.clientId, cellBlocks, false);
    storeActions.updateBlockAttributes(tableBlock.clientId, {
        rows: tableBlock.attributes.rows - 1,
        cells: cellBlocks.length,
        rowHeights,
    });
};

const useMerging = (
    clientId: string,
    tableBlock: BlockInstance<TablebergBlockAttrs>,
    storeActions: BlockEditorStoreActions
) => {
    const { selectForMerge, endCellMultiSelect } = useDispatch(tbStore);
    const { getClassName, isMergable, getSpans, getIndexes } = useSelect(
        (select) => {
            const { getIndexes, getClassName, getSpans } = select(tbStore);

            return {
                getIndexes,
                isMergable: () => getIndexes(tableBlock.clientId),
                getClassName,
                getSpans,
            };
        },
        []
    );

    const storeSelect = useSelect((select) => {
        return select(blockEditorStore) as BlockEditorStoreSelectors;
    }, []);

    const elClickEvt = function (this: HTMLElement, evt: MouseEvent) {
        if (!evt.shiftKey) {
            if (getIndexes(tableBlock.clientId)) {
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

        const cell: TablebergCellInstance = storeSelect.getBlock(
            clientId
        ) as any;

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
            to
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

        let { rowHeights, colWidths, rows, cols } = tableBlock.attributes;

        storeActions.updateBlockAttributes(tableBlock.clientId, {
            cells: tableBlock.attributes.cells - cells.length,
        });

        const toRemoves: string[] = [];
        for (let i = 0; i < cells.length; i++) {
            storeActions.moveBlocksToPosition(
                cells[i].innerBlocks.reduce<string[]>((prev, b) => {
                    if (b.name !== "core/paragraph" || b.attributes.content?.text) {
                        prev.push(b.clientId);
                    } else {
                        toRemoves.push(b.clientId);
                    }
                    return prev;
                }, []),
                cells[i].clientId,
                destination.clientId,
                destination.innerBlocks.length
            );
            toRemoves.push(cells[i].clientId);
        }

        const oldSpans = getSpans();
        const newSpans = { ...oldSpans };
        let removeRows = 0,
            removeCols = 0;
        if (oldSpans.col == tableBlock.attributes.cols && oldSpans.row > 1) {
            removeRows = oldSpans.row - 1;
            rowHeights.splice(destination.attributes.row, removeRows);
            newSpans.row = 1;
        }
        if (oldSpans.row == tableBlock.attributes.rows && oldSpans.col > 1) {
            removeCols = oldSpans.col - 1;
            colWidths.splice(destination.attributes.col, removeCols);
            newSpans.col = 1;
        }

        if (removeRows || removeCols) {
            const updatedCells: TablebergCellInstance[] = Array(
                tableBlock.innerBlocks.length
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
            colWidths,
            rowHeights,
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
                    for (let col = prevInsert.from; col < prevInsert.to; col++) {
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
        getClassName,
        isMergable,
        addMergingEvt: (el?: HTMLElement) => {
            el?.addEventListener("pointerdown", elClickEvt, { capture: true });
        },
        mergeCells,
        unMergeCells,
    };
};

function edit(props: BlockEditProps<TablebergCellBlockAttrs>) {
    const { clientId, attributes, setAttributes, isSelected } = props;
    const cellRef = useRef<HTMLTableCellElement>();
    useBlockEditingMode(attributes.isTmp ? "disabled" : "default");

    const storeActions = useDispatch(
        blockEditorStore
    ) as BlockEditorStoreActions;

    const { storeSelect, tableBlock, tableBlockId, childBlocks, isOddRow, isHeaderRow, isFooterRow } =
        useSelect((select) => {
            const storeSelect = select(
                blockEditorStore
            ) as BlockEditorStoreSelectors;

            const parentBlocks = storeSelect.getBlockParents(clientId);

            const tableBlockId = parentBlocks.find(
                (parentId: string) =>
                    storeSelect.getBlockName(parentId) === "tableberg/table"
            )!;

            const tableBlock: BlockInstance<TablebergBlockAttrs> =
                storeSelect.getBlock(tableBlockId)! as any;

            const childBlocks = storeSelect.getBlock(clientId)?.innerBlocks;

            const headerEnabled = tableBlock.attributes.enableTableHeader;

            return {
                storeSelect,
                tableBlock,
                tableBlockId,
                childBlocks,
                isOddRow:
                    (attributes.row +
                        ( headerEnabled? 0 : 1)) %
                        2 ==
                    1,
                isHeaderRow: headerEnabled && attributes.row === 0,
                isFooterRow: tableBlock.attributes.enableTableFooter && attributes.row + 1 === tableBlock.attributes.rows
            };
        }, []);
    const {
        isMergable,
        addMergingEvt,
        getClassName,
        mergeCells,
        unMergeCells,
    } = useMerging(clientId, tableBlock, storeActions);

    const { hasSelected } = useSelect(
        (select) => {
            let hasSelected = false;

            if (isSelected) {
                return {
                    hasSelected,
                };
            }

            const sel = select(blockEditorStore) as BlockEditorStoreSelectors;
            const selectedBlock = sel.getSelectedBlockClientId();
            if (!selectedBlock) {
                return { hasSelected };
            }

            const selParents = sel.getBlockParents(selectedBlock);

            hasSelected = selParents.findIndex((val) => val === clientId) > -1;

            return { hasSelected };
        },
        [isSelected]
    );

    const blockProps = useBlockProps({
        style: {
            verticalAlign:
                attributes.vAlign === "center" ? "middle" : attributes.vAlign,
            height: tableBlock.attributes.rowHeights[props.attributes.row],
        },
        ref: cellRef,
        className: classNames(
            getClassName(tableBlock.clientId, attributes.row, attributes.col),
            {
                "tableberg-odd-row-cell": isOddRow,
                "tableberg-even-row-cell": !isOddRow,
                "tableberg-header-cell": isHeaderRow,
                "tableberg-footer-cell": isFooterRow,
                "tableberg-has-selected": hasSelected,
            }
        ),
    });

    const innerBlocksProps = useInnerBlocksProps(blockProps as any, {
        allowedBlocks: ALLOWED_BLOCKS,
        template: CELL_TEMPLATE,
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
                    !block.attributes.content
                ) {
                    evt.preventDefault();
                    evt.stopImmediatePropagation();
                }
            },
            { capture: true }
        );
        addMergingEvt(cellRef.current);
    }, [cellRef.current]);

    const tableControls: Record<string, any>[] = [
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
                    attributes.row + attributes.rowspan
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
                    attributes.col + attributes.colspan
                ),
        },
        {
            icon: tableRowDelete,
            title: "Delete row",
            onClick: () => deleteRow(tableBlock, storeActions, attributes.row),
        },
        {
            icon: tableColumnDelete,
            title: "Delete column",
            onClick: () => deleteCol(tableBlock, storeActions, attributes.col),
        },
    ];

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

    const setRowHeight = (val: string) => {
        const rowHeights = [...tableBlock.attributes.rowHeights];
        rowHeights[attributes.row] = val;
        storeActions.updateBlockAttributes(tableBlockId, {
            rowHeights,
        });
    };
    const setColWidth = (val: string) => {
        const colWidths = [...tableBlock.attributes.colWidths];
        colWidths[attributes.col] = val;
        storeActions.updateBlockAttributes(tableBlockId, {
            colWidths,
        });
    };

    const changeChildrenAlign = (align: BlockAlignmentToolbar.Control) => {
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
                                rootEl?.firstElementChild?.children?.[
                                    attributes.row + 1
                                ];
                    } else if (attributes.responsiveTarget) {
                        targetEl = rootEl?.querySelector(
                            attributes.responsiveTarget
                        );
                    }

                    return targetEl ? (
                        createPortal(
                            <TagName
                                {...innerBlocksProps}
                                rowSpan={attributes.rowspan}
                                colSpan={attributes.colspan}
                            />,
                            targetEl
                        )
                    ) : (
                        <TagName
                            {...innerBlocksProps}
                            rowSpan={attributes.rowspan}
                            colSpan={attributes.colspan}
                        />
                    );
                }}
            </TablebergCtx.Consumer>
            {cellRef.current &&
                !isSelected &&
                hasSelected &&
                createPortal(
                    <div className="tableberg-appender-wrapper">
                        <ButtonBlockAppender
                            className="tablberg-block-appender"
                            rootClientId={clientId}
                        />
                    </div>,
                    cellRef.current
                )}
            <BlockControls group="block">
                <BlockVerticalAlignmentToolbar
                    value={attributes.vAlign}
                    onChange={setVAlign}
                />
                <BlockAlignmentToolbar
                    onChange={changeChildrenAlign}
                    value={undefined}
                />
            </BlockControls>

            <BlockControls group="other" __experimentalShareWithChildBlocks>
                <ToolbarDropdownMenu
                    hasArrowIndicator
                    icon={table}
                    label={"Edit table"}
                    controls={tableControls}
                />
            </BlockControls>
            <CellControls
                height={tableBlock?.attributes.rowHeights[attributes.row]}
                setHeight={setRowHeight}
                width={tableBlock?.attributes.colWidths[attributes.col]}
                setWidth={setColWidth}
            />
        </>
    );
}

function save(props: BlockSaveProps<TablebergCellBlockAttrs>) {
    const { attributes } = props;
    const blockProps = useBlockProps.save();
    const innerBlocksProps = useInnerBlocksProps.save(blockProps);
    const TagName = attributes.tagName ?? "td";
    return <TagName {...innerBlocksProps} />;
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
