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
} from "@wordpress/blocks";
/**
 * Internal Imports
 */
import "./style.scss";
import metadata from "./block.json";
import { useEffect, useRef } from "react";
import TablebergControls from "./controls";
import {
    Breakpoint,
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
import { createPrivateStore } from "./store";
import transforms from "./transforms";

export type TablebergRenderMode = "" | "primary" | "stack-row" | "stack-col";

export const privateStores: Record<string, ReturnType<typeof createPrivateStore>> = {};

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

const usePreventCellDelete = (rootRef: React.RefObject<HTMLTableElement | undefined>) => {
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
};

function useRenderMode(
    breakpoints: {
        desktop?: Breakpoint;
        tablet?: Breakpoint;
        mobile?: Breakpoint;
    },
    previewDevice: keyof TablebergBlockAttrs["responsive"]["breakpoints"],
    clientId: string
) {
    const privateStore = privateStores[clientId];

    let breakpoint = breakpoints?.[previewDevice];

    if (!breakpoint && previewDevice === "mobile") {
        breakpoint = breakpoints?.tablet;
    }

    const renderMode = useSelect((select) => {
        return select(privateStore).getRenderMode();
    }, []);
    const { setRenderMode } = useDispatch(privateStore);

    if (previewDevice === "desktop" || !breakpoint || !breakpoint.enabled) {
        setRenderMode("primary");
    }

    if (breakpoint?.enabled && breakpoint?.mode === "stack") {
        setRenderMode(`stack-${breakpoint.direction}` as "stack-row" | "stack-col");
    }

    const isScrollMode = breakpoint?.enabled && breakpoint?.mode === "scroll";
    if (isScrollMode) {
        setRenderMode("primary");
    }

    return { renderMode, isScrollMode, breakpoint }
}

function edit(props: BlockEditProps<TablebergBlockAttrs>) {
    const { attributes, setAttributes, clientId } = props;
    const rootRef = useRef<HTMLTableElement>();

    if (!privateStores[clientId]) {
        privateStores[clientId] = createPrivateStore(clientId);
    }

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

    const previewDevice: keyof TablebergBlockAttrs["responsive"]["breakpoints"]
        = useSelect((select) => {
            // @ts-ignore
            return select("core/editor").getDeviceType().toLowerCase();
        }, []);

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
    }, []);

    useTableHeaderFooter(tableBlock, storeActions);

    const { renderMode, isScrollMode, breakpoint } = useRenderMode(
        attributes.responsive.breakpoints,
        previewDevice,
        clientId
    );

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

    usePreventCellDelete(rootRef);

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
                    (renderMode === "stack-row" && breakpoint && (
                        <StackRowTable
                            {...props}
                            tableBlock={tableBlock}
                            preview={previewDevice}
                        />
                    )) ||
                    (renderMode === "stack-col" && breakpoint && (
                        <StackColTable
                            {...props}
                            tableBlock={tableBlock}
                            stackCount={breakpoint?.stackCount}
                            headerAsCol={breakpoint?.headerAsCol}
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
    transforms,
});
