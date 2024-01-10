import {
    BlockEditProps,
    registerBlockType,
    createBlocksFromInnerBlocksTemplate,
    createBlock,
    BlockInstance,
    BlockSaveProps,
} from "@wordpress/blocks";
import {
    BlockVerticalAlignmentToolbar,
    BlockControls,
    store as blockEditorStore,
    InspectorControls,
} from "@wordpress/block-editor";
import { useBlockProps, useInnerBlocksProps } from "@wordpress/block-editor";
import { useDispatch, useSelect } from "@wordpress/data";
import { Button, ToolbarDropdownMenu } from "@wordpress/components";
import {
    tableRowBefore,
    tableRowAfter,
    tableRowDelete,
    tableColumnAfter,
    tableColumnBefore,
    tableColumnDelete,
    table,
} from "@wordpress/icons";

import "./style.scss";
import "./editor.scss";

import metadata from "./block.json";
import classNames from "classnames";
import { useEffect, useRef } from "react";
import { store as tbStore } from "../store";
import CellControls from "./controls";

export interface TablebergCellBlockAttrs {
    vAlign: "bottom" | "center" | "top";
    tagName: "td" | "th";
    rowspan: number;
    colspan: number;
}

const ALLOWED_BLOCKS = [
    "core/paragraph",
    "tableberg/button",
    "tableberg/image",
    "core/list",
];

const getEssentialVars = (
    storeSelect: BlockEditorStoreSelectors,
    clientId: string
) => {
    const parentBlocks = storeSelect.getBlockParents(clientId);

    const tableBlockId = parentBlocks.find(
        (parentId: string) =>
            storeSelect.getBlockName(parentId) === "tableberg/table"
    )!;
    const tableBlock = storeSelect.getBlock(tableBlockId)!;

    const currentRowBlockId = parentBlocks.find(
        (parentId: string) =>
            storeSelect.getBlockName(parentId) === "tableberg/row"
    )!;
    const currentRowBlock = storeSelect.getBlock(currentRowBlockId);

    const rowIndex = storeSelect.getBlockIndex(currentRowBlockId);
    const colIndex = storeSelect.getBlockIndex(clientId);

    return {
        tableBlockId,
        tableBlock,
        currentRowBlockId,
        currentRowBlock,
        rowIndex,
        colIndex,
    };
};

function edit(props: BlockEditProps<TablebergCellBlockAttrs>) {
    const { clientId, attributes, setAttributes } = props;
    const { vAlign } = attributes;

    const vAlignChange = (newValue: "bottom" | "center" | "top") => {
        setAttributes({ vAlign: newValue });
    };

    const className = classNames({
        [`align-v-${vAlign}`]: vAlign,
    });

    const cellRef = useRef<HTMLTableCellElement>();

    const {
        tableBlock,
        tableBlockId,
        currentRowBlock,
        currentRowBlockId,
        rowIndex,
        colIndex,
    } = useSelect(
        (select) => getEssentialVars(select(blockEditorStore) as any, clientId),
        []
    );

    const blockProps = useBlockProps({
        className,
        ref: cellRef,
    });

    const innerBlocksProps = useInnerBlocksProps(
        { ...blockProps },
        {
            allowedBlocks: ALLOWED_BLOCKS,
            template: [
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
            ],
        }
    );

    const {
        insertBlock,
        updateBlockAttributes,
        removeBlock,
        moveBlocksToPosition,
        selectBlock,
    } = useDispatch(blockEditorStore) as BlockEditorStoreActions;

    const {
        insertRowToTable,
        deleteRowFromTable,
        insertColumnToTable,
        deleteColumnFromTable,
        isHeader,
        isFooter,
        getBlockParents,
        getBlockName,
        getBlockIndex,
        getBlock,
    } = useSelect(
        (select) => {
            const storeSelect = select(
                blockEditorStore
            ) as BlockEditorStoreSelectors;

            const isHeader = currentRowBlock?.attributes?.isHeader;
            const isFooter = currentRowBlock?.attributes?.isFooter;
            const { rows, cols, colWidths } =
                storeSelect.getBlockAttributes(tableBlockId)!;

            const insertRowToTable = (after = false) => {
                const newRowIndex = after ? rowIndex + 1 : rowIndex;
                const newRowBlock = createBlocksFromInnerBlocksTemplate([
                    [
                        "tableberg/row",
                        {},
                        Array.from({ length: cols }, () => ["tableberg/cell"]),
                    ],
                ])[0];

                insertBlock(newRowBlock, newRowIndex, tableBlockId, true);
                updateBlockAttributes(tableBlockId, {
                    rows: rows + 1,
                });
            };

            const deleteRowFromTable = () => {
                removeBlock(currentRowBlockId, true);
                updateBlockAttributes(tableBlockId, {
                    rows: rows - 1,
                });
            };

            const insertColumnToTable = (after = false) => {
                const newColIndex = after ? colIndex + 1 : colIndex;

                storeSelect
                    .getBlocks(tableBlockId)
                    .forEach((row: BlockInstance, index: number) => {
                        const rowIsHeader = row?.attributes?.isHeader;
                        const rowIsFooter = row?.attributes?.isFooter;

                        insertBlock(
                            createBlock("tableberg/cell", {
                                tagName:
                                    (rowIsHeader || rowIsFooter) &&
                                    (index === 0 ||
                                        index ===
                                            tableBlock.innerBlocks.length - 1)
                                        ? "th"
                                        : "td",
                            }),
                            newColIndex,
                            row.clientId,
                            false
                        );
                    });

                let toInsert = "";
                for (let i = newColIndex; i < colWidths.length; i++) {
                    const old = colWidths[i];
                    colWidths[i] = toInsert;
                    toInsert = old;
                }
                colWidths.push(toInsert);
                updateBlockAttributes(tableBlockId, {
                    cols: cols + 1,
                });
            };

            const deleteColumnFromTable = () => {
                const colIndex = storeSelect.getBlockIndex(clientId);

                storeSelect
                    .getBlocks(tableBlockId)
                    .forEach((row: BlockInstance) => {
                        const cells = storeSelect.getBlockOrder(row.clientId);
                        removeBlock(cells[colIndex]);
                    });

                updateBlockAttributes(tableBlockId, {
                    cols: cols - 1,
                });
            };

            const { getBlockParents, getBlockName, getBlockIndex, getBlock } =
                storeSelect;

            return {
                insertRowToTable,
                deleteRowFromTable,
                insertColumnToTable,
                deleteColumnFromTable,
                currentRowBlock,
                isHeader,
                isFooter,
                tableBlockId,
                getBlockParents,
                getBlockName,
                getBlockIndex,
                getBlock,
            };
        },
        [clientId]
    );

    const onInsertRowBefore = () => {
        insertRowToTable();
    };
    const onInsertRowAfter = () => {
        insertRowToTable(true);
    };
    const onDeleteRow = () => {
        deleteRowFromTable();
    };
    const onInsertColumnBefore = () => {
        insertColumnToTable();
    };
    const onInsertColumnAfter = () => {
        insertColumnToTable(true);
    };
    const onDeleteColumn = () => {
        deleteColumnFromTable();
    };
    const setRowHeight = (newVal: string) => {
        updateBlockAttributes(tableBlockId, {
            height: newVal,
        });
    };

    const setColWidth = (newVal: string) => {
        const colWidths = [...tableBlock.attributes.colWidths];
        colWidths[colIndex] = newVal;
        updateBlockAttributes(tableBlockId, {
            colWidths,
        });
    };

    const { toggleCellSelection, endCellMultiSelect } = useDispatch(tbStore);
    const { getCurrentSelectedCells, isInMultiSelectMode, getCellsStructure } =
        useSelect((select) => {
            const { getCurrentSelectedCells, getCellsStructure } =
                select(tbStore);
            const isInMultiSelectMode = () =>
                getCurrentSelectedCells().length > 0;
            return {
                getCurrentSelectedCells,
                isInMultiSelectMode,
                getCellsStructure,
            };
        }, []);

    const handleClickOutsideTable = (event: MouseEvent) => {
        if (
            !document
                .querySelector(`[data-block="${tableBlockId}"]`)
                ?.contains(event.target as Node) &&
            !(event.target as HTMLDivElement)?.closest(
                ".components-popover__content"
            )
        ) {
            endCellMultiSelect();
            document.removeEventListener("mousedown", handleClickOutsideTable);
        }
    };

    function multiSelectStartListener(event: MouseEvent) {
        if (event.ctrlKey) {
            event.preventDefault();
            event.stopPropagation();
            toggleCellSelection(clientId);
            document.addEventListener("mousedown", handleClickOutsideTable);
            cellRef.current?.classList.add("is-multi-selected");
        }

        cellRef.current
            ?.closest("table")
            ?.querySelectorAll("td")
            .forEach((cell) => {
                cell.removeEventListener("mousedown", multiSelectStartListener);
            });
    }

    useEffect(() => {
        cellRef.current?.addEventListener("mousedown", (event) => {
            if (event.ctrlKey) {
                event.preventDefault();
                event.stopPropagation();
                toggleCellSelection(clientId);
            } else {
                endCellMultiSelect();
                document.removeEventListener(
                    "mousedown",
                    handleClickOutsideTable
                );
            }

            if (!isInMultiSelectMode()) {
                cellRef.current
                    ?.closest("table")
                    ?.querySelectorAll("td")
                    .forEach((cell) => {
                        if (cell.dataset["block"] !== clientId) {
                            cell.addEventListener(
                                "mousedown",
                                multiSelectStartListener
                            );
                        }
                    });
            }
        });
    }, []);

    const isMergeAllowed = () => {
        if (!isInMultiSelectMode()) {
            return false;
        }

        const selectedCellClientIds = getCurrentSelectedCells();

        if (selectedCellClientIds.length !== 2) {
            return false;
        }

        const cellsStructure: {
            clientId: string;
            colIndex: number;
            colspan: number;
            rowIndex: number;
            rowspan: number;
        }[] = getCellsStructure(clientId);

        const sameRowspan = selectedCellClientIds
            .map((cellClientId) => {
                return cellsStructure.find(
                    (cell) => cell.clientId === cellClientId
                )?.rowspan;
            })
            .every((n, _, arr) => n === arr[0]);

        const sameColspan = selectedCellClientIds
            .map((cellClientId) => {
                return cellsStructure.find(
                    (cell) => cell.clientId === cellClientId
                )?.colspan;
            })
            .every((n, _, arr) => n === arr[0]);

        if (!(sameRowspan && sameColspan)) {
            return false;
        }

        const cellsInfo = selectedCellClientIds.map((cellClientId) =>
            cellsStructure.find((cell) => cell.clientId === cellClientId)
        );

        if (cellsInfo[0] && cellsInfo[1]) {
            const colDistance = Math.abs(
                cellsInfo[0]?.colIndex - cellsInfo[1]?.colIndex
            );
            const rowDistance = Math.abs(
                cellsInfo[0]?.rowIndex - cellsInfo[1]?.rowIndex
            );
            if (colDistance !== 1 && rowDistance !== 1) {
                return false;
            }
            if (colDistance === 1 && rowDistance === 1) {
                return false;
            }
        }

        return true;
    };

    const getMergedProps = (clientIds: string[]) => {
        const cellsStructure: {
            clientId: string;
            colIndex: number;
            colspan: number;
            rowIndex: number;
            rowspan: number;
        }[] = getCellsStructure(clientId);

        let cells = clientIds.map((cellId) => {
            const cell = cellsStructure.find(
                (cellInfo) => cellInfo.clientId == cellId
            )!;

            return cell;
        });

        cells = cells
            .sort((a, z) => {
                if (!a || !z) {
                    return 1;
                }
                return a.colIndex - z.colIndex;
            })
            .sort((a, z) => {
                if (!a || !z) {
                    return 1;
                }
                return a.rowIndex - z.rowIndex;
            });

        const sameRow = cells
            .map((cell) => cell?.rowIndex)
            .every((n, _, arr) => n === arr[0]);
        const sameCol = cells
            .map((cell) => cell?.colIndex)
            .every((n, _, arr) => n === arr[0]);

        let targetColSpan = cells[0]?.colspan;
        let targetRowSpan = cells[0]?.rowspan;

        if (sameRow) {
            targetColSpan += cells[1]?.colspan;
        }
        if (sameCol) {
            targetRowSpan += cells[1]?.rowspan;
        }

        return {
            targetCellId: cells[0].clientId,
            targetColSpan,
            targetRowSpan,
        };
    };

    const removeEmptyRowsIfAny = () => {
        const tableBlock = getBlock(tableBlockId);
        tableBlock?.innerBlocks.forEach((row) => {
            if (row.innerBlocks.length === 0) {
                removeBlock(row.clientId);
            }
        });
    };

    const mergeCells = () => {
        const cellClientIds = getCurrentSelectedCells();
        console.log("mergeCells", cellClientIds);

        const { targetCellId, targetColSpan, targetRowSpan } =
            getMergedProps(cellClientIds);

        const blockInstances = cellClientIds
            .map((cellClientId) => {
                return cellClientId === targetCellId
                    ? undefined
                    : getBlock(cellClientId);
            })
            .filter((i) => i);

        blockInstances.forEach((block) => {
            moveBlocksToPosition(
                block?.innerBlocks.map((b) => b.clientId)!,
                block?.clientId,
                targetCellId
            );

            removeBlock(block?.clientId!);
        });

        removeEmptyRowsIfAny();

        updateBlockAttributes(targetCellId, {
            rowspan: targetRowSpan,
            colspan: targetColSpan,
        });

        selectBlock(targetCellId);

        endCellMultiSelect();
    };

    const tableControls = [
        ...(isHeader
            ? []
            : [
                  {
                      icon: tableRowBefore,
                      title: "Insert row before",
                      onClick: onInsertRowBefore,
                  },
              ]),
        ...(isFooter
            ? []
            : [
                  {
                      icon: tableRowAfter,
                      title: "Insert row after",
                      onClick: onInsertRowAfter,
                  },
              ]),
        {
            icon: tableRowDelete,
            title: "Delete row",
            onClick: onDeleteRow,
        },
        {
            icon: tableColumnBefore,
            title: "Insert column before",
            onClick: onInsertColumnBefore,
        },
        {
            icon: tableColumnAfter,
            title: "Insert column after",
            onClick: onInsertColumnAfter,
        },
        {
            icon: tableColumnDelete,
            title: "Delete column",
            onClick: onDeleteColumn,
        },
        {
            icon: table,
            title: "Merge",
            onClick: () => {
                mergeCells();
            },
            isDisabled: !isMergeAllowed(),
        },
    ];

    const TagName = attributes.tagName ?? "td";

    return (
        <>
            <TagName
                {...innerBlocksProps}
                rowSpan={attributes.rowspan}
                colSpan={attributes.colspan}
            />
            <BlockControls group="block">
                <BlockVerticalAlignmentToolbar
                    value={vAlign}
                    onChange={vAlignChange}
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
                height={currentRowBlock?.attributes.height}
                setHeight={setRowHeight}
                width={tableBlock?.attributes.colWidths[colIndex]}
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
