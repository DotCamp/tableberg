import { __ } from "@wordpress/i18n";

import {
    BlockEditProps,
    BlockInstance,
    createBlock,
    registerBlockType,
} from "@wordpress/blocks";
import {
    RichText,
    useBlockProps,
    store as blockEditorStore,
    InspectorControls,
} from "@wordpress/block-editor";
import { listItemIcon } from "../icon";
import metadata from "./block.json";
import { getItemStyles } from "../get-styles";
import { useDispatch, useSelect } from "@wordpress/data";
import { useCallback } from "react";
import { PanelBody } from "@wordpress/components";
import { SpacingControl } from "@tableberg/components";
import { StyledListProps } from "..";
import SVGComponent from "../get-icon";
import classNames from "classnames";

export interface StyledListItemProps {
    icon?: any;
    text: string;
    iconColor: string;
    iconSize: number;
    fontSize: number;
    padding: object;
    margin: object;
}

function edit(props: BlockEditProps<StyledListItemProps>) {
    const { attributes, setAttributes, clientId } = props;
    const { text } = attributes;

    const storeActions: BlockEditorStoreActions = useDispatch(
        blockEditorStore,
    ) as any;

    const { listItemBlock, listBlock, getBlockIndex } = useSelect(
        (select) => {
            const storeSelect = select(
                blockEditorStore,
            ) as BlockEditorStoreSelectors;
            const listItemBlock = storeSelect.getBlock(clientId)!;
            const parentIds = storeSelect.getBlockParents(clientId)!;
            const listBlockId = parentIds[parentIds.length - 1];
            const listBlock: BlockInstance<StyledListProps> = storeSelect.getBlock(listBlockId)! as any;
            return {
                listItemBlock,
                listBlock,
                getBlockIndex: storeSelect.getBlockIndex,
            };
        },
        [clientId],
    );

    const blockProps = useBlockProps({
        style: getItemStyles(attributes),
        className: classNames({
            "tableberg-list-item-has-icon": !listBlock.attributes.isOrdered
        })
    });

    const handleItemDeletion = useCallback(
        (forward: boolean) => {
            if (forward) {
                // Delete is press
                if (listBlock.innerBlocks.length <= 1) {
                    setAttributes({
                        text: "",
                    });
                } else {
                    storeActions.removeBlock(clientId, true);
                }
                return;
            }
            const currentIndex = getBlockIndex(clientId);
            // Backspace
            if (listBlock.innerBlocks.length <= 1 || currentIndex == 0) {
                return;
            }
            const prevItem = listBlock.innerBlocks[currentIndex - 1];
            storeActions.updateBlockAttributes(prevItem.clientId, {
                text: prevItem.attributes.text + " " + text,
            });
            storeActions.removeBlock(clientId, true);
        },
        [listItemBlock],
    );

    return (
        <>
            <li {...blockProps}>
                {!listBlock.attributes.isOrdered && <SVGComponent icon={listBlock.attributes.icon}/>}
                <RichText
                    tagName="div"
                    value={text}
                    placeholder="List item"
                    keepPlaceholderOnFocus={true}
                    onChange={(text) => setAttributes({ text })}
                    onSplit={(itemFragment) => {
                        const newAttrs = Object.create(attributes);
                        newAttrs.text = itemFragment;
                        const newBlock = createBlock<StyledListItemProps>(
                            "tableberg/styled-list-item",
                            newAttrs,
                        );
                        return newBlock;
                    }}
                    onMerge={handleItemDeletion}
                    onReplace={(blocks) => {
                        storeActions.replaceBlocks(clientId, blocks);
                    }}
                />
            </li>
            <InspectorControls group="dimensions">
                <SpacingControl
                    label={__("Padding", "tableberg-pro")}
                    value={attributes.padding}
                    onChange={(padding) => setAttributes({padding})}
                    onDeselect={() => setAttributes({padding: undefined})}
                />
                <SpacingControl
                    label={__("Margin", "tableberg-pro")}
                    value={attributes.margin}
                    onChange={(margin) => setAttributes({margin})}
                    onDeselect={() => setAttributes({margin: undefined})}
                />
            </InspectorControls>
        </>
    );
}

registerBlockType(metadata as any, {
    icon: listItemIcon,
    attributes: metadata.attributes as any,
    edit,
});
