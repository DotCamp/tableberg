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
import { useCallback, useState } from "react";
import {
    Button,
    Modal,
    PanelBody,
    PanelRow,
    RangeControl,
} from "@wordpress/components";
import { ColorControl, SpacingControl } from "@tableberg/components";
import { StyledListProps } from "..";
import SVGComponent from "../get-icon";
import IconsLibrary from "@tableberg/components/icon-library";

export interface StyledListItemProps {
    icon?: any;
    text: string;
    padding: object;
    margin: object;
    iconColor?: string;
    iconSize?: number;
    iconSpacing?: number;
    fontSize?: string;
    textColor?: string;
}

function edit(props: BlockEditProps<StyledListItemProps>) {
    const { attributes, setAttributes, clientId } = props;
    const { text } = attributes;

    const storeActions: BlockEditorStoreActions = useDispatch(
        blockEditorStore,
    ) as any;

    const { listItemBlock, listBlock, listAttrs, getBlockIndex, hasIcon } =
        useSelect(
            (select) => {
                const storeSelect = select(
                    blockEditorStore,
                ) as BlockEditorStoreSelectors;
                const listItemBlock = storeSelect.getBlock(clientId)!;
                const parentIds = storeSelect.getBlockParents(clientId)!;
                const listBlockId = parentIds[parentIds.length - 1];
                const listBlock: BlockInstance<StyledListProps> =
                    storeSelect.getBlock(listBlockId)! as any;
                return {
                    listItemBlock,
                    listBlock,
                    listAttrs: listBlock.attributes,
                    getBlockIndex: storeSelect.getBlockIndex,
                    hasIcon: !listBlock.attributes.isOrdered,
                };
            },
            [clientId],
        );

    const blockProps = useBlockProps({
        style: getItemStyles(attributes),
    });

    const [isLibraryOpen, setLibraryOpen] = useState(false);

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

    const itemIcon = attributes.icon || listAttrs.icon;

    return (
        <>
            <li {...blockProps}>
                {hasIcon && <SVGComponent icon={itemIcon} />}
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
            <InspectorControls group="color">
                <ColorControl
                    label={__("Item Icon Color", "tableberg-pro")}
                    colorValue={attributes.iconColor}
                    onColorChange={(iconColor: any) =>
                        setAttributes({ iconColor })
                    }
                    onDeselect={() => setAttributes({ iconColor: undefined })}
                />
                <ColorControl
                    label={__("Item Text Color", "tableberg-pro")}
                    colorValue={attributes.textColor}
                    onColorChange={(textColor: any) =>
                        setAttributes({ textColor })
                    }
                    onDeselect={() => setAttributes({ textColor: undefined })}
                />
            </InspectorControls>
            <InspectorControls group="dimensions">
                <SpacingControl
                    label={__("Item Padding", "tableberg-pro")}
                    value={attributes.padding}
                    onChange={(padding) => setAttributes({ padding })}
                    onDeselect={() => setAttributes({ padding: undefined })}
                />
                <SpacingControl
                    label={__("Item Margin", "tableberg-pro")}
                    value={attributes.margin}
                    onChange={(margin) => setAttributes({ margin })}
                    onDeselect={() => setAttributes({ margin: undefined })}
                />
            </InspectorControls>
            {hasIcon && (
                <InspectorControls group="settings">
                    <PanelBody title="Icon Settings" initialOpen={true}>
                        <PanelRow className="tableberg-styled-list-icon-selector">
                            <label>Select Icon</label>
                            <Button
                                style={{ border: "1px solid #eeeeee" }}
                                icon={
                                    <SVGComponent
                                        icon={itemIcon}
                                        iconName="wordpress"
                                        type="wordpress"
                                    />
                                }
                                onClick={() => setLibraryOpen(true)}
                            />
                        </PanelRow>
                        <RangeControl
                            label={__("Item Icon size", "tableberg-pro")}
                            value={attributes.iconSize}
                            onChange={(iconSize) => {
                                setAttributes({ iconSize });
                            }}
                            min={10}
                            max={100}
                        />
                        <RangeControl
                            label={__("Item Icon Spacing", "tableberg-pro")}
                            value={attributes.iconSpacing}
                            onChange={(iconSpacing) => {
                                setAttributes({ iconSpacing });
                            }}
                            min={0}
                            max={20}
                        />
                    </PanelBody>
                    {isLibraryOpen && (
                        <Modal
                            isFullScreen
                            className="tableberg_icons_library_modal"
                            title={__("Icons", "tableberg-pro")}
                            onRequestClose={() => setLibraryOpen(false)}
                        >
                            <IconsLibrary
                                value={itemIcon.iconName as any}
                                onSelect={(newIcon) => {
                                    setAttributes({
                                        icon: newIcon,
                                    });
                                    setLibraryOpen(false);
                                    return null;
                                }}
                            />
                        </Modal>
                    )}
                </InspectorControls>
            )}
        </>
    );
}

registerBlockType(metadata as any, {
    icon: listItemIcon,
    attributes: metadata.attributes as any,
    edit,
});
