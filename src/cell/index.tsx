import { BlockEditProps, registerBlockType } from "@wordpress/blocks";
import { store as blockEditorStore } from "@wordpress/block-editor";
import {
    useBlockProps,
    useInnerBlocksProps,
    InnerBlocks,
} from "@wordpress/block-editor";
import { useSelect } from "@wordpress/data";

import metadata from "./block.json";

const ALLOWED_BLOCKS = [
    "core/image",
    "core/list",
    "core/buttons",
    "core/heading",
    "core/code",
    "core/social-links",
];

function edit({ clientId }: BlockEditProps<{}>) {
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

    return <td {...innerBlocksProps} />;
}

export default function save() {
    return <td></td>;
}

registerBlockType(metadata.name, {
    title: metadata.title,
    category: metadata.category,
    attributes: {},
    example: {},
    edit,
    save,
});
