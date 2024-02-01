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
import { getOwnerDocument } from "../store/const";

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

    const newCellTemplates: InnerBlockTemplate[] = Array(
        tableBlock.attributes.cols - skipCount,
    );
    let newTemIdx = 0;
    for (let i = 0; i < tableBlock.attributes.cols; i++) {
        const skip = skipCols.get(i);
        if (skip) {
            i += skip;
        } else {
            newCellTemplates[newTemIdx++] = [
                "tableberg/cell",
                {
                    col: i,
                    row: rowIndex,
                },
            ];
        }
    }

    createBlocksFromInnerBlocksTemplate(newCellTemplates).forEach((cell) => {
        cellBlocks.push(cell as TablebergCellInstance);
    });

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

const addCol = (
    tableBlock: BlockInstance<TablebergBlockAttrs>,
    storeActions: BlockEditorStoreActions,
    colIndex: number,
) => {
    const cellBlocks: TablebergCellInstance[] = Array(
        tableBlock.innerBlocks.length,
    );
    const colWidths = tableBlock.attributes.colWidths;
    let lastIndex = 0,
        lastInsertedRow = -1,
        lastRow = 0;

    tableBlock.innerBlocks.forEach((cell) => {
        const attrs = cell.attributes as TablebergCellBlockAttrs;
        if (attrs.col < colIndex && attrs.col + attrs.colspan > colIndex) {
            attrs.colspan += 1;

            lastInsertedRow = attrs.row + attrs.rowspan - 1;

            lastRow = attrs.row;
            cellBlocks[lastIndex++] = cell as TablebergCellInstance;
            return;
        }

        if (lastInsertedRow >= attrs.row) {
            cellBlocks[lastIndex++] = cell as TablebergCellInstance;
            return;
        }

        if (attrs.col < colIndex) {
            const prevRow = attrs.row - 1;

            if (lastInsertedRow == prevRow) {
                cellBlocks[lastIndex++] = cell as TablebergCellInstance;
                lastRow = attrs.row;
                return;
            }
            const toInsertCount = prevRow - lastInsertedRow;

            for (let i = 0; i < toInsertCount; i++) {
                const row = prevRow + i;

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
        lastRow = attrs.row;
    });

    lastInsertedRow++;

    for (; lastInsertedRow < tableBlock.attributes.rows; lastInsertedRow++) {
        cellBlocks[lastIndex++] = createSingleCell(lastInsertedRow, colIndex);
    }

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

    const { cell, storeSelect } = useSelect((select) => {
        const storeSelect = select(
            blockEditorStore,
        ) as BlockEditorStoreSelectors;
        const cell = storeSelect.getBlock(clientId)!;
        return { cell, storeSelect };
    }, []);

    const docClickEvt = (evt: Event) => {};

    const elClickEvt = function (this: HTMLElement, evt: MouseEvent) {
        if (!evt.ctrlKey) {
            return;
        }
        evt.preventDefault();
        evt.stopPropagation();
        toggleCellSelection(cell as any);
    };

    const cleanUpMerging = () => {
        document.removeEventListener("click", docClickEvt);
    };

    const mergeCells = () => {
        const cells: TablebergCellInstance[] = [];
        getCurrentSelectedCells().forEach((cellId) => {
            cells.push(storeSelect.getBlock(cellId)! as TablebergCellInstance);
        });
        cells.sort((a, b) => {
            const rowDiff = a.attributes.row - b.attributes.row;
            if (rowDiff == 0) {
                return a.attributes.col - b.attributes.col;
            }
            return rowDiff;
        });

        const destination = cells[0];
        const toRemoves: string[] = [];
        for (let i = 1; i < cells.length; i++) {
            storeActions.moveBlocksToPosition(
                cells[i].innerBlocks.map((b) => b.clientId),
                cells[i].clientId,
                destination.clientId,
                destination.innerBlocks.length,
            );
            toRemoves.push(cells[i].clientId);
        }

        const newSpans = getSpans();
        storeActions.updateBlockAttributes(destination.clientId, {
            colspan: newSpans.col,
            rowspan: newSpans.row,
        });
        storeActions.removeBlocks(toRemoves);

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
        cleanUpMerging,
        mergeCells,
    };
};

function edit(props: BlockEditProps<TablebergCellBlockAttrs>) {
    const { clientId, attributes, setAttributes } = props;
    const cellRef = useRef<HTMLTableCellElement>();

    const storeActions = useDispatch(
        blockEditorStore,
    ) as BlockEditorStoreActions;
    const {
        isMergable,
        cleanUpMerging,
        addMergingEvt,
        getClassName,
        mergeCells,
    } = useMerging(clientId, storeActions);

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
        return cleanUpMerging;
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
        const id = `#tableberg-${tableBlockId}-row-${attributes.row}`;
        const el = getOwnerDocument().querySelector(id)!;
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
