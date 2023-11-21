import {
    BlockEditProps,
    registerBlockType,
    //@ts-ignore
    createBlocksFromInnerBlocksTemplate,
    createBlock,
    BlockInstance,
    BlockSaveProps,
} from "@wordpress/blocks";
import {
    BlockVerticalAlignmentToolbar,
    BlockControls,
    store as blockEditorStore,
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
import { useEffect, useRef, useState } from "react";
import { store as tbStore } from "../store";

interface TablebergCellBlockAttrs {
    vAlign: "bottom" | "center" | "top";
    tagName: string;
}

const ALLOWED_BLOCKS = [
    "core/paragraph",
    "tableberg/button",
    "tableberg/image",
    "core/list",
];

function edit({
    clientId,
    attributes,
    setAttributes,
}: BlockEditProps<TablebergCellBlockAttrs>) {
    const { vAlign } = attributes;

    const vAlignChange = (newValue: "bottom" | "center" | "top") => {
        setAttributes({ vAlign: newValue });
    };

    const className = classNames({
        [`align-v-${vAlign}`]: vAlign,
    });

    const cellRef = useRef<HTMLTableCellElement>();

    const blockProps = useBlockProps({ className, ref: cellRef });

    const innerBlocksProps = useInnerBlocksProps(
        { ...blockProps },
        {
            allowedBlocks: ALLOWED_BLOCKS,
            template: [["core/paragraph"]],
        }
    );

    const {
        insertBlock,
        updateBlockAttributes,
        removeBlock,
        moveBlocksToPosition,
    } = useDispatch(blockEditorStore);

    const {
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
    } = useSelect(
        (select) => {
            const storeSelect = select(blockEditorStore) as any;

            const parentBlocks = storeSelect.getBlockParents(clientId);

            const tableBlockId = parentBlocks.find(
                (parentId: string) =>
                    storeSelect.getBlockName(parentId) === "tableberg/table"
            );
            const tableBlock = storeSelect.getBlock(tableBlockId);

            const currentRowBlockId = parentBlocks.find(
                (parentId: string) =>
                    storeSelect.getBlockName(parentId) === "tableberg/row"
            );
            const currentRowBlock = storeSelect.getBlock(currentRowBlockId);
            const isHeader = currentRowBlock?.attributes?.isHeader;
            const isFooter = currentRowBlock?.attributes?.isFooter;
            const { rows, cols } = storeSelect.getBlockAttributes(tableBlockId);

            const rowIndex = storeSelect.getBlockIndex(currentRowBlockId);

            const insertRowToTable = async (after = false) => {
                const newRowIndex = after ? rowIndex + 1 : rowIndex;
                const newRowBlock = createBlocksFromInnerBlocksTemplate([
                    [
                        "tableberg/row",
                        {},
                        Array.from({ length: cols }, () => ["tableberg/cell"]),
                    ],
                ])[0];

                await insertBlock(newRowBlock, newRowIndex, tableBlockId, true);
                await updateBlockAttributes(tableBlockId, {
                    rows: rows + 1,
                });
            };

            const deleteRowFromTable = async () => {
                await removeBlock(currentRowBlockId, true);
                await updateBlockAttributes(tableBlockId, {
                    rows: rows - 1,
                });
            };

            const insertColumnToTable = async (after = false) => {
                const colIndex = storeSelect.getBlockIndex(clientId);
                const newColIndex = after ? colIndex + 1 : colIndex;

                await storeSelect
                    .getBlocks(tableBlockId)
                    .forEach(async (row: BlockInstance, index: number) => {
                        const rowIsHeader = row?.attributes?.isHeader;
                        const rowIsFooter = row?.attributes?.isFooter;

                        await insertBlock(
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

                await updateBlockAttributes(tableBlockId, {
                    cols: cols + 1,
                });
            };

            const deleteColumnFromTable = async () => {
                const colIndex = storeSelect.getBlockIndex(clientId);

                await storeSelect
                    .getBlocks(tableBlockId)
                    .forEach(async (row: BlockInstance) => {
                        const cells = storeSelect.getBlockOrder(row.clientId);
                        await removeBlock(cells[colIndex]);
                    });

                await updateBlockAttributes(tableBlockId, {
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

    const onInsertRowBefore = async () => {
        await insertRowToTable();
    };
    const onInsertRowAfter = async () => {
        await insertRowToTable(true);
    };
    const onDeleteRow = async () => {
        deleteRowFromTable();
    };
    const onInsertColumnBefore = async () => {
        await insertColumnToTable();
    };
    const onInsertColumnAfter = async () => {
        await insertColumnToTable(true);
    };
    const onDeleteColumn = async () => {
        await deleteColumnFromTable();
    };

    const { toggleCellSelection, endCellMultiSelect } = useDispatch(tbStore);
    const { getCurrentSelectedCells, isInMultiSelectMode } = useSelect(
        (select) => {
            const { getCurrentSelectedCells } = select(tbStore);
            const isInMultiSelectMode = () =>
                getCurrentSelectedCells().length > 0;
            return {
                getCurrentSelectedCells,
                isInMultiSelectMode,
            };
        },
        []
    );

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

    const [colspan, setColspan] = useState(1);
    const [rowspan, setRowspan] = useState(1);

    const mergeCells = () => {
        const cellClientIds = getCurrentSelectedCells();
        console.log("mergeCells", cellClientIds);
        const coords: {
            col: number;
            row: number;
        }[] = [];

        cellClientIds.forEach((cellId) => {
            const parentBlocks = getBlockParents(cellId);
            const rowClientId = parentBlocks.find(
                (parentId: string) => getBlockName(parentId) === "tableberg/row"
            );

            coords.push({
                col: getBlockIndex(cellId),
                row: getBlockIndex(rowClientId),
            });
        });

        const sameRow = coords
            .map((coord) => coord.row)
            .every((n, _, arr) => n === arr[0]);
        const sameCol = coords
            .map((coord) => coord.col)
            .every((n, _, arr) => n === arr[0]);

        console.log(coords);

        if (!sameRow && !sameCol) {
            return;
        }

        const blockInstances = cellClientIds
            .map((cellClientId) => {
                return cellClientId === clientId
                    ? undefined
                    : getBlock(cellClientId);
            })
            .filter((i) => i);

        blockInstances.forEach((block: BlockInstance) => {
            moveBlocksToPosition(
                block.innerBlocks.map((b) => b.clientId),
                block.clientId,
                clientId
            );

            removeBlock(block.clientId);
            if (sameRow) {
                setColspan(colspan + 1);
            }
            if (sameCol) {
                setRowspan(rowspan + 1);
            }
        });

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
        },
    ];

    const TagName = attributes.tagName ?? "td";

    return (
        <>
            <TagName
                {...innerBlocksProps}
                colspan={colspan}
                rowspan={rowspan}
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

registerBlockType(metadata.name, {
    title: metadata.title,
    category: metadata.category,
    attributes: {
        vAlign: {
            type: "string",
            default: "center",
        },
        tagName: {
            type: "string",
            default: "td",
        },
    },
    example: {},
    edit,
    save,
});
