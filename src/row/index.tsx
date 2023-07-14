import { BlockEditProps, registerBlockType } from "@wordpress/blocks";

import {
    useBlockProps,
    useInnerBlocksProps,
    InnerBlocks,
} from "@wordpress/block-editor";

import metadata from "./block.json";

interface TBRowAttrs {
    cols: number;
}

function edit({ attributes: { cols } }: BlockEditProps<TBRowAttrs>) {
    const blockProps = useBlockProps();

    const innerBlocksProps = useInnerBlocksProps(blockProps, {
        renderAppender: InnerBlocks.ButtonBlockAppender,
    });

    return <tr {...innerBlocksProps} />;
}

export default function save() {
    return <tr></tr>;
}

registerBlockType(metadata.name, {
    title: metadata.title,
    category: metadata.category,
    attributes: {
        cols: {
            type: "number",
            default: 2,
        },
    },
    example: {},
    edit,
    save,
});
