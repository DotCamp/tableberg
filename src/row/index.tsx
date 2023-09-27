import { BlockEditProps, registerBlockType } from "@wordpress/blocks";

import {
    useBlockProps,
    useInnerBlocksProps,
    InnerBlocks,
    store as blockEditorStore,
} from "@wordpress/block-editor";
import { useSelect } from "@wordpress/data";

import metadata from "./block.json";

interface TBRowAttrs {
    tagName: string;
}

const ALLOWED_BLOCKS = ["tableberg/cell"];

function edit({ clientId, attributes }: BlockEditProps<TBRowAttrs>) {
    const blockProps = useBlockProps({ className: "tableberg-row" });

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
    const TagName = attributes?.tagName;

    return <TagName {...innerBlocksProps} />;
}

function save({ attributes }: BlockEditProps<TBRowAttrs>) {
    const blockProps = useBlockProps.save();
    const innerBlocksProps = useInnerBlocksProps.save(blockProps);
    const TagName = attributes?.tagName;

    return <TagName {...innerBlocksProps} />;
}

//@ts-ignore
registerBlockType(metadata.name, {
    title: metadata.title,
    category: metadata.category,
    attributes: metadata.attributes,
    example: {},
    edit,
    save,
});
