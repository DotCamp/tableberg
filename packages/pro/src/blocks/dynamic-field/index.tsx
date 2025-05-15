import { BlockEditProps, registerBlockType } from "@wordpress/blocks";
import metadata from "./block.json";
import blockIcon from "@tableberg/shared/icons/tableberg";
import {
    useBlockProps,
    useInnerBlocksProps,
    store,
    InnerBlocks,
} from "@wordpress/block-editor";
import { useDispatch, useSelect } from "@wordpress/data";

const allowedBlocks = [
    "core/paragraph",
    "tableberg/button",
    "tableberg/image"
] as const;

type DynamicFieldBlockAttr = {
    value: string;
    target: typeof allowedBlocks[number];
    targetAttribute: string;
}

function edit({ attributes, clientId }: BlockEditProps<DynamicFieldBlockAttr>) {
    const { value, target, targetAttribute } = attributes;

    const blockProps = useBlockProps();
    const innerBlocksProps = useInnerBlocksProps(blockProps, {
        // @ts-ignore
        allowedBlocks: allowedBlocks,
        template: [
            [target, { [targetAttribute]: value }]
        ]
    });

    const { content, targetBlockId } = useSelect((select) => {
        const { getBlock } = select(store) as BlockEditorStoreSelectors;

        const block = getBlock(clientId);

        const targetBlock = block?.innerBlocks.find(
            ({name}) => name === target
        );

        return {
            content: targetBlock?.attributes.content,
            targetBlockId: targetBlock?.clientId
        }
    }, []);

    const {
        updateBlockAttributes
    } = useDispatch(store) as any as BlockEditorStoreActions;

    if (content != value && targetBlockId) {
        updateBlockAttributes(targetBlockId, { [targetAttribute]: value });
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
