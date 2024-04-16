import { __ } from "@wordpress/i18n";

import {
    BlockEditProps,
    BlockInstance,
    cloneBlock,
    createBlock,
    registerBlockType,
} from "@wordpress/blocks";
import {
    RichText,
    useBlockProps,
    store as blockEditorStore,
    InspectorControls,
    useInnerBlocksProps,
    BlockControls,
} from "@wordpress/block-editor";
import { useDispatch, useSelect } from "@wordpress/data";
import { useState } from "react";
import {
    Button,
    Modal,
    PanelBody,
    PanelRow,
    RangeControl,
    ToolbarButton,
} from "@wordpress/components";

import { formatIndent, formatOutdent, trash } from "@wordpress/icons";
import { ColorControl, SpacingControl } from "@tableberg/components";
import IconsLibrary from "@tableberg/components/icon-library";

import { listItemIcon } from "../icon";
import metadata from "./block.json";
import { getItemStyles } from "../get-styles";
import { StyledListProps } from "..";
import SVGComponent from "../get-icon";

export interface StyledListItemProps {
    icon?: any;
    text: string;
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

    const {
        listItemBlock,
        listBlock,
        listAttrs,
        hasIcon,
        currentIndex,
        storeSelect,
        parentIds,
    } = useSelect((select) => {
        const storeSelect = select(
            blockEditorStore,
        ) as BlockEditorStoreSelectors;
        const listItemBlock = storeSelect.getBlock(clientId)!;
        const parentIds = storeSelect.getBlockParents(clientId)!;
        const listBlockId = parentIds[parentIds.length - 1];
        const listBlock: BlockInstance<StyledListProps> = storeSelect.getBlock(
            listBlockId,
        )! as any;
        const listAttrs = listBlock.attributes;
        const currentIndex = storeSelect.getBlockIndex(clientId);
        return {
            listItemBlock,
            listBlock,
            listAttrs,
            currentIndex,
            hasIcon: !listAttrs.isOrdered && !!listAttrs.icon,
            parentIds,
            storeSelect,
        };
    }, []);

    const blockProps = useBlockProps({
        style: getItemStyles(attributes, listAttrs),
    });
    const innerBlocksProps = useInnerBlocksProps({
        allowedBlocks: ["tableberg/styled-list"],
        className: "tableberg-inner-list-holder",
    });

    const [isLibraryOpen, setLibraryOpen] = useState(false);

    const indentItem = () => {
        const targetItemId = storeSelect.getPreviousBlockClientId(clientId);
        if (!targetItemId) {
            return;
        }
        const targetBlock = storeSelect.getBlock(targetItemId)!;
        const thisClone = cloneBlock(listItemBlock);

        if (targetBlock.innerBlocks.length) {
            const targetList = targetBlock.innerBlocks[0];
            storeActions.insertBlock(thisClone, undefined, targetList.clientId);
        } else {
            let listStyle: string;
            if (listAttrs.listStyle === "disc") {
                listStyle = "circle";
            } else {
                listStyle = "disc";
            }
            let newList = createBlock(
                "tableberg/styled-list",
                {
                    parentCount: listAttrs.parentCount + 1,
                    listStyle,
                },
                [thisClone],
            );
            storeActions.replaceInnerBlocks(targetItemId, [newList]);
        }
        storeActions.selectBlock(thisClone.clientId);
        storeActions.removeBlock(clientId);
    };

    const outdentItem = () => {
        const grandParentListId = parentIds[parentIds.length - 3];
        const grandParentList = storeSelect.getBlock(grandParentListId)!;
        if (grandParentList.name !== "tableberg/styled-list") {
            return;
        }
        const parentItemId = parentIds[parentIds.length - 2];
        const parentItemIndex = storeSelect.getBlockIndex(parentItemId);

        const toRemove: string[] = [];
        const toInsert: BlockInstance[] = [];

        for (let i = currentIndex + 1; i < listBlock.innerBlocks.length; i++) {
            const block = listBlock.innerBlocks[i];
            toRemove.push(block.clientId);
            toInsert.push(cloneBlock(block));
        }

        storeActions.moveBlockToPosition(
            clientId,
            listBlock.clientId,
            grandParentListId,
            parentItemIndex + 1,
        );

        if (toRemove.length) {
            if (listItemBlock.innerBlocks.length) {
                const targetList = listItemBlock.innerBlocks[0];
                storeActions.insertBlocks(
                    toInsert,
                    targetList.innerBlocks.length,
                    targetList.clientId,
                    false,
                );
            } else {
                const listAttrs = grandParentList.attributes;
                let listStyle: string;
                if (listAttrs.listStyle === "disc") {
                    listStyle = "circle";
                } else {
                    listStyle = "disc";
                }
                let newList = createBlock(
                    "tableberg/styled-list",
                    {
                        parentCount: listAttrs.parentCount + 1,
                        listStyle,
                    },
                    toInsert,
                );
                storeActions.replaceInnerBlocks(clientId, [newList]);
            }
            storeActions.removeBlocks(toRemove);
            storeActions.selectBlock(clientId);
        }

        if (currentIndex === 0) {
            storeActions.removeBlock(listBlock.clientId, true);
        }
    };

    const handleItemDeletion = (forward: boolean) => {
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

        if (listAttrs.parentCount > 0) {
            outdentItem();
            return;
        }

        // Backspace
        if (listBlock.innerBlocks.length > 1 && currentIndex > 0) {
            const prevItem = listBlock.innerBlocks[currentIndex - 1];
            // const cursorPos = prevItem.attributes.text.length;
            storeActions.updateBlockAttributes(prevItem.clientId, {
                text: prevItem.attributes.text + text,
            });
            if (hasInnerList) {
                if (prevItem.innerBlocks.length > 0) {
                    const prevItemListId = prevItem.innerBlocks[0].clientId;
                    listItemBlock.innerBlocks[0].innerBlocks.forEach((item) => {
                        const cloned = cloneBlock(item);
                        storeActions.insertBlock(
                            cloned,
                            undefined,
                            prevItemListId,
                        );
                    });
                } else {
                    storeActions.replaceInnerBlocks(prevItem.clientId, [
                        cloneBlock(listItemBlock.innerBlocks[0]),
                    ]);
                }
            }
            // storeActions.selectBlock(prevItem.clientId, cursorPos - 1);
            storeActions.removeBlock(clientId, false);
            return;
        }
    };

    const hasInnerList = listItemBlock.innerBlocks.length > 0;
    const itemIcon = attributes.icon || listAttrs.icon;

    return (
        <>
            <li {...blockProps}>
                <div className="tableberg-list-item-inner">
                    {hasIcon && itemIcon.type !== "native" && (
                        <SVGComponent icon={itemIcon} />
                    )}
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
                            if (hasInnerList) {
                                // TODO: Replace the following line with `storeActions.replaceInnerBlocks` call
                                // I have no idea why assigning works but not replaceInnerBlocks
                                // @ts-ignore
                                blocks[blocks.length > 1 ? 1 : 0].innerBlocks =
                                    listItemBlock.innerBlocks;
                            }
                            storeActions.replaceBlocks(clientId, blocks);
                        }}
                    />
                </div>
                {hasInnerList && <div {...innerBlocksProps}></div>}
            </li>
            <BlockControls group="block">
                <ToolbarButton
                    icon={formatOutdent}
                    onClick={outdentItem}
                    label="Outdent"
                    placeholder={undefined}
                    onPointerEnterCapture={undefined}
                    onPointerLeaveCapture={undefined}
                    disabled={listAttrs.parentCount === 0}
                />
                <ToolbarButton
                    icon={formatIndent}
                    onClick={indentItem}
                    label="Indent"
                    placeholder={undefined}
                    onPointerEnterCapture={undefined}
                    onPointerLeaveCapture={undefined}
                    disabled={currentIndex === 0}
                />
            </BlockControls>
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
            {hasIcon && (
                <InspectorControls group="settings">
                    <PanelBody title="Icon Settings" initialOpen={true}>
                        <PanelRow className="tableberg-styled-list-icon-selector">
                            <label>Select Icon</label>
                            <div>
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
                                {attributes.icon && (
                                    <Button
                                        style={{
                                            border: "1px solid red",
                                            marginLeft: "5px",
                                            color: "red",
                                        }}
                                        icon={trash}
                                        onClick={() =>
                                            setAttributes({
                                                icon: undefined,
                                            })
                                        }
                                    />
                                )}
                            </div>
                        </PanelRow>
                        <RangeControl
                            label={__("Item Icon size", "tableberg-pro")}
                            value={attributes.iconSize}
                            onChange={(iconSize) => {
                                setAttributes({ iconSize });
                            }}
                            min={0}
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
                                value={itemIcon?.iconName as any}
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

function save() {
    useBlockProps.save();
    const innerBlocksProps = useInnerBlocksProps.save();
    return <div {...innerBlocksProps} />;
}

registerBlockType(metadata as any, {
    icon: listItemIcon,
    attributes: metadata.attributes as any,
    edit,
    save,
});
