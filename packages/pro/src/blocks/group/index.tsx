import { __, _x } from "@wordpress/i18n";
import metadata from "./block.json";
import { BlockEditProps, registerBlockType } from "@wordpress/blocks";
import {
    useBlockProps,
    useInnerBlocksProps,
    store as blockEditorStore,
    InnerBlocks,
} from "@wordpress/block-editor";

import classNames from "classnames";
import { group as blockIcon } from "@wordpress/icons";
import { useSelect } from "@wordpress/data";

interface GroupAttrs {}

const ALLOWED_BLOCKS = [
    "core/paragraph",
    "core/list",
    "tableberg/group",
    "tableberg/icon",
    "tableberg/styled-list",
    "tableberg/html",
    "tableberg/ribbon",
    "tableberg/star-rating",
    "tableberg/button",
    "tableberg/image",
];

import { row, grid } from "@wordpress/icons";

const variations = [
    {
        name: "group",
        title: _x("Group", "single horizontal line"),
        description: __("Arrange blocks horizontally."),
        attributes: { layout: { type: "flex", flexWrap: "nowrap" } },
        scope: ["block", "inserter", "transform"],
        isDefault: true,
        isActive: (blockAttributes: any) =>
            blockAttributes.layout?.type === "flex" &&
            (!blockAttributes.layout?.orientation ||
                blockAttributes.layout?.orientation === "horizontal"),
        icon: row,
    },

    {
        name: "group-grid",
        title: __("Grid"),
        description: __("Arrange blocks in a grid."),
        attributes: { layout: { type: "grid" } },
        scope: ["block", "inserter", "transform"],
        isActive: (blockAttributes: any) =>
            blockAttributes.layout?.type === "grid",
        icon: grid,
    },
];

export default variations;

function edit({ clientId }: BlockEditProps<GroupAttrs>) {
    const { hasInnerBlocks } = useSelect(
        (select) => {
            const { getBlock } = select(
                blockEditorStore,
            ) as BlockEditorStoreSelectors;
            const block = getBlock(clientId);
            return {
                hasInnerBlocks: !!(block && block.innerBlocks.length),
            };
        },
        [clientId],
    );
    const blockProps = useBlockProps({
        className: classNames({
            "tableberg-group": true,
        }),
    });

    let renderAppender;
    if (!hasInnerBlocks) {
        renderAppender = InnerBlocks.ButtonBlockAppender;
    }

    const innerBlocksProps = useInnerBlocksProps(blockProps as any, {
        allowedBlocks: ALLOWED_BLOCKS,
        renderAppender,
    });

    return (
        <div {...innerBlocksProps} />
    );
}


function save() {
    const blockProps = useBlockProps.save();
    const innerBlocksProps = useInnerBlocksProps.save(blockProps);
    return <div {...innerBlocksProps} />;
}

registerBlockType(metadata as any, {
    attributes: metadata.attributes as any,
    edit,
    save,
    icon: blockIcon,
    // @ts-ignore
    variations,
});
