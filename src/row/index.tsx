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

interface TBRowAttrs {
    tagName: string;
    isHeader: boolean;
    isFooter: boolean;
}

const ALLOWED_BLOCKS = ["tableberg/cell"];

function edit({ clientId, attributes }: BlockEditProps<TBRowAttrs>) {
    const blockProps = useBlockProps({
        className: classNames("tableberg-row", {
            "tableberg-header": attributes.isHeader,
            "tableberg-footer": attributes.isFooter,
        }),
    });

    const hasInnerBlocks = useSelect(
        (select) =>
            (select(blockEditorStore) as any).getBlocks(clientId).length > 0,
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

    return <TagName {...innerBlocksProps} />;
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
    attributes: {
        tagName: {
            type: "string",
            default: "tr",
        },
        isHeader: {
            type: "boolean",
            default: false,
        },
        isFooter: {
            type: "boolean",
            default: false,
        },
    },
    example: {},
    edit,
    save,
});
