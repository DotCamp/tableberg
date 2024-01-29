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
    createBlock,
    BlockInstance,
} from "@wordpress/blocks";
/**
 * Internal Imports
 */
import "./style.scss";
import metadata from "./block.json";
import { FormEvent, useEffect } from "react";
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
    const {
        attributes: {
            hasTableCreated,
            enableTableFooter,
            enableTableHeader,
            colWidths,
            rowHeights,
            isExample,
            rows,
            cols,
        },
        setAttributes,
        clientId,
    } = props;

    const blockProps = useBlockProps({
        className: classNames(getStyleClass(props.attributes)),
        style: getStyles(props.attributes),
    } as Record<string, any>);

    const innerBlocksProps = useInnerBlocksProps({
        // @ts-ignore false can obviously be assigned to renderAppender as does
        // wordpress in their own blocks. Need to make a pr to @types/wordpress__block-editor.
        renderAppender: false,
        allowedBlocks: ALLOWED_BLOCKS,
    });

    const {
        replaceInnerBlocks,
        insertBlocks,
        removeBlock,
        updateBlockAttributes,
    } = useDispatch(blockEditorStore) as BlockEditorStoreActions;

    const { block } = useSelect((select) => {
        return {
            block: (
                select(blockEditorStore) as BlockEditorStoreSelectors
            ).getBlock(clientId),
        };
    }, []);

    let hasInvalidCols = false;

    const { hasEditorRedo, removeEmptyColsOrRows } = useSelect((select) => {
        const removeEmptyColsOrRows = () => {
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

    useEffect(() => {
        if (enableTableHeader) {
            const tableHeaderTemplate: InnerBlockTemplate[] = [
                [
                    "tableberg/row",
                    { isHeader: true },
                    new Array(props.attributes.cols ?? cols)
                        .fill(0)
                        .map(() => ["tableberg/cell", { tagName: "th" }, []]),
                ],
            ];
            insertBlocks(
                createBlocksFromInnerBlocksTemplate(tableHeaderTemplate),
                0,
                clientId,
            );
        } else {
            const firstBlock = block?.innerBlocks[0];
            const isHeader = firstBlock?.attributes?.isHeader;

            if (isHeader) {
                removeBlock(firstBlock.clientId);
            }
        }
    }, [enableTableHeader]);
    useEffect(() => {
        if (enableTableFooter) {
            const tableHeaderTemplate: InnerBlockTemplate[] = [
                [
                    "tableberg/row",
                    { isFooter: true },
                    new Array(props.attributes.cols ?? cols)
                        .fill(0)
                        .map(() => ["tableberg/cell", { tagName: "th" }, []]),
                ],
            ];
            insertBlocks(
                createBlocksFromInnerBlocksTemplate(tableHeaderTemplate),
                block?.innerBlocks?.length! + 1,
                clientId,
            );
        } else {
            const lastBlock = last(block?.innerBlocks);
            const isFooter = lastBlock?.attributes?.isFooter;

            if (isFooter) {
                removeBlock(lastBlock.clientId);
            }
        }
    }, [enableTableFooter]);

    if (hasEditorRedo) {
        removeEmptyColsOrRows();
    }

    function onCreateTable(event: FormEvent) {
        event.preventDefault();

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

    if (isExample) {
        return <img src={exampleImage} style={{ maxWidth: "100%" }}></img>;
    }

    if (!hasTableCreated) {
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
                            value={cols}
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
                            value={rows}
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
                    {colWidths.map((w) => (
                        <col width={w} />
                    ))}
                </colgroup>
                {createArray(rows).map((i) => (
                    <tr
                        id={`tableberg-${clientId}-row-${i}`}
                        style={
                            {
                                "--tableberg-row-height": rowHeights[i],
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
    transforms: {
        from: [
            {
                type: "block",
                blocks: ["core/table"],
                transform: function (attributes) {
                    const tableBorder = get(attributes, "style.border", {});
                    const tableBody = get(attributes, "body", []);
                    const tableHead = get(attributes, "head", []);
                    const tableFoot = get(attributes, "head", []);
                    const tableBodyBlocks: InnerBlockTemplate[] =
                        tableBody?.map((row: any) => [
                            "tableberg/row",
                            {},
                            row.cells?.map((cell: any) => [
                                "tableberg/cell",
                                {},
                                [
                                    [
                                        "core/paragraph",
                                        {
                                            content: cell.content,
                                            align: cell.align,
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
                            ]),
                        ]);
                    const tableHeaderBlocks: InnerBlockTemplate[] =
                        tableHead?.map((row: any) => [
                            "tableberg/row",
                            {},
                            row.cells?.map((cell: any) => [
                                "tableberg/cell",
                                { tagName: "th" },
                                [
                                    [
                                        "core/paragraph",
                                        {
                                            content: cell.content,
                                            align: cell.align,
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
                            ]),
                        ]);
                    const tableFooterBlocks: InnerBlockTemplate[] =
                        tableFoot?.map((row: any) => [
                            "tableberg/row",
                            {},
                            row.cells?.map((cell: any) => [
                                "tableberg/cell",
                                {
                                    tagName: "th",
                                },
                                [
                                    [
                                        "core/paragraph",
                                        {
                                            content: cell.content,
                                            align: cell.align,
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
                            ]),
                        ]);

                    const tablebergAttributes = {
                        rows: (attributes as any).body.length,
                        cols: (attributes as any).body[0].cells.length,
                        tableBorder: tableBorder,
                        innerBorder: tableBorder,
                        enableTableFooter: (attributes as any).foot.length > 0,
                        enableTableHeader: (attributes as any).head.length > 0,
                        tableAlignment: !isEmpty((attributes as any).align)
                            ? (attributes as any).align
                            : "center",
                        hasTableCreated: true,
                    };
                    return createBlock(
                        "tableberg/table",
                        tablebergAttributes,
                        createBlocksFromInnerBlocksTemplate([
                            ...tableHeaderBlocks,
                            ...tableBodyBlocks,
                            ...tableFooterBlocks,
                        ]),
                    );
                },
            },
        ],
    },
});
