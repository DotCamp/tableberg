import { registerBlockType } from "@wordpress/blocks";

import {
    useBlockProps,
    useInnerBlocksProps,
    InnerBlocks,
} from "@wordpress/block-editor";

import metadata from "./block.json";

function edit() {
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
    attributes: {},
    example: {},
    edit,
    save,
});
