import { __ } from "@wordpress/i18n";
import { BlockEditProps, createBlock } from "@wordpress/blocks";
import { useSelect, useDispatch } from "@wordpress/data";
import { getStyles } from "../get-styles";
import {
    RichText,
    InnerBlocks,
    InspectorControls,
    BlockControls,
    useBlockProps,
} from "@wordpress/block-editor";
import { Button, PanelBody } from "@wordpress/components";

import { useState, useEffect, useRef } from "react";
import { SpacingControl } from "../../../components/styling-controls";
import { BlockTypes } from "./types";

function Edit(props: BlockEditProps<BlockTypes>) {
    const { attributes, setAttributes } = props;
    const { blockID, itemText, iconSize, iconColor, fontSize, icon } =
        attributes;
    const {
        insertBlock,
        moveBlocksToPosition,
        removeBlock,
        replaceBlocks,
        updateBlockAttributes,
    } = useDispatch("core/block-editor");
    const {
        block,
        getBlock,
        getBlockIndex,
        currentBlockIndex,
        getBlockParents,
        listRootClientId,
        getBlockParentsByBlockName,
        getClientIdsOfDescendants,
        getClientIdsWithDescendants,
        getNextBlockClientId,
        getPreviousBlockClientId,
    } = useSelect((select) => {
        const {
            getBlock,
            getBlockIndex,
            getBlockParents,
            getBlockParentsByBlockName,
            getClientIdsOfDescendants,
            getClientIdsWithDescendants,
            getNextBlockClientId,
            getPreviousBlockClientId,
        } = select("core/block-editor");

        return {
            block: getBlock(props.clientId),
            getBlock,
            getBlockIndex,
            currentBlockIndex: getBlockIndex(props.clientId),
            getBlockParents,
            listRootClientId: getBlockParents(props.clientId, true)[0],
            getBlockParentsByBlockName,
            getClientIdsOfDescendants,
            getClientIdsWithDescendants,
            getNextBlockClientId,
            getPreviousBlockClientId,
        };
    });
    const [useFontSize, toggleUseFontSize] = useState(false);
    const styles = getStyles(attributes);

    const blockProps = useBlockProps({ style: styles });

    useEffect(() => {
        if (blockID === "") {
            setAttributes({ blockID: block.clientId });
        }
    }, []);

    function outdentItem() {
        //outdents current item by default, but should also allow outdenting other list item blocks

        const ancestorItemsAndLists = getBlockParents(
            listRootClientId,
            true,
        ).filter((b) =>
            ["tableberg/styled-list", "tableberg/styled-list-item"].includes(
                getBlock(b).name,
            ),
        );

        const listRoot = getBlock(listRootClientId);

        if (ancestorItemsAndLists.length > 1) {
            moveBlocksToPosition(
                [block.clientId],

                listRootClientId, //get block id of parent list block

                ancestorItemsAndLists[1], //get block id of parent list of current parent list block

                getBlockIndex(ancestorItemsAndLists[0]) + 1, //ensure indented item moves to just after the parent item of the parent list
            );

            if (currentBlockIndex < listRoot.innerBlocks.length - 1) {
                const itemBlocksToTransfer = listRoot.innerBlocks
                    .slice(currentBlockIndex + 1, listRoot.innerBlocks.length)
                    .map((ib) => ib.clientId);

                if (block.innerBlocks.length > 0) {
                    moveBlocksToPosition(
                        itemBlocksToTransfer,

                        parentListId,

                        blockTarget.innerBlocks[0].clientId,

                        blockTarget.innerBlocks[0].clientId.length,
                    );
                } else {
                    if (
                        itemBlocksToTransfer.length ===
                        listRoot.innerBlocks.length - 1
                    ) {
                        //descendant-less first item of list gets outdented

                        moveBlocksToPosition(
                            [listRootClientId],
                            ancestorItemsAndLists[0],
                            block.clientId,
                            0,
                        );
                    } else {
                        ///middle item of list gets outdented

                        insertBlock(
                            createBlock("tableberg/styled-list", {}, []),
                            0,
                            block.clientId,
                        );

                        setTimeout(() => {
                            moveBlocksToPosition(
                                itemBlocksToTransfer,

                                listRootClientId,

                                getBlock(block.clientId).innerBlocks[0]
                                    .clientId,

                                0,
                            );
                        }, 20);
                    }
                }
            } else {
                console.log("last item. nothing else to do here");
            }

            if (getBlock(listRootClientId).innerBlocks.length === 0) {
                //fresh value needed, do not substitute with listRoot
                removeBlock(listRootClientId);
            }
        } else {
            console.log(
                "first item of outermost list. special handling needed",
            );
        }
    }

    const parents = getBlockParentsByBlockName(block.clientId, [
        "tableberg/styled-list",
    ]);

    const listItemRef = useRef(null); //relocate

    useEffect(() => {
        if (fontSize === -1) {
            const listItemBlocks = getClientIdsOfDescendants([
                parents[0],
            ]).filter(
                (ID) => getBlock(ID).name === "tableberg/styled-list-item",
            );

            updateBlockAttributes([parents[0], ...listItemBlocks], {
                fontSize: parseInt(
                    getComputedStyle(listItemRef.current).fontSize.slice(0, -2),
                ),
            });
        } else {
            toggleUseFontSize(fontSize > 0);
        }
    }, [fontSize]);

    return (
        <div {...blockProps}>
            <InspectorControls group="styles">
                <PanelBody
                    title={__("Dimension Settings", "tableberg-pro")}
                    initialOpen={false}
                >
                    <SpacingControl
                        showByDefault
                        attrKey="padding"
                        label={__("Padding", "tableberg-pro")}
                    />
                    <SpacingControl
                        minimumCustomValue={-Infinity}
                        showByDefault
                        attrKey="margin"
                        label={__("Margin", "tableberg-pro")}
                    />
                </PanelBody>
            </InspectorControls>
            <BlockControls>
                <Button
                    icon="editor-outdent"
                    disabled={
                        getBlockParentsByBlockName(block.clientId, [
                            "tableberg/styled-list-item",
                        ]).length === 0
                    }
                    onClick={outdentItem}
                />
                <Button
                    icon="editor-indent"
                    disabled={currentBlockIndex === 0}
                    onClick={() => {
                        if (
                            getBlock(getPreviousBlockClientId(block.clientId))
                                .innerBlocks.length === 0
                        ) {
                            insertBlock(
                                createBlock("tableberg/styled-list", {}, []),
                                0,
                                getPreviousBlockClientId(block.clientId),
                            );
                        }

                        setTimeout(() => {
                            moveBlocksToPosition(
                                [block.clientId],

                                listRootClientId, //get block id of parent list block

                                getBlock(
                                    getPreviousBlockClientId(block.clientId),
                                ).innerBlocks[0].clientId, //get block id of newly-created list subblock

                                getBlock(
                                    getPreviousBlockClientId(block.clientId),
                                ).innerBlocks[0].innerBlocks.length, //ensure indented item moves to bottom of destination list
                            );
                        }, 20);
                    }}
                />
            </BlockControls>

            <RichText
                tagName="li"
                id={`tableberg-styled-list-item-${blockID}`}
                value={itemText}
                placeholder={"List item"}
                keepPlaceholderOnFocus={true}
                onChange={(itemText) => setAttributes({ itemText })}
                onSplit={(itemFragment) => {
                    const { blockID, itemText, ...filteredAttributes } =
                        attributes;

                    return createBlock("tableberg/styled-list-item", {
                        filteredAttributes,
                        blockID: "",
                        itemText: itemFragment,
                    });
                }}
                onReplace={(replacements) => {
                    let replacementBlocks = [...replacements];
                    replacementBlocks[
                        replacementBlocks.length - 1
                    ].innerBlocks = block.innerBlocks;

                    replaceBlocks(block.clientId, replacementBlocks);
                }}
                onMerge={(mergeWithNext) => {
                    if (mergeWithNext) {
                        let targetBlock = "";

                        if (block.innerBlocks.length > 0) {
                            targetBlock =
                                block.innerBlocks[0].innerBlocks[0].clientId;

                            //move is being performed correctly, but a clone of moved block remains for some reasons
                            moveBlocksToPosition(
                                [targetBlock], //present
                                block.innerBlocks[0].clientId, //present
                                listRootClientId, //
                                currentBlockIndex + 1, //get target position
                            );

                            if (
                                getBlock(block.clientId).innerBlocks[0]
                                    .innerBlocks.length > 0
                            ) {
                                moveBlocksToPosition(
                                    [block.innerBlocks[0].clientId], //present
                                    block.clientId, //present
                                    targetBlock, //
                                    0, //get target position
                                );
                            } else {
                                removeBlock(
                                    getBlock(block.clientId).innerBlocks[0]
                                        .clientId,
                                );
                            }
                        } else {
                            const findNextItem = (id, ancestors) => {
                                if (
                                    getBlockIndex(id) + 1 <
                                    getBlock(ancestors[0]).innerBlocks.length
                                ) {
                                    return getBlock(ancestors[0]).innerBlocks[
                                        getBlockIndex(id) + 1
                                    ].clientId;
                                } else {
                                    if (ancestors.length === 1) {
                                        return "";
                                    } else {
                                        return findNextItem(
                                            ancestors[1],
                                            ancestors.slice(2),
                                        );
                                    }
                                }
                            };

                            targetBlock = findNextItem(
                                block.clientId,
                                getBlockParents(block.clientId, true).filter(
                                    (b) =>
                                        [
                                            "tableberg/styled-list",
                                            "tableberg/styled-list-item",
                                        ].includes(getBlock(b).name),
                                ),
                            );

                            if (![null, ""].includes(targetBlock)) {
                                const parentLists = getBlockParents(
                                    block.clientId,
                                    true,
                                ).filter(
                                    (b) =>
                                        getBlock(b).name ===
                                        "tableberg/styled-list",
                                );

                                if (
                                    getBlock(parentLists[0]).innerBlocks.filter(
                                        (i) => i.clientId === targetBlock,
                                    ).length > 0 ||
                                    getBlock(
                                        parentLists[parentLists.length - 1],
                                    ).innerBlocks.filter(
                                        (i) => i.clientId === targetBlock,
                                    ).length > 0
                                ) {
                                    updateBlockAttributes(block.clientId, {
                                        itemText:
                                            itemText +
                                            getBlock(targetBlock).attributes
                                                .itemText,
                                    });

                                    //outdent child blocks, merge only with blocks on the same level

                                    if (
                                        getBlock(targetBlock).innerBlocks
                                            .length > 0
                                    ) {
                                        if (
                                            targetBlock ===
                                            getNextBlockClientId()
                                        ) {
                                            moveBlocksToPosition(
                                                [
                                                    getBlock(targetBlock)
                                                        .innerBlocks[0]
                                                        .clientId,
                                                ], //present
                                                targetBlock, //source
                                                block.clientId, //destination
                                                0, //get target position
                                            );
                                        } else {
                                            const targetListItem = getBlock(
                                                getPreviousBlockClientId(
                                                    targetBlock,
                                                ),
                                            );

                                            moveBlocksToPosition(
                                                getBlock(
                                                    targetBlock,
                                                ).innerBlocks[0].innerBlocks.map(
                                                    (ib) => ib.clientId,
                                                ),
                                                getBlock(targetBlock)
                                                    .innerBlocks[0].clientId,
                                                targetListItem.innerBlocks[0]
                                                    .clientId,
                                                targetListItem.innerBlocks[0]
                                                    .innerBlocks.length,
                                            );
                                        }
                                    }

                                    removeBlock(targetBlock);
                                }
                            }
                        }
                    } else {
                        if (currentBlockIndex > 0) {
                            const findLastDescendant = (id) => {
                                const ib = getBlock(id).innerBlocks;

                                if (getBlock(id).innerBlocks.length === 0) {
                                    return id;
                                } else {
                                    return findLastDescendant(
                                        ib[ib.length - 1].clientId,
                                    );
                                }
                            };

                            const targetBlock = findLastDescendant(
                                getPreviousBlockClientId(),
                            );

                            updateBlockAttributes(targetBlock, {
                                itemText:
                                    getBlock(targetBlock).attributes.itemText +
                                    itemText,
                            });

                            //also move subitems of soon-to-be-deleted block

                            if (block.innerBlocks.length > 0) {
                                moveBlocksToPosition(
                                    block.innerBlocks.map((ib) => ib.clientId),
                                    block.clientId,
                                    targetBlock,
                                    getBlock(targetBlock).innerBlocks.length,
                                );
                            }

                            removeBlock(block.clientId);
                        } else {
                            outdentItem();
                        }
                    }

                    return mergeWithNext;
                }}
                ref={
                    currentBlockIndex === 0 && parents.length === 1
                        ? listItemRef
                        : null
                }
                style={useFontSize ? { fontSize: `${fontSize}px` } : null}
            />
            {/* INSERT INNERBLOCKS HERE* */}
            <InnerBlocks
                template={[]} //initial content
                templateLock={false}
                allowedBlocks={["tableberg/styled-list"]}
                renderAppender={undefined}
            />
        </div>
    );
}
export default Edit;
