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
            target === "tableberg/button" ?
                [target, { [targetAttribute]: value, text: "Add to cart" }] :
                [target, { [targetAttribute]: value }]
        ]
    });

    const targetBlock = useSelect((select) => {
        const { getBlock } = select(store) as BlockEditorStoreSelectors;

        const block = getBlock(clientId);

        return block?.innerBlocks.find(
            ({ name }) => name === target
        );
    }, []);

    const {
        updateBlockAttributes
    } = useDispatch(store) as any as BlockEditorStoreActions;

    if (targetBlock) {
        if (targetBlock.attributes[targetAttribute] != value) {
            updateBlockAttributes(targetBlock.clientId, { [targetAttribute]: value });
        }
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
