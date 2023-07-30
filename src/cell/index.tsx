import { BlockEditProps, registerBlockType } from "@wordpress/blocks";
import { store as blockEditorStore } from "@wordpress/block-editor";
import {
    useBlockProps,
    useInnerBlocksProps,
    InnerBlocks,
} from "@wordpress/block-editor";
import { useSelect } from "@wordpress/data";

import "./style.scss";
import "./editor.scss";

import metadata from "./block.json";

const ALLOWED_BLOCKS = [
    "core/image",
    "core/list",
    "core/buttons",
    "core/heading",
    "core/code",
    "core/social-links",
    "core/paragraph",
];

function edit({ clientId }: BlockEditProps<{}>) {
    const blockProps = useBlockProps();

    const hasInnerBlocks = useSelect(
        (select) =>
            (select(blockEditorStore) as any).getBlocks(clientId).length > 0,
        [clientId]
    );

    const innerBlocksProps = useInnerBlocksProps(blockProps, {
        allowedBlocks: ALLOWED_BLOCKS,
        template: [["core/paragraph"]],
    });

    return <td {...innerBlocksProps} />;
}

function save() {
    const blockProps = useBlockProps.save();
    const innerBlocksProps = useInnerBlocksProps.save(blockProps);
    return <td {...innerBlocksProps} />;
}

registerBlockType(metadata.name, {
    title: metadata.title,
    category: metadata.category,
    attributes: {},
    example: {},
    edit,
    save,
});
