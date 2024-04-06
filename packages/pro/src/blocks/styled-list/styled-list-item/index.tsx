import { __ } from "@wordpress/i18n";

import {
    BlockEditProps,
    createBlock,
    registerBlockType,
} from "@wordpress/blocks";
import {
    RichText,
    useBlockProps,
    store as blockEditorStore,
} from "@wordpress/block-editor";
import { listItemIcon } from "../icon";
import metadata from "./block.json";
import { getStyles } from "../get-styles";
import { useDispatch, useSelect } from "@wordpress/data";
import { useCallback } from "react";

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
    const blockProps = useBlockProps({
        style: getStyles(attributes),
    });

    const storeActions: BlockEditorStoreActions = useDispatch(
        blockEditorStore,
    ) as any;

    const { listItemBlock, listBlock, currentIndex } = useSelect(
        (select) => {
            const storeSelect = select(
                blockEditorStore,
            ) as BlockEditorStoreSelectors;
            const listItemBlock = storeSelect.getBlock(clientId)!;
            const parentIds = storeSelect.getBlockParents(clientId)!;
            const listBlockId = parentIds[parentIds.length - 1];
            const listBlock = storeSelect.getBlock(listBlockId)!;
            return {
                listItemBlock,
                listBlock,
                currentIndex: storeSelect.getBlockIndex(clientId),
            };
        },
        [clientId],
    );

    const handleItemDeletion = useCallback(
        (forward: boolean) => {
            if (forward) {
                // Delete is press
                if (listBlock.innerBlocks.length <= 1) {
                    setAttributes({
                        text: ""
                    });
                } else {
                    storeActions.removeBlock(clientId, true);
                }
                return;
            }
            // Backspace
            if (listBlock.innerBlocks.length <= 1 || currentIndex == 0) {
                return;
            }
            const prevItem = listBlock.innerBlocks[currentIndex - 1];
            storeActions.updateBlockAttributes(prevItem.clientId, {
                text: prevItem.attributes.text + ' ' + text,
            });
            storeActions.removeBlock(clientId, true);
        },
        [listItemBlock],
    );

    return (
        <div {...blockProps}>
            <RichText
                tagName="li"
                value={text}
                placeholder="List item"
                keepPlaceholderOnFocus={true}
                onChange={(text) => setAttributes({ text })}
                onSplit={(itemFragment) => {
                    const newBlock = createBlock<StyledListItemProps>(
                        "tableberg/styled-list-item",
                    );
                    newBlock.attributes.text = itemFragment;
                    return newBlock;
                }}
                onMerge={handleItemDeletion}
                onReplace={(blocks) => {
                    storeActions.replaceBlocks(clientId, blocks);
                }}
            />
        </div>
    );
}

registerBlockType(metadata as any, {
    icon: listItemIcon,
    edit,
});
