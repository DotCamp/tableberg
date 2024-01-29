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

import "./style.scss";
import "./editor.scss";

import metadata from "./block.json";
import { useEffect, useRef, useState } from "react";
import CellControls from "./controls";
import { createPortal } from "react-dom";
import { createArray } from "../utils";
import { TablebergBlockAttrs } from "../types";

export interface TablebergCellBlockAttrs {
    vAlign: "bottom" | "center" | "top";
    tagName: "td" | "th";
    rowspan: number;
    colspan: number;
    row: number;
    col: number;
}

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
    const template: InnerBlockTemplate[] = createArray(
        tableBlock.attributes.cols,
    ).map((i) => {
        return [
            "tableberg/cell",
            {
                col: i,
                row: rowIndex,
            },
        ] satisfies InnerBlockTemplate;
    });
    const rows = tableBlock.attributes.rows + 1;
    storeActions.updateBlockAttributes(tableBlock.clientId, {
        rows,
    });

    const cellBlocks: BlockInstance<TablebergCellBlockAttrs>[] = Array(
        rows * tableBlock.attributes.cols,
    );

    createBlocksFromInnerBlocksTemplate(template).forEach((cell) => {
        cellBlocks[
            cell.attributes.row * tableBlock.attributes.cols +
                cell.attributes.col
        ] = cell as any;
    });

    tableBlock.innerBlocks.forEach((cell) => {
        if (cell.attributes.row >= rowIndex) {
            cell.attributes.row += 1;
        }
        const cellIdx =
            cell.attributes.row * tableBlock.attributes.cols +
            cell.attributes.col;
        cellBlocks[cellIdx] = cell as any;
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
};

const addCol = (
    tableBlock: BlockInstance<TablebergBlockAttrs>,
    storeActions: BlockEditorStoreActions,
    colIndex: number,
) => {
    const template: InnerBlockTemplate[] = createArray(
        tableBlock.attributes.rows,
    ).map((i) => {
        return [
            "tableberg/cell",
            {
                row: i,
                col: colIndex,
            },
        ] satisfies InnerBlockTemplate;
    });

    const cols = tableBlock.attributes.cols + 1;

    storeActions.updateBlockAttributes(tableBlock.clientId, {
        cols,
    });

    const cellBlocks: BlockInstance<TablebergCellBlockAttrs>[] = Array(
        tableBlock.attributes.rows * cols,
    );

    const newCells = createBlocksFromInnerBlocksTemplate(template);
    newCells.forEach((cell) => {
        cellBlocks[cell.attributes.row * cols + cell.attributes.col] =
            cell as any;
    });

    tableBlock.innerBlocks.forEach((cell) => {
        if (cell.attributes.col >= colIndex) {
            cell.attributes.col += 1;
        }
        const cellIdx = cell.attributes.row * cols + cell.attributes.col;
        cellBlocks[cellIdx] = cell as any;
    });

    const colWidths = tableBlock.attributes.colWidths;
    let toInsert = "";
    for (let i = colIndex; i < colWidths.length; i++) {
        const old = colWidths[i];
        colWidths[i] = toInsert;
        toInsert = old;
    }
    colWidths.push(toInsert);
    storeActions.replaceInnerBlocks(tableBlock.clientId, cellBlocks, false);
};

const deleteCol = (
    tableBlock: BlockInstance<TablebergBlockAttrs>,
    storeActions: BlockEditorStoreActions,
    colIndex: number,
) => {
    const cols = tableBlock.attributes.cols - 1;
    storeActions.updateBlockAttributes(tableBlock.clientId, {
        cols,
    });
    const cellBlocks: BlockInstance<TablebergCellBlockAttrs>[] = Array(
        tableBlock.attributes.rows * cols,
    );
    tableBlock.innerBlocks.forEach((cell) => {
        if (cell.attributes.col === colIndex) {
            return;
        }
        if (cell.attributes.col > colIndex) {
            cell.attributes.col -= 1;
        }
        const cellIdx = cell.attributes.row * cols + cell.attributes.col;
        cellBlocks[cellIdx] = cell as any;
    });
    tableBlock.attributes.colWidths.splice(colIndex, 1);
    storeActions.replaceInnerBlocks(tableBlock.clientId, cellBlocks, false);
};

const deleteRow = (
    tableBlock: BlockInstance<TablebergBlockAttrs>,
    storeActions: BlockEditorStoreActions,
    rowIndex: number,
) => {
    const rows = tableBlock.attributes.rows - 1;
    storeActions.updateBlockAttributes(tableBlock.clientId, {
        rows,
    });
    const cellBlocks: BlockInstance<TablebergCellBlockAttrs>[] = Array(
        tableBlock.attributes.cols * rows,
    );
    tableBlock.innerBlocks.forEach((cell) => {
        if (cell.attributes.row === rowIndex) {
            return;
        }
        if (cell.attributes.row > rowIndex) {
            cell.attributes.row -= 1;
        }
        const cellIdx =
            cell.attributes.row * tableBlock.attributes.cols +
            cell.attributes.col;
        cellBlocks[cellIdx] = cell as any;
    });
    storeActions.replaceInnerBlocks(tableBlock.clientId, cellBlocks, false);
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

    const blockProps = useBlockProps({
        style: {
            "--tableberg-cell-v-align":
                attributes.vAlign === "center" ? "middle" : attributes.vAlign,
        } as any,
        ref: cellRef,
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
    }, []);

    // to be implemented
    // cell merging

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
            onClick: () => addCol(tableBlock, storeActions, attributes.col + 1),
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
