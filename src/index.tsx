/**
 * WordPress Imports
 */
//@ts-ignore
import { isEmpty, get, last } from "lodash";
//@ts-ignore
import { useEffect } from "@wordpress/element";
import { Placeholder, TextControl, Button } from "@wordpress/components";
import { blockTable } from "@wordpress/icons";
import { useDispatch, useSelect } from "@wordpress/data";
import {
    useBlockProps,
    useInnerBlocksProps,
    store as blockEditorStore,
    BlockIcon,
} from "@wordpress/block-editor";
import { store as editorStore } from "@wordpress/editor";
import {
    BlockEditProps,
    InnerBlockTemplate,
    createBlocksFromInnerBlocksTemplate,
    registerBlockType,
    createBlock,
} from "@wordpress/blocks";
/**
 * Internal Imports
 */
import "./style.scss";
import metadata from "./block.json";
import { FormEvent, useState } from "react";
import TablebergControls from "./controls";
import { TablebergBlockAttrs } from "./types";
import { getStyles } from "./get-styles";
import classNames from "classnames";
import { getStyleClass } from "./get-classes";
import exampleImage from "./example.png";

const ALLOWED_BLOCKS = ["tableberg/row"];

function edit(props: BlockEditProps<TablebergBlockAttrs>) {
    const {
        attributes: {
            hasTableCreated,
            enableTableFooter,
            enableTableHeader,
            cols,
            isExample,
        },
        setAttributes,
        clientId,
    } = props;

    const blockProps = useBlockProps({
        className: classNames(getStyleClass(props.attributes)),
        style: getStyles(props.attributes),
    });

    // @ts-ignore
    const innerBlocksProps = useInnerBlocksProps(blockProps, {
        // @ts-ignore false can obviously be assigned to renderAppender as does
        // wordpress in their own blocks. Need to make a pr to @types/wordpress__block-editor.
        renderAppender: false,
        allowedBlocks: ALLOWED_BLOCKS,
    });

    const { block } = useSelect((select) => {
        return {
            //@ts-ignore
            block: select(blockEditorStore).getBlock(clientId),
        };
    }, []);

    const { hasEditorRedo, removeEmptyCols } = useSelect((select) => {
        const removeEmptyCols = () => {
            const storeSelect = select(blockEditorStore) as any;
            const rows = storeSelect.getBlocks(clientId);
            const row1cols = rows[0].innerBlocks;
            for (let i = 0; i < row1cols.length; i++) {
                /**
                 * If the i th col of the first row is empty,
                 * we can safely consider the whole i th column to be empty
                 */
                if (row1cols[i].innerBlocks.length === 0) {
                    rows.forEach(async (row: any) => {
                        const colIndex = storeSelect.getBlockIndex(
                            row.innerBlocks[i].clientId
                        );
                        await storeSelect
                            .getBlocks(clientId)
                            .forEach(async (row: any) => {
                                const cells = storeSelect.getBlockOrder(
                                    row.clientId
                                );
                                await removeBlock(cells[colIndex]);
                            });
                        removeBlock(row.innerBlocks[i]);
                    });
                    updateBlockAttributes(clientId, {
                        cols: row1cols.length - 1,
                    });
                    break;
                }
            }

            const lastRow = rows[rows.length - 1];
            if (lastRow?.innerBlocks && lastRow.innerBlocks[0].innerBlocks.length === 0) {
                /**
                 * If the first col of the last row is empty,
                 * we can safely consider the whole row to be empty
                 * because there will be a block if the row is normal
                 */
                const cells = storeSelect.getBlockOrder(
                    lastRow.clientId
                );
                cells.forEach(async (col: any) => {
                    await removeBlock(col);
                });
                removeBlock(lastRow);
                
                updateBlockAttributes(clientId, {
                    rows: rows.length - 1,
                });
            }
        };

        return {
            // @ts-ignore
            hasEditorRedo: select(editorStore).hasEditorRedo(),
            removeEmptyCols,
        };
    }, []);

    const {
        replaceInnerBlocks,
        insertBlocks,
        removeBlock,
        updateBlockAttributes,
    } = useDispatch(blockEditorStore);

    const [initialRowCount, setInitialRowCount] = useState<number | "">(2);
    const [initialColCount, setInitialColCount] = useState<number | "">(2);

    useEffect(() => {
        if (enableTableHeader) {
            const tableHeaderTemplate: InnerBlockTemplate[] = [
                [
                    "tableberg/row",
                    { isHeader: true },
                    new Array(initialColCount)
                        .fill(0)
                        .map(() => ["tableberg/cell", { tagName: "th" }, []]),
                ],
            ];
            insertBlocks(
                createBlocksFromInnerBlocksTemplate(tableHeaderTemplate),
                0,
                clientId
            );
        } else {
            const firstBlock = block.innerBlocks[0];
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
                    new Array(initialColCount)
                        .fill(0)
                        .map(() => ["tableberg/cell", { tagName: "th" }, []]),
                ],
            ];
            insertBlocks(
                createBlocksFromInnerBlocksTemplate(tableHeaderTemplate),
                block?.innerBlocks?.length + 1,
                clientId
            );
        } else {
            const lastBlock = last(block.innerBlocks);
            const isFooter = lastBlock?.attributes?.isFooter;

            if (isFooter) {
                removeBlock(lastBlock.clientId);
            }
        }
    }, [enableTableFooter]);

    if (hasEditorRedo) {
        removeEmptyCols();
    }

    function onCreateTable(event: FormEvent) {
        event.preventDefault();

        if (initialRowCount === "" || initialColCount === "") return;

        const initialInnerBlocks: InnerBlockTemplate[] = Array.from(
            { length: initialRowCount },
            () => [
                "tableberg/row",
                {},
                Array.from({ length: initialColCount }, () => [
                    "tableberg/cell",
                ]),
            ]
        );

        replaceInnerBlocks(
            clientId,
            createBlocksFromInnerBlocksTemplate(initialInnerBlocks)
        );
        setAttributes({
            hasTableCreated: true,
            rows: initialColCount,
            cols: initialColCount,
        });
    }

    function onChangeInitialColCount(count: string) {
        const value = count === "" ? "" : parseInt(count, 10) || 2;
        setInitialColCount(value);
    }

    function onChangeInitialRowCount(count: string) {
        const value = count === "" ? "" : parseInt(count, 10) || 2;
        setInitialRowCount(value);
    }

    const placeholder = (
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
                        value={initialColCount}
                        onChange={onChangeInitialColCount}
                        min="1"
                        className="blocks-table__placeholder-input"
                    />
                    <TextControl
                        __nextHasNoMarginBottom
                        type="number"
                        label={"Row count"}
                        value={initialRowCount}
                        onChange={onChangeInitialRowCount}
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

    const example = <img src={exampleImage} style={{ maxWidth: "100%" }}></img>;

    return (
        <>
            {isExample ? (
                example
            ) : hasTableCreated ? (
                <table {...innerBlocksProps} />
            ) : (
                placeholder
            )}
            <TablebergControls {...props} />
        </>
    );
}

function save() {
    const blockProps = useBlockProps.save();
    const innerBlocksProps = useInnerBlocksProps.save(blockProps);
    return <table {...innerBlocksProps} />;
}

//@ts-ignore
registerBlockType(metadata.name, {
    title: metadata.title,
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
                    //@ts-ignore
                    const tableBody = get(attributes, "body", []);
                    const tableHead = get(attributes, "head", []);
                    const tableFoot = get(attributes, "head", []);
                    const tableBodyBlocks = tableBody?.map((row: any) => [
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
                    const tableHeaderBlocks = tableHead?.map((row: any) => [
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
                    const tableFooterBlocks = tableFoot?.map((row: any) => [
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
                        // @ts-ignore
                        rows: attributes.body.length,
                        // @ts-ignore
                        cols: attributes.body[0].cells.length,
                        tableBorder: tableBorder,
                        innerBorder: tableBorder,
                        // @ts-ignore
                        enableTableFooter: attributes.foot.length > 0,
                        // @ts-ignore
                        enableTableHeader: attributes.head.length > 0,
                        // @ts-ignore
                        tableAlignment: !isEmpty(attributes.align)
                            ? // @ts-ignore
                              attributes.align
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
                        ])
                    );
                },
            },
        ],
    },
});
