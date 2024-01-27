import {
    BlockEditProps,
    registerBlockType,
    createBlocksFromInnerBlocksTemplate,
    createBlock,
    BlockInstance,
    BlockSaveProps,
    InnerBlockTemplate,
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
import { useEffect, useRef, useState } from "react";
import { store as tbStore } from "../store";
import CellControls from "./controls";
import { createPortal } from "react-dom";
import { createArray } from "../utils";

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
        tableBlockId,
    } = useSelect(
        (select) => {
            const storeSelect = select(
                blockEditorStore
            ) as BlockEditorStoreSelectors;

            const parentBlocks = storeSelect.getBlockParents(clientId);

            const tableBlockId = parentBlocks.find(
                (parentId: string) =>
                    storeSelect.getBlockName(parentId) === "tableberg/table"
            )!;

            return {
                tableBlockId,
            };
        },
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

    // to be implemented
    // table operations: add col/row before/after, delete col/row
    // set row height
    // set col width
    // cell merging

    const TagName = attributes.tagName ?? "td";

    const [targetEl, setTargetEl] = useState<Element>();

    useEffect(() => {
        const iframe = document.querySelector<HTMLIFrameElement>(
            'iframe[name="editor-canvas"]'
        );
        const id = `#tableberg-${tableBlockId}-row-${attributes.row}`;
        const el = (iframe?.contentWindow?.document || document).querySelector(id)!;
        el && setTargetEl(el);
    }, [attributes.row]);

    return (
        <>
            {targetEl ?
                createPortal(
                    <TagName
                        {...innerBlocksProps}
                        rowSpan={attributes.rowspan}
                        colSpan={attributes.colspan}
                    />,
                    targetEl
                ) : <TagName
                    {...innerBlocksProps}
                    rowSpan={attributes.rowspan}
                    colSpan={attributes.colspan}
                />}
            <BlockControls group="block">
                <BlockVerticalAlignmentToolbar
                    value={vAlign}
                    onChange={vAlignChange}
                />
            </BlockControls>
            { /*
            <BlockControls group="other" __experimentalShareWithChildBlocks>
                <ToolbarDropdownMenu
                    hasArrowIndicator
                    icon={table}
                label={"Edit table"}
                controls={tableControls}
                />
            </BlockControls>
            */ }
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
