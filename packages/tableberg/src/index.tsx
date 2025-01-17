/// <reference path="../../../typings/globals.d.ts" />
/// <reference path="../../../typings/png.d.ts" />
/// <reference path="../../../typings/wordpress__block-editor.d.ts" />
/// <reference path="../../../typings/wordpress__data.d.ts" />
/**
 * WordPress Imports
 */
import { useDispatch, useSelect } from "@wordpress/data";
import {
    useBlockProps,
    useInnerBlocksProps,
    store as blockEditorStore,
} from "@wordpress/block-editor";

import {
    BlockEditProps,
    createBlocksFromInnerBlocksTemplate,
    registerBlockType,
    BlockInstance,
    createBlock,
} from "@wordpress/blocks";
/**
 * Internal Imports
 */
import "./style.scss";
import metadata from "./block.json";
import { useEffect, useRef, useState } from "react";
import TablebergControls from "./controls";
import {
    TablebergBlockAttrs,
    TablebergCellInstance,
} from "@tableberg/shared/types";
import exampleImage from "./example.png";
import blockIcon from "@tableberg/shared/icons/tableberg";
import { PrimaryTable } from "./table";
import StackRowTable from "./table/StackRowTable";
import StackColTable from "./table/StackColTable";
import classNames from "classnames";
import { createPortal } from "react-dom";
import { SidebarUpsell } from "./components/SidebarUpsell";
import { __ } from "@wordpress/i18n";
import TableCreator from "./table/creator";
import { store as tbStore } from "./store";

export type TablebergRenderMode = "" | "primary" | "stack-row" | "stack-col";

const removeFirstRow = (
    innrBlocks: TablebergCellInstance[],
): TablebergCellInstance[] => {
    const newCells: TablebergCellInstance[] = [];
    for (let i = 0; i < innrBlocks.length; i++) {
        const cell = innrBlocks[i];
        if (cell.attributes.row === 0) {
            continue;
        }
        cell.attributes.row -= 1;
        newCells.push(cell);
    }
    return newCells;
};

const changeFirstRowTagName = (
    innrBlocks: TablebergCellInstance[],
    tagName: "td" | "th",
) => {
    for (let i = 0; i < innrBlocks.length; i++) {
        const cell = innrBlocks[i];
        if (cell.attributes.row != 0) {
            return;
        }
        cell.attributes.tagName = tagName;
    }
};

const removeLastRow = (
    innrBlocks: TablebergCellInstance[],
    lastRow: number,
): TablebergCellInstance[] => {
    const clientIds: string[] = [];
    let lastRowFirstColIdx = innrBlocks.length - 1;
    while (lastRowFirstColIdx > -1) {
        const cell = innrBlocks[lastRowFirstColIdx];
        if (cell.attributes.row >= lastRow) {
            clientIds.push(cell.clientId);
        } else {
            break;
        }
        lastRowFirstColIdx--;
    }

    return innrBlocks.slice(0, lastRowFirstColIdx + 1);
};

const changeLastRowTagName = (
    innrBlocks: TablebergCellInstance[],
    tagName: "td" | "th",
    lastRow: number,
) => {
    for (let i = innrBlocks.length - 1; i > -1; i--) {
        const cell = innrBlocks[i];
        if (cell.attributes.row !== lastRow) {
            return;
        }
        cell.attributes.tagName = tagName;
    }
};
const useTableHeaderFooter = (
    tableBlock: BlockInstance<TablebergBlockAttrs>,
    actions: BlockEditorStoreActions,
) => {
    const attrs = tableBlock.attributes;

    const prevHState = useRef(attrs.enableTableHeader);

    useEffect(() => {
        const from = prevHState.current;
        const to = attrs.enableTableHeader;

        if (from === to) {
            return;
        }

        let newCells: TablebergCellInstance[] = [];
        let rowCount = attrs.rows;

        if (to === "added") {
            if (from === "converted") {
                changeFirstRowTagName(tableBlock.innerBlocks as any, "td");
            }
            for (let col = 0; col < attrs.cols; col++) {
                newCells.push(
                    createBlocksFromInnerBlocksTemplate([
                        [
                            "tableberg/cell",
                            {
                                row: 0,
                                col,
                                tagName: "th",
                            },
                            [["core/paragraph"]],
                        ],
                    ])[0] as TablebergCellInstance,
                );
            }
            tableBlock.innerBlocks.forEach((cell) => {
                cell.attributes.row += 1;
                newCells.push(cell as TablebergCellInstance);
            });
            rowCount++;
        } else if (to === "converted") {
            if (from === "added") {
                newCells = removeFirstRow(tableBlock.innerBlocks as any);
                changeFirstRowTagName(newCells, "th");
                rowCount--;
            } else {
                changeFirstRowTagName(tableBlock.innerBlocks as any, "th");
                newCells = tableBlock.innerBlocks as any;
            }
        } else {
            if (from === "added") {
                newCells = removeFirstRow(tableBlock.innerBlocks as any);
                rowCount--;
            } else {
                changeFirstRowTagName(tableBlock.innerBlocks as any, "td");
                newCells = tableBlock.innerBlocks as any;
            }
        }

        actions.replaceInnerBlocks(tableBlock.clientId, newCells);
        actions.updateBlockAttributes(tableBlock.clientId, {
            rows: rowCount,
            cells: newCells.length,
        });

        prevHState.current = attrs.enableTableHeader;
    }, [attrs.enableTableHeader]);

    const prevFState = useRef(attrs.enableTableFooter);

    useEffect(() => {
        const from = prevFState.current;
        const to = attrs.enableTableFooter;

        if (from === to) {
            return;
        }

        let rowCount = attrs.rows;
        let cellCount = attrs.cells;
        const lastRow = rowCount - 1;

        if (to === "added") {
            if (from === "converted") {
                changeLastRowTagName(
                    tableBlock.innerBlocks as any,
                    "td",
                    lastRow,
                );
            }

            const newCells: TablebergCellInstance[] = [];
            for (let col = 0; col < attrs.cols; col++) {
                newCells.push(
                    createBlocksFromInnerBlocksTemplate([
                        [
                            "tableberg/cell",
                            {
                                row: attrs.rows,
                                col,
                                tagName: "th",
                            },
                            [["core/paragraph"]],
                        ],
                    ])[0] as TablebergCellInstance,
                );
            }
            actions.insertBlocks(
                newCells,
                tableBlock.innerBlocks.length,
                tableBlock.clientId,
                false,
            );

            rowCount++;
            cellCount += newCells.length;
        } else {
            let newCells: TablebergCellInstance[] = [];
            if (from === "added") {
                newCells = removeLastRow(
                    tableBlock.innerBlocks as any,
                    lastRow,
                );
                cellCount = newCells.length;
                rowCount--;
            } else {
                newCells = [...tableBlock.innerBlocks] as any;
            }
            if (to === "converted") {
                if (from === "added") {
                    changeLastRowTagName(newCells, "th", lastRow - 1);
                } else {
                    changeLastRowTagName(newCells, "th", lastRow);
                }
            } else if (from !== "added") {
                changeLastRowTagName(newCells, "td", lastRow);
            }

            actions.replaceInnerBlocks(tableBlock.clientId, newCells);
        }

        actions.updateBlockAttributes(tableBlock.clientId, {
            rows: rowCount,
            cells: cellCount,
        });

        prevFState.current = attrs.enableTableFooter;
    }, [attrs.enableTableFooter]);
};

const useUndoRedo = (
    attrs: TablebergBlockAttrs,
    blockCount: number,
    setAttrs: (attrs: Partial<TablebergBlockAttrs>) => void,
) => {
    const editorActions = useDispatch("core/editor");
    const { shouldSomethingBeDone, hasUndo } = useSelect(
        (select) => {
            const sel = select("core/editor");
            return {
                shouldSomethingBeDone:
                    // @ts-ignore
                    sel.hasEditorRedo() && attrs.cells !== blockCount,
                // @ts-ignore
                hasUndo: sel.hasEditorUndo(),
            };
        },
        [attrs.cells, blockCount],
    );

    if (shouldSomethingBeDone) {
        if (hasUndo) {
            editorActions.undo();
        } else {
            setAttrs({
                cells: blockCount,
            });
        }
    }
};

function edit(props: BlockEditProps<TablebergBlockAttrs>) {
    // @ts-ignore
    registerTablebergPreviewDeviceChangeObserver();
    const { attributes, setAttributes, clientId } = props;
    const rootRef = useRef<HTMLTableElement>();

    const [isScrollMode, setIsScrollMode] = useState<boolean>(false);

    const blockProps = useBlockProps({
        ref: rootRef,
        className: classNames("wp-block-tableberg-wrapper", {
            "tableberg-scroll-x": isScrollMode,
            [`justify-table-${attributes.tableAlignment}`]:
                !!attributes.tableAlignment,
            "tableberg-sticky-top-row": attributes.stickyTopRow,
            "tableberg-sticky-first-col": attributes.stickyFirstCol,
            "tableberg-cell-no-outside-border":
                attributes.hideCellOutsideBorders,
            "tableberg-border-col-only": attributes.innerBorderType === "col",
            "tableberg-border-row-only": attributes.innerBorderType === "row",
            "tableberg-theme-disabled": attributes.disableThemeStyle,
        }),
    });

    const storeActions: BlockEditorStoreActions = useDispatch(
        blockEditorStore,
    ) as any;

    const { tableBlock } = useSelect((select) => {
        const storeSelect = select(
            blockEditorStore,
        ) as BlockEditorStoreSelectors;
        const tableBlock = storeSelect.getBlock(
            clientId,
        )! as BlockInstance<TablebergBlockAttrs>;

        return {
            tableBlock,
        };
    }, []);
    useUndoRedo(attributes, tableBlock.innerBlocks.length, setAttributes);

    const [previewDevice, updatePreview] = useState<
        keyof TablebergBlockAttrs["responsive"]["breakpoints"]
    // @ts-ignore
    >(tablebergGetLastDevice() || "desktop");

    useEffect(() => {
        if (
            tableBlock.attributes.version &&
            tableBlock.attributes.version < "0.5.3"
        ) {
            // REMOVE IN 0.5.4
            const rowStyles: TablebergBlockAttrs["rowStyles"] = {};
            // @ts-ignore
            const heights = tableBlock.attributes.rowHeights || [];
            for (let i = 0; i < heights.length; i++) {
                if (heights[i]) {
                    rowStyles[i] = {
                        height: heights[i],
                    };
                }
            }

            const colStyles: TablebergBlockAttrs["colStyles"] = {};
            // @ts-ignore
            const widths = tableBlock.attributes.colWidths || [];
            for (let i = 0; i < widths.length; i++) {
                if (widths[i]) {
                    colStyles[i] = {
                        width: widths[i],
                    };
                }
            }

            setAttributes({
                rowStyles,
                colStyles,
                version: metadata.version,
            });
        }
        const localUpdater = (evt: any) => {
            updatePreview(evt.detail.currentPreview);
        };
        document.addEventListener("TablebergPreviewDeviceChange", localUpdater);
        return () =>
            document.removeEventListener(
                "TablebergPreviewDeviceChange",
                localUpdater,
            );
    }, []);

    useTableHeaderFooter(tableBlock, storeActions);

    const { setRenderMode: setStoreRenderMode } = useDispatch(tbStore);

    const [renderMode, setRenderMode] =
        useState<TablebergRenderMode>("");
    const prevRenderMode = useRef<TablebergRenderMode>("");
    useSelect((select) => {
        // @ts-ignore
        const getDevice: () => string = select("core/editor").getDeviceType;
        if (getDevice) {
            updatePreview(getDevice().toLowerCase() as any);
        }
    }, []);

    useEffect(() => {
        let newRMode: TablebergRenderMode = "primary";
        if (previewDevice === "desktop") {
            newRMode = "primary";
        } else {
            let breakpoint =
                attributes.responsive?.breakpoints?.[previewDevice];
            if (!breakpoint && previewDevice === "mobile") {
                breakpoint = attributes.responsive?.breakpoints?.tablet;
            }
            if (!breakpoint) {
                newRMode = "primary";
                setIsScrollMode(false);
            } else if (breakpoint.enabled) {
                if (breakpoint.mode === "stack") {
                    newRMode = `stack-${breakpoint.direction}` as any;
                } else {
                    setIsScrollMode(true);
                }
            }
        }

        if (newRMode !== prevRenderMode.current) {
            setRenderMode(newRMode);
            setStoreRenderMode(newRMode);
            prevRenderMode.current = newRMode;
        }
    }, [previewDevice, attributes.responsive.breakpoints]);

    useSelect(
        (select) => {
            rootRef.current?.addEventListener(
                "keydown",
                (evt: KeyboardEvent) => {
                    if (evt.key !== "Backspace" && evt.key !== "Delete") {
                        return;
                    }
                    const cur: TablebergCellInstance = (
                        select("core/block-editor") as any
                    ).getSelectedBlock();

                    if (cur.name === "tableberg/cell") {
                        evt.preventDefault();
                        evt.stopPropagation();
                        return;
                    }
                },
                {
                    capture: true,
                },
            );
        },
        [rootRef.current],
    );

    const targetEl = document.querySelector(".interface-complementary-area");

    const { currentBlockIsTablebergCellChild } = useSelect((select) => {
        const storeSelect = select(
            blockEditorStore,
        ) as BlockEditorStoreSelectors;
        const currentBlockId = storeSelect.getSelectedBlockClientId()!;
        const currentBlockParents = storeSelect.getBlockParents(currentBlockId);
        let currentBlockIsTablebergCellChild = false;

        if (currentBlockParents.indexOf(clientId) !== -1) {
            currentBlockIsTablebergCellChild = true;
        }

        return { currentBlockIsTablebergCellChild };
    }, []);

    const showUpsell =
        targetEl &&
        currentBlockIsTablebergCellChild &&
        !tablebergAdminMenuData.misc.pro_status;

    if (attributes.isExample) {
        return <img src={exampleImage} style={{ maxWidth: "100%" }}></img>;
    }

    if (attributes.cells === 0) {
        return (
            <div {...blockProps}>
                <TableCreator clientId={clientId} />
            </div>
        );
    }

    return (
        <>
            <div {...blockProps}>
                {(renderMode === "primary" && (
                    <PrimaryTable {...props} tableBlock={tableBlock} />
                )) ||
                    (renderMode === "stack-row" && (
                        <StackRowTable
                            {...props}
                            tableBlock={tableBlock}
                            preview={previewDevice}
                        />
                    )) ||
                    (renderMode === "stack-col" && (
                        <StackColTable
                            {...props}
                            tableBlock={tableBlock}
                            preview={previewDevice}
                        />
                    ))}
            </div>
            <TablebergControls
                clientId={clientId}
                preview={previewDevice}
                attributes={attributes}
                setAttributes={setAttributes}
            />
            {showUpsell && createPortal(<SidebarUpsell />, targetEl)}
        </>
    );
}

function save() {
    const blockProps = useBlockProps.save();
    const innerBlocksProps = useInnerBlocksProps.save(blockProps);
    return <table {...innerBlocksProps} />;
}

// @ts-ignore to remove this, we have to manually add the attributes
// from block.json, which is not very scalable or pleasant.
// We'll think of removing this @ts-ignore later
registerBlockType(metadata.name, {
    title: metadata.title,
    icon: blockIcon,
    category: metadata.category,
    attributes: metadata.attributes,
    edit,
    save,
    transforms: {
        from: [
            {
                type: "block",
                blocks: ["core/table"],
                transform: (data: any) => {
                    const innerBlocks: TablebergCellInstance[] = [];
                    const attrs: Partial<TablebergBlockAttrs> & {
                        cells: number;
                        rows: number;
                        cols: number;
                    } = {
                        version: metadata.version,
                        cells: 0,
                        responsive: {
                            target: "window",
                            last: "",
                            breakpoints: {},
                        },
                        rows: 0,
                        cols: 0,
                    };

                    if (data.textColor) {
                        const textColor = window
                            .getComputedStyle(document.body)
                            .getPropertyValue(
                                "--wp--preset--color--" + data.textColor,
                            );
                        attrs.fontColor = textColor;
                    }

                    if (data.backgroundColor) {
                        const backgroundColor = window
                            .getComputedStyle(document.body)
                            .getPropertyValue(
                                "--wp--preset--color--" + data.backgroundColor,
                            );
                        attrs.headerBackgroundColor = backgroundColor;
                        attrs.oddRowBackgroundColor = backgroundColor;
                        attrs.evenRowBackgroundColor = backgroundColor;
                        attrs.footerBackgroundColor = backgroundColor;
                    }

                    if (data.borderColor) {
                        const borderColor = window
                            .getComputedStyle(document.body)
                            .getPropertyValue(
                                "--wp--preset--color--" + data.borderColor,
                            );
                        attrs.innerBorder = {
                            color: borderColor,
                        };
                        attrs.tableBorder = {
                            color: borderColor,
                        };
                    }

                    if (data.fontSize) {
                        attrs.fontSize = (
                            {
                                small: "0.9rem",
                                medium: "1.05rem",
                                large: "1.85rem",
                                "x-large": "2.5rem",
                                "xx-large": "3.27rem",
                            } as any
                        )[data.fontSize];
                    }

                    if (data.style?.border?.width) {
                        const innerBorder = attrs.innerBorder || {};
                        innerBorder.width = data.style.border.width;

                        const tableBorder = attrs.tableBorder || {};
                        tableBorder.width = data.style.border.width;
                    }

                    if (/is\-style\-stripes/.test(data.className)) {
                        attrs.evenRowBackgroundColor = "#f0f0f0";
                    }

                    const head = data.head[0]?.cells;
                    if (head) {
                        attrs.cols = head.length;
                        attrs.enableTableHeader = "converted";
                        head.forEach((cell: any, colIdx: number) => {
                            attrs.cells++;
                            innerBlocks.push(
                                createBlock(
                                    "tableberg/cell",
                                    {
                                        row: 0,
                                        col: colIdx,
                                        tagName: "th",
                                    },
                                    [
                                        createBlock("core/paragraph", {
                                            content: cell.content,
                                        }),
                                    ],
                                ) as any,
                            );
                        });
                        attrs.rows++;
                    }

                    data.body.forEach((row: any, _: number) => {
                        attrs.cols = row.cells.length;
                        row.cells.forEach((cell: any, colIdx: number) => {
                            // @ts-ignore
                            attrs.cells++;
                            innerBlocks.push(
                                createBlock(
                                    "tableberg/cell",
                                    {
                                        row: attrs.rows,
                                        col: colIdx,
                                        tagName: "td",
                                    },
                                    [
                                        createBlock("core/paragraph", {
                                            content: cell.content,
                                        }),
                                    ],
                                ) as any,
                            );
                        });
                        attrs.rows++;
                    });

                    const foot = data.foot[0]?.cells;
                    if (foot) {
                        attrs.cols = foot.length;
                        attrs.enableTableFooter = "converted";
                        foot.forEach((cell: any, colIdx: number) => {
                            attrs.cells++;
                            innerBlocks.push(
                                createBlock(
                                    "tableberg/cell",
                                    {
                                        row: attrs.rows,
                                        col: colIdx,
                                        tagName: "td",
                                    },
                                    [
                                        createBlock("core/paragraph", {
                                            content: cell.content,
                                        }),
                                    ],
                                ) as any,
                            );
                        });
                        attrs.rows++;
                    }

                    if (attrs.cells === 0) {
                        return createBlock("tableberg/table");
                    }
                    return createBlock("tableberg/table", attrs, innerBlocks);
                },
            },
        ],
        to: [],
    },
});
