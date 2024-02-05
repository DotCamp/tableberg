import {
    BlockEditProps,
    registerBlockType,
    createBlocksFromInnerBlocksTemplate,
    BlockInstance,
    BlockSaveProps,
    InnerBlockTemplate,
} from "@wordpress/blocks";
import {
    BlockVerticalAlignmentToolbar,
    BlockControls,
    store as blockEditorStore,
} from "@wordpress/block-editor";
import { useBlockProps, useInnerBlocksProps } from "@wordpress/block-editor";
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

import { store as tbStore } from "../store";

import "./style.scss";
import "./editor.scss";

import metadata from "./block.json";
import { useEffect, useRef, useState } from "react";
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

const createSingleCell = (row: number, col: number): TablebergCellInstance => {
    return createBlocksFromInnerBlocksTemplate([
        [
            "tableberg/cell",
            {
                col: col,
                row,
            },
        ],
    ])[0] as TablebergCellInstance;
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
            cellBlocks.push(createSingleCell(rowIndex, i));
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
    colIndex: number,
) => {
    const cellBlocks: TablebergCellInstance[] = Array(
        tableBlock.innerBlocks.length,
    );
    let lastIndex = 0,
    lastInsertedRow = -1;
    
    tableBlock.innerBlocks.forEach((cell) => {
        const attrs = cell.attributes as TablebergCellBlockAttrs;
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
                cellBlocks[lastIndex++] = createSingleCell(row, colIndex);
            }
            lastInsertedRow = prevRow;
        } else {
            const missedCount = attrs.row - lastInsertedRow;
            for (let i = 1; i <= missedCount; i++) {
                const row = lastInsertedRow + i;
                cellBlocks[lastIndex++] = createSingleCell(row, colIndex);
            }
            lastInsertedRow = attrs.row;
        }

        cellBlocks[lastIndex++] = cell as TablebergCellInstance;
    });
    
    lastInsertedRow++;
    for (; lastInsertedRow < tableBlock.attributes.rows; lastInsertedRow++) {
        cellBlocks[lastIndex++] = createSingleCell(lastInsertedRow, colIndex);
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
    colIndex: number,
) => {
    const cellBlocks: TablebergCellInstance[] = Array(
        tableBlock.innerBlocks.length - tableBlock.attributes.rows,
    );

    let lastIdx = 0;

    tableBlock.innerBlocks.forEach((cell) => {
        if (cell.attributes.col === colIndex) {
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
    rowIndex: number,
) => {
    const cellBlocks: TablebergCellInstance[] = Array(
        tableBlock.innerBlocks.length - tableBlock.attributes.cols,
    );
    let lastIdx = 0;

    tableBlock.innerBlocks.forEach((cell) => {
        if (cell.attributes.row === rowIndex) {
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
    storeActions: BlockEditorStoreActions,
) => {
    const { toggleCellSelection, endCellMultiSelect } = useDispatch(tbStore);
    const { getCurrentSelectedCells, getClassName, isMergable, getSpans } =
        useSelect((select) => {
            const {
                getCurrentSelectedCells,
                isMergable,
                getClassName,
                getSpans,
            } = select(tbStore);
            const isInMultiSelectMode = () =>
                getCurrentSelectedCells().size > 0;
            return {
                getCurrentSelectedCells,
                isInMultiSelectMode,
                isMergable,
                getClassName,
                getSpans,
            };
        }, []);

    const storeSelect = useSelect((select) => {
        return select(blockEditorStore) as BlockEditorStoreSelectors;
    }, []);

    const elClickEvt = function (this: HTMLElement, evt: MouseEvent) {
        const focus = storeSelect.getSelectedBlock();
        if ((!evt.ctrlKey && !evt.metaKey && getCurrentSelectedCells().size === 0) || !focus) {
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

        const cell = storeSelect.getBlock(clientId) as any;

        if (!focusedCell || focusedCell.clientId === clientId) {
            return;
        }
        if (!getCurrentSelectedCells().has(focusedCell.clientId)) {
            toggleCellSelection(focusedCell);
        }

        if (evt.metaKey || evt.ctrlKey) {
            evt.stopPropagation();
            evt.preventDefault();
            toggleCellSelection(cell);
        } else {
            endCellMultiSelect();
        }
    };

    const mergeCells = () => {
        const cells: TablebergCellInstance[] = [];
        let destination: TablebergCellInstance | undefined;
        getCurrentSelectedCells().forEach((cellId) => {
            const cell = storeSelect.getBlock(cellId)! as TablebergCellInstance;
            if (!destination) {
                destination = cell;
            } else if (
                cell.attributes.col <= destination.attributes.col &&
                cell.attributes.row <= destination.attributes.row
            ) {
                destination = cell;
            }
            cells.push(cell);
        });
        if (!destination) {
            return;
        }

        cells.sort((b, a) => {
            const rowDiff = a.attributes.row - b.attributes.row;
            if (rowDiff == 0) {
                return a.attributes.col - b.attributes.col;
            }
            return rowDiff;
        });

        let { rowHeights, colWidths, rows, cols } = tableBlock.attributes;

        const toRemoves: string[] = [];
        for (let i = 0; i < cells.length; i++) {
            if (cells[i].clientId === destination.clientId) {
                continue;
            }
            storeActions.moveBlocksToPosition(
                cells[i].innerBlocks.map((b) => b.clientId),
                cells[i].clientId,
                destination.clientId,
                destination.innerBlocks.length,
            );
            toRemoves.push(cells[i].clientId);
        }

        const oldSpans = getSpans();
        const newSpans = {...oldSpans};
        let removeRows = 0,
            removeCols = 0;
        if (oldSpans.col == tableBlock.attributes.cols && oldSpans.row > 1) {
            removeRows = oldSpans.row - 1;
            rowHeights.splice(destination.attributes.row, removeCols);
            newSpans.row = 1;
        }
        if (oldSpans.row == tableBlock.attributes.rows && oldSpans.col > 1) {
            removeCols = oldSpans.col - 1;
            colWidths.splice(destination.attributes.col, removeCols);
            newSpans.col = 1;
        }

        
        if (removeRows || removeCols) {
            const updatedCells: TablebergCellInstance[] = Array(tableBlock.innerBlocks.length);
            let lastIdx = 0;
            // @ts-ignore
            tableBlock.innerBlocks.forEach((cell: TablebergCellInstance) => {
                if (removeRows && cell.attributes.row > destination!.attributes.row) {
                    cell.attributes.row -= removeRows;
                }
                if (removeCols && cell.attributes.col > destination!.attributes.col) {
                    cell.attributes.col -= removeCols;
                }
                updatedCells[lastIdx++] = cell;
            })
            rows -= removeRows;
            cols -= removeCols;
            storeActions.replaceInnerBlocks(tableBlock.clientId, updatedCells);
        }

        storeActions.updateBlockAttributes(destination.clientId, {
            colspan: newSpans.col,
            rowspan: newSpans.row,
        });
        storeActions.removeBlocks(toRemoves);
        storeActions.updateBlockAttributes(tableBlock.clientId, {
            cells: tableBlock.attributes.cells - toRemoves.length,
            colWidths,
            rowHeights,
            rows,
            cols
        });

        endCellMultiSelect();
    };

    return {
        toggleCellSelection,
        endCellMultiSelect,
        getClassName,
        isMergable,
        addMergingEvt: (el?: HTMLElement) => {
            el?.addEventListener("mousedown", elClickEvt, { capture: true });
        },
        mergeCells,
    };
};

function edit(props: BlockEditProps<TablebergCellBlockAttrs>) {
    const { clientId, attributes, setAttributes } = props;
    const cellRef = useRef<HTMLTableCellElement>();

    const storeActions = useDispatch(
        blockEditorStore,
    ) as BlockEditorStoreActions;

    const { storeSelect, tableBlock, tableBlockId } = useSelect((select) => {
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

        return {
            storeSelect,
            tableBlock,
            tableBlockId,
        };
    }, []);
    const { isMergable, addMergingEvt, getClassName, mergeCells } = useMerging(
        clientId,
        tableBlock,
        storeActions,
    );

    const blockProps = useBlockProps({
        style: {
            verticalAlign:
                attributes.vAlign === "center" ? "middle" : attributes.vAlign,
            height: tableBlock.attributes.rowHeights[props.attributes.row],
        },
        ref: cellRef,
        className: getClassName(clientId),
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
                    evt.stopPropagation();
                }
            },
            { capture: true },
        );
        addMergingEvt(cellRef.current);
    }, [cellRef.current]);

    const tableControls = [
        {
            icon: tableRowBefore,
            title: "Insert row before",
            onClick: () => addRow(tableBlock, storeActions, attributes.row),
        },
        {
            icon: tableRowAfter,
            title: "Insert row after",
            onClick: () => addRow(tableBlock, storeActions, attributes.row + 1),
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
            onClick: () => deleteRow(tableBlock, storeActions, attributes.row),
        },
        {
            icon: tableColumnDelete,
            title: "Delete column",
            onClick: () => deleteCol(tableBlock, storeActions, attributes.col),
        },
        {
            icon: table,
            title: "Merge",
            onClick: mergeCells,
            isDisabled: !isMergable(),
        },
    ];

    const TagName = attributes.tagName ?? "td";

    const [targetEl, setTargetEl] = useState<Element>();

    useEffect(() => {
        const iframe = document.querySelector<HTMLIFrameElement>(
            'iframe[name="editor-canvas"]',
        );
        const id = `#tableberg-${tableBlockId}-row-${attributes.row}`;
        const el = (iframe?.contentWindow?.document || document).querySelector(
            id,
        )!;
        el && setTargetEl(el);
    }, [attributes.row]);

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

    return (
        <>
            {targetEl ? (
                createPortal(
                    <TagName
                        {...innerBlocksProps}
                        rowSpan={attributes.rowspan}
                        colSpan={attributes.colspan}
                    />,
                    targetEl,
                )
            ) : (
                <TagName
                    {...innerBlocksProps}
                    rowSpan={attributes.rowspan}
                    colSpan={attributes.colspan}
                />
            )}
            <BlockControls group="block">
                <BlockVerticalAlignmentToolbar
                    value={attributes.vAlign}
                    onChange={setVAlign}
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
