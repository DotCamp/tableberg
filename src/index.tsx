/**
 * WordPress Imports
 */
import { Placeholder, TextControl, Button } from "@wordpress/components";
import { blockTable } from "@wordpress/icons";
import { useDispatch, useSelect } from "@wordpress/data";
import {
    useBlockProps,
    useInnerBlocksProps,
    store as blockEditorStore,
    BlockIcon,
} from "@wordpress/block-editor";

import {
    BlockEditProps,
    InnerBlockTemplate,
    createBlocksFromInnerBlocksTemplate,
    registerBlockType,
    BlockInstance,
} from "@wordpress/blocks";
/**
 * Internal Imports
 */
import "./style.scss";
import metadata from "./block.json";
import { FormEvent, useEffect, useRef, useState } from "react";
import TablebergControls from "./controls";
import { TablebergBlockAttrs } from "./types";
import { getStyles } from "./get-styles";
import classNames from "classnames";
import { getStyleClass } from "./get-classes";
import exampleImage from "./example.png";
import blockIcon from "./components/icon";
import { createArray } from "./utils";
import { TablebergCellInstance } from "./cell";
import { store as tbStore } from "./store";

const ALLOWED_BLOCKS = ["tableberg/cell"];

const getCellsOfRows = (tableBlock: BlockInstance<any>) => {
    const newCells: TablebergCellInstance[] = [];
    const { cols } = tableBlock.attributes;
    let lastRow = 0;
    let lastCol = 0;
    tableBlock.innerBlocks.forEach((row) => {
        if (row.name !== "tableberg/row" && row.name !== "core/missing") {
            console.log(
                "[TableBerg] Invalid block encountered while recovering rows: ",
                row.name
            );
            return;
        }
        row.innerBlocks.forEach((cell) => {
            if (cell.name !== "tableberg/cell") {
                console.log(
                    "[TableBerg] Invalid block encountered while recovering rows: ",
                    cell.name
                );
                return;
            }
            cell.attributes.row = lastRow;
            cell.attributes.col = lastCol;
            cell.attributes.tagName = "td";
            cell.attributes.colspan = 1;
            cell.attributes.rowspan = 1;

            newCells.push(cell as TablebergCellInstance);
            lastCol++;
            if (lastCol % cols !== lastCol) {
                lastRow++;
                lastCol = 0;
            }
        });
    });
    if (lastCol !== 0) {
        for (let col = lastCol; col < cols; col++) {
            newCells.push(
                createBlocksFromInnerBlocksTemplate([
                    ["tableberg/cell"],
                    {
                        // @ts-ignore
                        row: lastRow,
                        col,
                    },
                ])[0] as TablebergCellInstance
            );
        }
    }
    return [newCells, cols];
};

const useTableHeaderFooter = (
    tableBlock: BlockInstance<TablebergBlockAttrs>,
    actions: BlockEditorStoreActions
) => {
    const attrs = tableBlock.attributes;

    const prevHState = useRef(attrs.enableTableHeader);

    useEffect(() => {
        const from = prevHState.current;
        const to = attrs.enableTableHeader;

        if (
            from === to ||
            (!from && to === "converted") ||
            (!to && from === "converted")
        ) {
            return;
        }

        if (to === "added") {
            const newCells: TablebergCellInstance[] = Array(
                tableBlock.attributes.cols
            )
                .fill(0)
                .map((_, col) => {
                    return createBlocksFromInnerBlocksTemplate([
                        [
                            "tableberg/cell",
                            {
                                row: 0,
                                col,
                            },
                        ],
                    ])[0] as TablebergCellInstance;
                });
            tableBlock.innerBlocks.forEach((cell) => {
                cell.attributes.row += 1;
                newCells.push(cell as TablebergCellInstance);
            });

            actions.replaceInnerBlocks(tableBlock.clientId, newCells);
            actions.updateBlockAttributes(tableBlock.clientId, {
                rows: tableBlock.attributes.rows + 1,
                cells: newCells.length,
            });
        } else {
            const newCells: TablebergCellInstance[] = [];
            tableBlock.innerBlocks.forEach((cell) => {
                if (cell.attributes.row === 0) {
                    return;
                }
                cell.attributes.row -= 1;
                newCells.push(cell as TablebergCellInstance);
            });

            actions.replaceInnerBlocks(tableBlock.clientId, newCells);
            actions.updateBlockAttributes(tableBlock.clientId, {
                rows: tableBlock.attributes.rows - 1,
                cells: newCells.length,
            });
        }

        prevHState.current = attrs.enableTableHeader;
    }, [attrs.enableTableHeader]);

    const prevFState = useRef(attrs.enableTableFooter);

    useEffect(() => {
        const from = prevFState.current;
        const to = attrs.enableTableFooter;

        if (
            from === to ||
            (!from && to === "converted") ||
            (!to && from === "converted")
        ) {
            return;
        }

        if (to === "added") {
            const newCells: TablebergCellInstance[] = [];
            for (let col = 0; col < tableBlock.attributes.cols; col++) {
                newCells.push(
                    createBlocksFromInnerBlocksTemplate([
                        [
                            "tableberg/cell",
                            {
                                row: tableBlock.attributes.rows,
                                col,
                            },
                        ],
                    ])[0] as TablebergCellInstance
                );
            }

            actions.insertBlocks(
                newCells,
                tableBlock.attributes.cells,
                tableBlock.clientId,
                false
            );
            actions.updateBlockAttributes(tableBlock.clientId, {
                rows: tableBlock.attributes.rows + 1,
                cells: tableBlock.attributes.cells + newCells.length,
            });
        } else {
            const toRemoves: string[] = [];
            const lastRow = tableBlock.attributes.rows - 1;

            for (let i = tableBlock.innerBlocks.length - 1; i > -1; i--) {
                const cell = tableBlock.innerBlocks[i];
                if (cell.attributes.row !== lastRow) {
                    break;
                }
                toRemoves.push(cell.clientId);
            }

            actions.removeBlocks(toRemoves, false);

            actions.updateBlockAttributes(tableBlock.clientId, {
                rows: tableBlock.attributes.rows - 1,
                cells: tableBlock.attributes.cells - toRemoves.length,
            });
        }

        prevFState.current = attrs.enableTableFooter;
    }, [attrs.enableTableFooter]);
};

function edit(props: BlockEditProps<TablebergBlockAttrs>) {
    const { attributes, setAttributes, clientId } = props;
    const tableRef = useRef<HTMLTableElement>();

    const blockProps = useBlockProps({
        ref: tableRef,
        style: {
            ...getStyles(props.attributes),
            maxWidth: props.attributes.tableWidth,
        },
        className: classNames(getStyleClass(props.attributes)),
    } as Record<string, any>);

    const innerBlocksProps = useInnerBlocksProps({
        // @ts-ignore false can obviously be assigned to renderAppender as does
        // wordpress in their own blocks. Need to make a pr to @types/wordpress__block-editor.
        renderAppender: false,
        allowedBlocks: ALLOWED_BLOCKS,
    });

    const storeActions = useDispatch(
        blockEditorStore
    ) as BlockEditorStoreActions;

    const tbStoreActions = useDispatch(tbStore);

    const { tableBlock, selectedCells } = useSelect((select) => {
        const storeSelect = select(
            blockEditorStore
        ) as BlockEditorStoreSelectors;
        const tableBlock = storeSelect.getBlock(
            clientId
        )! as BlockInstance<TablebergBlockAttrs>;
        const selectedCells = storeSelect.getMultiSelectedBlocks();

        return {
            tableBlock,
            selectedCells,
        };
    }, []);

    useEffect(() => {
        if (selectedCells.length > 0) {
            tbStoreActions.startMultiSelectNative(
                selectedCells as TablebergCellInstance[]
            );
        }
    }, [selectedCells]);

    useEffect(() => {
        if (!tableBlock.attributes.version) {
            const [newCells, cols] = getCellsOfRows(tableBlock);
            const rows = newCells.length / cols;
            storeActions.replaceInnerBlocks(clientId, newCells);
            setAttributes({
                version: metadata.version,
                cells: newCells.length,
                rows,
                rowHeights: Array(rows).fill(""),
                colWidths: Array(cols).fill(""),
            });
        }
    }, []);

    useTableHeaderFooter(tableBlock, storeActions);

    const [colUpt, setColUpt] = useState(0);

    useEffect(() => {
        setColUpt((old) => old + 1);
    }, [attributes.cols]);

    useSelect(
        (select) => {
            tableRef.current?.addEventListener(
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
                }
            );
        },
        [tableRef.current]
    );

    function onCreateTable(event: FormEvent) {
        event.preventDefault();
        const { rows, cols } = attributes;
        if (rows < 1 || cols < 1) return;

        let initialInnerBlocks: InnerBlockTemplate[] = [];
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                initialInnerBlocks.push(["tableberg/cell", { row: i, col: j }]);
            }
        }

        setAttributes({
            version: metadata.version,
            hasTableCreated: true,
            colWidths: Array(cols).fill(""),
            rowHeights: Array(rows).fill(""),
            cells: initialInnerBlocks.length,
        });
        storeActions.replaceInnerBlocks(
            clientId,
            createBlocksFromInnerBlocksTemplate(initialInnerBlocks)
        );
    }

    if (attributes.isExample) {
        return <img src={exampleImage} style={{ maxWidth: "100%" }}></img>;
    }

    if (!attributes.hasTableCreated) {
        /**
         * This shouln't be needed
         * Problem: default value of row is not set correctly
         * TODO: Figure out if it's WP bug or us thing
         * Added check for cols as cols maybe 0 too
         */
        if (attributes.rows < 1) {
            setAttributes({
                rows: metadata.attributes.rows.default,
            });
        }

        if (attributes.cols < 1) {
            setAttributes({
                cols: metadata.attributes.cols.default,
            });
        }
        return (
            <div {...innerBlocksProps}>
                <Placeholder
                    label={"Create Tableberg Table"}
                    icon={<BlockIcon icon={blockTable} showColors />}
                    instructions={
                        "Create a complex table with all types of element"
                    }
                >
                    <form
                        className="blocks-table__placeholder-form"
                        onSubmit={onCreateTable}
                    >
                        <TextControl
                            __nextHasNoMarginBottom
                            type="number"
                            label={"Column count"}
                            value={attributes.cols}
                            onChange={(count) => {
                                setAttributes({ cols: Number(count) });
                            }}
                            min="1"
                            className="blocks-table__placeholder-input"
                        />
                        <TextControl
                            __nextHasNoMarginBottom
                            type="number"
                            label={"Row count"}
                            value={attributes.rows}
                            onChange={(count) => {
                                setAttributes({ rows: Number(count) });
                            }}
                            min="1"
                            className="blocks-table__placeholder-input"
                        />
                        <Button
                            className="blocks-table__placeholder-button"
                            variant="primary"
                            type="submit"
                        >
                            {"Create Table"}
                        </Button>
                    </form>
                </Placeholder>
            </div>
        );
    }

    const rowTemplate = createArray(attributes.rows).map((i) => {
        let background;
        let className = "";
        if (i % 2 === 0) {
            background =
                attributes.oddRowBackgroundColor ??
                attributes.oddRowBackgroundGradient ??
                undefined;
        } else {
            background =
                attributes.evenRowBackgroundColor ??
                attributes.evenRowBackgroundGradient ??
                undefined;
        }

        if (i === 0 && attributes.enableTableHeader) {
            background =
                attributes.headerBackgroundColor ??
                attributes.headerBackgroundGradient ??
                undefined;
            className += "tableberg-header";
        }

        if (i + 1 === attributes.rows && attributes.enableTableFooter) {
            background =
                attributes.footerBackgroundColor ??
                attributes.footerBackgroundGradient ??
                undefined;
            className += "tableberg-footer";
        }

        return (
            <tr
                id={`tableberg-${clientId}-row-${i}`}
                style={{
                    height: attributes.rowHeights[i],
                    background,
                }}
                className={className}
            ></tr>
        );
    });

    return (
        <>
            <table {...blockProps}>
                <colgroup>
                    {attributes.colWidths.map((w) => (
                        <col width={w} />
                    ))}
                </colgroup>
                {rowTemplate}
            </table>
            <div style={{ display: "none" }} key={colUpt}>
                <div {...innerBlocksProps} />
            </div>
            <TablebergControls {...props} />
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
});
