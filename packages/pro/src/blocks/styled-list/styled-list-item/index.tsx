import { __ } from "@wordpress/i18n";

import {
    BlockEditProps,
    BlockInstance,
    cloneBlock,
    createBlock,
    getDefaultBlockName,
    registerBlockType,
} from "@wordpress/blocks";
import {
    RichText,
    useBlockProps,
    store as blockEditorStore,
    InspectorControls,
    useInnerBlocksProps,
    BlockControls,
    FontSizePicker,
} from "@wordpress/block-editor";
import { useDispatch, useSelect } from "@wordpress/data";
import { useCallback, useState } from "react";
import {
    BaseControl,
    Button,
    Modal,
    PanelBody,
    PanelRow,
    ToolbarButton,
} from "@wordpress/components";

import { formatIndent, formatOutdent, trash } from "@wordpress/icons";
import {
    ColorControl,
    SizeControl,
    SpacingControlSingle,
} from "@tableberg/components";
import { useRefEffect } from "@wordpress/compose";

import IconsLibrary from "@tableberg/components/icon-library";

import { listItemIcon } from "@tableberg/shared/icons/styled-list";
import metadata from "./block.json";
import { getItemStyles } from "../get-styles";
import { StyledListProps } from "..";
import SVGComponent from "../get-icon";

export interface StyledListItemProps {
    icon?: any;
    text: string;
    iconColor?: string;
    iconSize?: string;
    iconSpacing?: string;
    fontSize?: string;
    textColor?: string;
}

function useIndentOutdent(clientId: string) {
    const storeActions: BlockEditorStoreActions = useDispatch(
        blockEditorStore,
    ) as any;
    const storeSelect = useSelect(blockEditorStore, [
        clientId,
    ]) as BlockEditorStoreSelectors;

    const indentItem = useCallback(() => {
        const isMultiple = storeSelect.hasMultiSelection();
        const listItemBlock = storeSelect.getBlock(clientId)!;
        const toClone = isMultiple
            ? storeSelect.getMultiSelectedBlocks()
            : [listItemBlock];

        const previousSiblingId = storeSelect.getPreviousBlockClientId(
            toClone[0].clientId,
        );
        if (!previousSiblingId) {
            return;
        }
        const listBlock = storeSelect.getBlock(
            storeSelect.getBlockRootClientId(clientId)!,
        )!;

        const replaceTargets: string[] = [previousSiblingId];
        const clonedBlocks: BlockInstance[] = [];
        toClone.forEach((b) => {
            replaceTargets.push(b.clientId);
            clonedBlocks.push(cloneBlock(b));
        });

        const targetItemBlock = cloneBlock(
            storeSelect.getBlock(previousSiblingId)!,
        );
        if (!targetItemBlock.innerBlocks?.length) {
            // @ts-ignore
            targetItemBlock.innerBlocks = [
                createBlock(
                    "tableberg/styled-list",
                    {
                        listStyle:
                            listBlock.attributes.listStyle === "disc"
                                ? "circle"
                                : "disc",
                        parentCount: listBlock.attributes.parentCount + 1,
                    },
                    clonedBlocks,
                ),
            ];
        } else {
            targetItemBlock.innerBlocks[
                targetItemBlock.innerBlocks.length - 1
            ].innerBlocks.push(...clonedBlocks);
        }

        const selectionStart = storeSelect.getSelectionStart();
        const selectionEnd = storeSelect.getSelectionEnd();

        storeActions.replaceBlocks(replaceTargets, [targetItemBlock]);
        if (!isMultiple) {
            storeActions.selectionChange(
                clonedBlocks[0].clientId,
                selectionEnd.attributeKey!,
                selectionEnd.clientId === selectionStart.clientId
                    ? selectionStart.offset!
                    : selectionEnd.offset!,
                selectionEnd.offset!,
            );
        } else {
            storeActions.multiSelect(
                clonedBlocks[0].clientId,
                clonedBlocks[clonedBlocks.length - 1].clientId,
            );
        }
    }, [clientId]);

    const outdentItem = useCallback(() => {
        const isMultiple = storeSelect.hasMultiSelection();
        const listItemBlock = storeSelect.getBlock(clientId)!;
        const toOutdents = isMultiple
            ? storeSelect.getMultiSelectedBlocks()
            : [listItemBlock];

        let lastItem = toOutdents[toOutdents.length - 1];
        const firstIndex = storeSelect.getBlockIndex(toOutdents[0].clientId);
        const lastIndex = storeSelect.getBlockIndex(lastItem.clientId);

        const parentListId = storeSelect.getBlockRootClientId(
            toOutdents[0].clientId,
        )!;
        const parentItemId = storeSelect.getBlockRootClientId(parentListId)!;

        const targetListId = storeSelect.getBlockRootClientId(parentItemId)!;
        const targetList = storeSelect.getBlock(targetListId)!;

        const insertIndex = storeSelect.getBlockIndex(parentItemId)! + 1;
        const selectionStart = storeSelect.getSelectionStart();
        const selectionEnd = storeSelect.getSelectionEnd();

        const listBlock = storeSelect.getBlock(
            storeSelect.getBlockRootClientId(clientId)!,
        )!;

        const outdents: BlockInstance[] = [];
        const remainings: BlockInstance[] = [];
        const toRemoves: string[] = [];
        const totalItems = listBlock.innerBlocks.length;

        for (let i = firstIndex; i < totalItems; i++) {
            const b = listBlock.innerBlocks[i];
            const cloned = cloneBlock(b);
            toRemoves.push(b.clientId);
            if (i > lastIndex) {
                remainings.push(cloned);
            } else {
                outdents.push(cloned);
            }
        }
        if (firstIndex === 0) {
            toRemoves.push(listBlock.clientId);
        }

        lastItem = outdents[outdents.length - 1];

        storeActions.insertBlocks(outdents, insertIndex, targetListId);

        if (remainings.length) {
            if (lastItem.innerBlocks?.length) {
                const remTarget = lastItem.innerBlocks[0];
                storeActions.replaceInnerBlocks(remTarget.clientId, [
                    ...remTarget.innerBlocks,
                    ...remainings,
                ]);
            } else {
                const remTarget = createBlock(
                    "tableberg/styled-list",
                    {
                        listStyle:
                            targetList.attributes.listStyle === "disc"
                                ? "circle"
                                : "disc",
                        parentCount: targetList.attributes.parentCount + 1,
                    },
                    remainings,
                );
                storeActions.replaceInnerBlocks(lastItem.clientId, [remTarget]);
            }
        }
        storeActions.removeBlocks(toRemoves);
        if (!isMultiple) {
            storeActions.selectionChange(
                outdents[0].clientId,
                selectionEnd.attributeKey!,
                selectionEnd.clientId === selectionStart.clientId
                    ? selectionStart.offset!
                    : selectionEnd.offset!,
                selectionEnd.offset!,
            );
        } else {
            storeActions.multiSelect(
                outdents[0].clientId,
                outdents[outdents.length - 1].clientId,
            );
        }
    }, [clientId]);

    return { indentItem, outdentItem };
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
        currentIndex,
        getBlock,
        getBlockRootClientId,
        getBlockIndex,
    } = useSelect(
        (select) => {
            const {
                getBlock,
                getBlockRootClientId,
                getBlockIndex,
                getBlockName,
                getSelectionStart,
                getSelectionEnd,
            } = select(blockEditorStore) as BlockEditorStoreSelectors;
            const listItemBlock = getBlock(clientId)!;
            const listBlock: BlockInstance<StyledListProps> = getBlock(
                getBlockRootClientId(clientId)!,
            )! as any;
            const listAttrs = listBlock.attributes;
            const currentIndex = getBlockIndex(clientId);
            return {
                listItemBlock,
                listBlock,
                listAttrs,
                currentIndex,
                getBlock,
                getBlockRootClientId,
                getBlockIndex,
                getBlockName,
                getSelectionStart,
                getSelectionEnd,
            };
        },
        [clientId],
    );

    const blockProps = useBlockProps({
        style: getItemStyles(attributes, listAttrs),
    });
    const innerBlocksProps = useInnerBlocksProps({
        allowedBlocks: ["tableberg/styled-list"],
        className: "tableberg-inner-list-holder",
    });

    const [isLibraryOpen, setLibraryOpen] = useState(false);

    const { indentItem, outdentItem } = useIndentOutdent(clientId);

    const elRef = useRefEffect((el) => {
        if (!el) {
            return;
        }
        function onKeyDown(this: HTMLDivElement, event: any) {
            if (
                event.defaultPrevented ||
                event.shiftKey ||
                event.keyCode !== 13
            ) {
                return;
            }

            event.preventDefault();

            const selection = (el.ownerDocument || window).getSelection();
            if (!selection?.rangeCount) return;

            const range = selection.getRangeAt(0);

            const newRange = document.createRange();
            newRange.setStart(range.endContainer, range.endOffset);
            newRange.setEndAfter(this.lastChild!);
            const secondPart = newRange.extractContents();

            const div = document.createElement("div");
            div.appendChild(secondPart);

            const topParentListBlock = getBlock(
                getBlockRootClientId(clientId)!,
            )!;
            const blockIndex = getBlockIndex(clientId)!;

            const newBlock = createBlock("tableberg/styled-list-item", {
                ...attributes,
                text: div.innerHTML,
            });
            div.remove();

            storeActions.insertBlock(
                newBlock,
                blockIndex + 1,
                topParentListBlock.clientId,
            );
            // @ts-ignore
            storeActions.selectionChange(newBlock.clientId);
            setAttributes({ text: this.innerHTML });
        }

        el.addEventListener("keydown", onKeyDown);
        return () => {
            el.removeEventListener("keydown", onKeyDown);
        };
    }, []);

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
            const cursorPos = prevItem.attributes.text.length;
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
            storeActions.selectionChange(
                prevItem.clientId,
                "character",
                cursorPos,
                cursorPos,
            );
            storeActions.removeBlock(clientId, false);
            return;
        }
    };

    const hasInnerList = listItemBlock.innerBlocks.length > 0;
    const itemIcon = attributes.icon || listAttrs.icon;

    return (
        <>
            <li {...blockProps}>
                <div
                    className="tableberg-list-item-inner"
                    style={{
                        alignItems: listAttrs.alignItems,
                        fontSize: attributes.fontSize,
                    }}
                >
                    <div className="tableberg-list-icon">
                        <SVGComponent icon={itemIcon} />
                    </div>
                    <RichText
                        ref={elRef as any}
                        tagName="div"
                        className="tableberg-list-text"
                        value={text}
                        placeholder="List item"
                        keepPlaceholderOnFocus={true}
                        onChange={(text) => setAttributes({ text })}
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
                    <SizeControl
                        label={__("Item Icon size", "tableberg-pro")}
                        value={attributes.iconSize as any}
                        onChange={(iconSize) => {
                            setAttributes({ iconSize });
                        }}
                        rangeConfig={{
                            px: {
                                max: 200,
                            },
                        }}
                        initialPosition={listAttrs.iconSize}
                    />
                    <SpacingControlSingle
                        label={__("Item Icon Spacing", "tableberg-pro")}
                        // @ts-ignore
                        value={attributes.iconSpacing}
                        onChange={(iconSpacing) => {
                            setAttributes({ iconSpacing });
                        }}
                    />
                </PanelBody>
                <PanelBody title="Font Size" initialOpen={true}>
                    <BaseControl __nextHasNoMarginBottom>
                        <FontSizePicker
                            value={attributes.fontSize as any}
                            onChange={(val: any) =>
                                setAttributes({ fontSize: val })
                            }
                        />
                    </BaseControl>
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
