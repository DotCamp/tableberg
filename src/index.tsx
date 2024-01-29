/**
 * WordPress Imports
 */
import { isEmpty, get, last } from "lodash";
import { Placeholder, TextControl, Button } from "@wordpress/components";
import { blockTable } from "@wordpress/icons";
import { useDispatch, useSelect } from "@wordpress/data";
import {
    useBlockProps,
    useInnerBlocksProps,
    store as blockEditorStore,
    BlockIcon,
} from "@wordpress/block-editor";
const editorStore = "core/editor";
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
import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import TablebergControls from "./controls";
import { TablebergBlockAttrs } from "./types";
import { getStyles } from "./get-styles";
import classNames from "classnames";
import { getStyleClass } from "./get-classes";
import exampleImage from "./example.png";
import blockIcon from "./components/icon";
import { createArray } from "./utils";
import { TablebergCellBlockAttrs } from "./cell";

const ALLOWED_BLOCKS = ["tableberg/cell"];

function edit(props: BlockEditProps<TablebergBlockAttrs>) {
    const { attributes, setAttributes, clientId } = props;
    const tableRef = useRef<HTMLTableElement>();

    const blockProps = useBlockProps({
        ref: tableRef,
        style: getStyles(props.attributes),
        className: classNames(getStyleClass(props.attributes)),
    } as Record<string, any>);

    const innerBlocksProps = useInnerBlocksProps({
        // @ts-ignore false can obviously be assigned to renderAppender as does
        // wordpress in their own blocks. Need to make a pr to @types/wordpress__block-editor.
        renderAppender: false,
        allowedBlocks: ALLOWED_BLOCKS,
    });

    const { replaceInnerBlocks, updateBlockAttributes } = useDispatch(
        blockEditorStore,
    ) as BlockEditorStoreActions;

    let hasInvalidCols = false;

    const { hasEditorRedo, removeEmptyColsOrRows } = useSelect((select) => {
        const removeEmptyColsOrRows = () => {
            const { rows, cols } = attributes;
            const thisBlock: BlockInstance<TablebergBlockAttrs> = (
                select(blockEditorStore) as BlockEditorStoreSelectors
            ).getBlock(clientId)! as any;

            const cellBlocks: BlockInstance<TablebergCellBlockAttrs>[] =
                thisBlock.innerBlocks as any;

            if (cellBlocks?.length !== rows * cols) {
                hasInvalidCols = true;
            } else if (hasInvalidCols) {
                let lastCol = 0,
                    lastRow = 0;
                const newCellBlocks: BlockInstance<TablebergCellBlockAttrs>[] =
                    [];
                cellBlocks?.forEach(
                    (cell: BlockInstance<TablebergCellBlockAttrs>) => {
                        cell.attributes.col = lastCol;
                        cell.attributes.row = lastRow;
                        lastCol++;

                        const lastColRem = lastCol % rows;
                        if (lastColRem !== lastCol) {
                            lastRow++;
                            lastCol = lastColRem;
                        }
                        newCellBlocks.push(cell);
                    },
                );
                replaceInnerBlocks(clientId, newCellBlocks);

                updateBlockAttributes(clientId, {
                    rows,
                    cols,
                });
                hasInvalidCols = false;
            }
        };

        return {
            hasEditorRedo: (
                select(editorStore) as EditorStoreSelectors
            ).hasEditorRedo(),
            removeEmptyColsOrRows,
        };
    }, []);

    if (hasEditorRedo) {
        removeEmptyColsOrRows();
    }

    useEffect(() => {
        // Do something here to re render the cells
        // otherwise the newly inserted cell appears in the last position
    }, [attributes.cols]);

    useSelect(
        (select) => {
            tableRef.current?.addEventListener(
                "keydown",
                (evt: KeyboardEvent) => {
                    if (evt.key !== "Backspace" && evt.key !== "Delete") {
                        return;
                    }
                    const cur: BlockInstance<TablebergCellBlockAttrs> = (
                        select("core/block-editor") as any
                    ).getSelectedBlock();
                    const storeSelect = select(
                        blockEditorStore,
                    ) as BlockEditorStoreSelectors;
                    if (
                        storeSelect.getBlockName(cur.clientId) ===
                        "tableberg/cell"
                    ) {
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
        [attributes.hasTableCreated],
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
            hasTableCreated: true,
            colWidths: Array(cols).fill(""),
            rowHeights: Array(rows).fill(""),
        });
        replaceInnerBlocks(
            clientId,
            createBlocksFromInnerBlocksTemplate(initialInnerBlocks),
        );
    }

    if (attributes.isExample) {
        return <img src={exampleImage} style={{ maxWidth: "100%" }}></img>;
    }

    if (!attributes.hasTableCreated) {
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

    return (
        <>
            <table {...blockProps}>
                <colgroup>
                    {attributes.colWidths.map((w) => (
                        <col width={w} />
                    ))}
                </colgroup>
                {createArray(attributes.rows).map((i) => (
                    <tr
                        id={`tableberg-${clientId}-row-${i}`}
                        style={
                            {
                                "--tableberg-row-height":
                                    attributes.rowHeights[i],
                            } as any
                        }
                    ></tr>
                ))}
            </table>
            <div style={{ display: "none" }}>
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
