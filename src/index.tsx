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
import { setOwnerDocument } from "./store/const";

const ALLOWED_BLOCKS = ["tableberg/cell"];

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

    const { replaceInnerBlocks, updateBlockAttributes } = useDispatch(
        blockEditorStore,
    ) as BlockEditorStoreActions;

    const { hasEditorRedo, fixUndoAddingRowsOrCols } = useSelect((select) => {
        const fixUndoAddingRowsOrCols = () => {
            const thisBlock: BlockInstance<TablebergBlockAttrs> = (
                select(blockEditorStore) as BlockEditorStoreSelectors
            ).getBlock(clientId)! as any;

            const cellBlocks: TablebergCellInstance[] =
                thisBlock.innerBlocks as any;

            if (cellBlocks?.length === thisBlock.attributes.cells) {
                return;
            }
            //TODO: fix the undo problem
        };

        return {
            hasEditorRedo: (
                select(editorStore) as EditorStoreSelectors
            ).hasEditorRedo(),
            fixUndoAddingRowsOrCols,
        };
    }, []);

    if (hasEditorRedo) {
        fixUndoAddingRowsOrCols();
    }

    const [colUpt, setColUpt] = useState(0);

    useEffect(() => {
        setColUpt((old) => old + 1);
    }, [attributes.cols]);

    // "--tableberg-footer-bg-color": !isEmpty(footerBackgroundColor)
    //     ? footerBackgroundColor
    //     : footerBackgroundGradient,
    // "--tableberg-header-bg-color": !isEmpty(headerBackgroundColor)
    //     ? headerBackgroundColor
    //     : headerBackgroundGradient,

    const headerBg =
        attributes.headerBackgroundColor ??
        attributes.headerBackgroundGradient ??
        undefined;
    const footerBg =
        attributes.footerBackgroundColor ??
        attributes.footerBackgroundGradient ??
        undefined;

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
                },
            );
        },
        [tableRef.current],
    );

    useEffect(() => {
        if (!tableRef.current) {
            return;
        }
        setOwnerDocument(tableRef.current.ownerDocument);
    }, [tableRef.current]);

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
            cells: initialInnerBlocks.length,
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

    const rowTemplate = createArray(attributes.rows).map((i) => {
        let backgroundColor;

        if (i % 2 === 0) {
            backgroundColor =
                attributes.oddRowBackgroundColor ??
                attributes.oddRowBackgroundGradient ??
                undefined;
        } else {
            backgroundColor =
                attributes.evenRowBackgroundColor ??
                attributes.evenRowBackgroundGradient ??
                undefined;
        }

        if (i === 0 && attributes.enableTableHeader) {
            backgroundColor =
                attributes.headerBackgroundColor ??
                attributes.headerBackgroundGradient ??
                undefined;
        }

        if (i + 1 === attributes.rows && attributes.enableTableFooter) {
            backgroundColor =
                attributes.footerBackgroundColor ??
                attributes.footerBackgroundGradient ??
                undefined;
        }

        return (
            <tr
                id={`tableberg-${clientId}-row-${i}`}
                style={{
                    height: attributes.rowHeights[i],
                    backgroundColor,
                }}
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
