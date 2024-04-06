import { BlockEditProps, registerBlockType } from "@wordpress/blocks";

import metadata from "./block.json";
import blockIcon from "./icon";
import { useBlockProps, useInnerBlocksProps } from "@wordpress/block-editor";
import { getStyles } from "./get-styles";

interface StyledListProps {
    list: string;
    icon: any;
    selectedIcon: string;
    alignment: string;
    iconColor: string;
    iconSize: number;
    fontSize: number;
    itemSpacing: number;
    columns: number;
    maxMobileColumns: number;
    isRootList: boolean;
    textColor: string;
    backgroundColor: string;
    padding: object;
    margin: object;
}

const ALLOWED_BLOCKS = ["tableberg/styled-list-item"];

function edit(props: BlockEditProps<StyledListProps>) {
    const blockProps = useBlockProps({
        style: getStyles(props.attributes),
    });

    const innerBlocksProps = useInnerBlocksProps(blockProps as any, {
        allowedBlocks: ALLOWED_BLOCKS,
        template: [
            [
                "tableberg/styled-list-item",
            ],
        ],
    });

    return <ul {...innerBlocksProps}></ul>;
}

function save () {
    const blockProps = useBlockProps.save();
    const innerBlocksProps = useInnerBlocksProps.save(blockProps);
    return <ul {...innerBlocksProps} />;
}

registerBlockType(metadata as any, {
    icon: blockIcon,
    attributes: metadata.attributes as any,
    edit,
    save
});

