import { BlockEditProps, registerBlockType } from "@wordpress/blocks";

import {
    useBlockProps,
    useInnerBlocksProps,
    InnerBlocks,
    store as blockEditorStore,
} from "@wordpress/block-editor";
import { useSelect } from "@wordpress/data";

import metadata from "./block.json";

interface TBRowAttrs {}

const ALLOWED_BLOCKS = ["tableberg/cell"];

function edit({ clientId }: BlockEditProps<TBRowAttrs>) {
    const blockProps = useBlockProps();

    const hasInnerBlocks = useSelect(
        (select) =>
            (select(blockEditorStore) as any).getBlocks(clientId).length > 0,
        [clientId]
    );

    const innerBlocksProps = useInnerBlocksProps(blockProps, {
        renderAppender: hasInnerBlocks
            ? undefined
            : InnerBlocks.ButtonBlockAppender,
        allowedBlocks: ALLOWED_BLOCKS,
    });

    return <tr {...innerBlocksProps} />;
}

function save() {
    const blockProps = useBlockProps.save();
    const innerBlocksProps = useInnerBlocksProps.save(blockProps);
    return <tr {...innerBlocksProps} />;
}

registerBlockType(metadata.name, {
    title: metadata.title,
    category: metadata.category,
    attributes: {},
    example: {},
    edit,
    save,
});
