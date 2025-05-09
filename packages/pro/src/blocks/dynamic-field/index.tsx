import { BlockEditProps, createBlocksFromInnerBlocksTemplate, InnerBlockTemplate, registerBlockType } from "@wordpress/blocks";
import metadata from "./block.json";
import blockIcon from "@tableberg/shared/icons/tableberg";
import {
    useBlockProps,
    useInnerBlocksProps,
    store,
    InnerBlocks,
} from "@wordpress/block-editor";
import { useDispatch, useSelect } from "@wordpress/data";

type DynamicFieldBlockAttr = {
    value: string;
    target: "paragraph" | "button" | "image";
}

const blockMappings = new Map([
    ["paragraph", "core/paragraph"],
    ["button", "tableberg/button"],
    ["image", "tableberg/image"]
]);

function edit({ attributes, setAttributes, clientId }: BlockEditProps<DynamicFieldBlockAttr>) {
    const { value, target } = attributes;

    const targetBlockType = blockMappings.get(target);

    const blockProps = useBlockProps();
    const innerBlocksProps = useInnerBlocksProps(blockProps, {
        allowedBlocks: ["core/paragraph"],
        template: [
            ["core/paragraph", {}]
        ]
    });

    const { content, targetBlockId } = useSelect((select) => {
        const { getBlock } = select(store) as BlockEditorStoreSelectors;

        const block = getBlock(clientId);

        const targetBlock = block?.innerBlocks.find(({name}) => name === targetBlockType);

        return {
            content: targetBlock?.attributes.content,
            targetBlockId: targetBlock?.clientId,
        }
    }, []);

    const { updateBlockAttributes } = useDispatch(store) as any as BlockEditorStoreActions;

    if (content != value && targetBlockId) {
        updateBlockAttributes(targetBlockId, { content: value });
    }

    return <div {...innerBlocksProps}></div>;
}

registerBlockType(metadata as any, {
    attributes: metadata.attributes as any,
    icon: blockIcon,
    edit,
    save: () => {
        const blockProps = useBlockProps.save();

        return (
            <div {...blockProps}>
                <InnerBlocks.Content />
            </div>
        );
    }
});
