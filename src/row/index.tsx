import {
    BlockEditProps,
    BlockSaveProps,
    registerBlockType,
} from "@wordpress/blocks";

import {
    useBlockProps,
    useInnerBlocksProps,
    InnerBlocks,
    store as blockEditorStore,
} from "@wordpress/block-editor";
import { useSelect } from "@wordpress/data";

import metadata from "./block.json";
import classNames from "classnames";
import RowControls from "./controls";

interface TBRowAttrs {
    tagName: string;
    isHeader: boolean;
    isFooter: boolean;
    height: string;
}

const ALLOWED_BLOCKS = ["tableberg/cell"];

function edit({
    clientId,
    attributes,
    setAttributes,
}: BlockEditProps<TBRowAttrs>) {
    const style: Record<string, string> = {};

    if (attributes.height) {
        style["--tableberg-row-height"] = attributes.height;
    }

    const blockProps = useBlockProps({
        className: classNames("tableberg-row", {
            "tableberg-header": attributes.isHeader,
            "tableberg-footer": attributes.isFooter,
        }),
        style,
    });

    const hasInnerBlocks = useSelect(
        (select) =>
            (select(blockEditorStore) as BlockEditorStoreSelectors).getBlocks(
                clientId
            ).length > 0,
        [clientId]
    );

    const innerBlocksProps = useInnerBlocksProps(
        { ...blockProps },
        {
            renderAppender: hasInnerBlocks
                ? undefined
                : InnerBlocks.ButtonBlockAppender,
            allowedBlocks: ALLOWED_BLOCKS,
        }
    );
    const TagName = attributes?.tagName;

    return (
        <>
            <TagName {...innerBlocksProps} />
            <RowControls
                height={attributes.height}
                setHeight={(height) => setAttributes({ height })}
            />
        </>
    );
}

function save({ attributes }: BlockSaveProps<TBRowAttrs>) {
    const blockProps = useBlockProps.save();
    const innerBlocksProps = useInnerBlocksProps.save(blockProps);
    const TagName = attributes?.tagName;

    return <TagName {...innerBlocksProps} />;
}

registerBlockType(metadata.name, {
    title: metadata.title,
    category: metadata.category,
    attributes: metadata.attributes as any,
    example: {},
    edit,
    save,
});
