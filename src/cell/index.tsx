import { BlockEditProps, registerBlockType } from "@wordpress/blocks";
import {
    BlockAlignmentToolbar,
    BlockVerticalAlignmentToolbar,
    BlockControls,
    store as blockEditorStore,
} from "@wordpress/block-editor";
import { useBlockProps, useInnerBlocksProps } from "@wordpress/block-editor";
import { useSelect } from "@wordpress/data";

import "./style.scss";
import "./editor.scss";

import metadata from "./block.json";
import classNames from "classnames";

interface TablebergCellBlockAttrs {
    align: "left" | "right" | "center";
    vAlign: "bottom" | "center" | "top";
}

const ALLOWED_BLOCKS = ["core/paragraph", "tableberg/button"];

function edit({
    clientId,
    attributes,
    setAttributes,
}: BlockEditProps<TablebergCellBlockAttrs>) {
    const hasInnerBlocks = useSelect(
        (select) =>
            (select(blockEditorStore) as any).getBlocks(clientId).length > 0,
        [clientId]
    );

    const { align, vAlign } = attributes;

    const hAlignChange = (newValue: "left" | "right" | "center") => {
        setAttributes({ align: newValue });
    };

    const vAlignChange = (newValue: "bottom" | "center" | "top") => {
        setAttributes({ vAlign: newValue });
    };

    const className = classNames({
        [`align-${align}`]: align,
        [`align-v-${vAlign}`]: vAlign,
    });

    const blockProps = useBlockProps({ className });

    const innerBlocksProps = useInnerBlocksProps(
        { ...blockProps },
        {
            allowedBlocks: ALLOWED_BLOCKS,
            template: [["core/paragraph"]],
        }
    );

    return (
        <>
            <td {...innerBlocksProps} />
            <BlockControls group="block">
                <BlockAlignmentToolbar
                    value={align}
                    onChange={hAlignChange}
                    controls={["left", "center", "right"]}
                />
                <BlockVerticalAlignmentToolbar
                    value={vAlign}
                    onChange={vAlignChange}
                />
            </BlockControls>
        </>
    );
}

function save() {
    const blockProps = useBlockProps.save();
    const innerBlocksProps = useInnerBlocksProps.save(blockProps);
    return <td {...innerBlocksProps} />;
}

registerBlockType(metadata.name, {
    title: metadata.title,
    category: metadata.category,
    attributes: {
        align: {
            type: "string",
            default: "left",
        },
        vAlign: {
            type: "string",
            default: "top",
        },
    },
    example: {},
    edit,
    save,
});
