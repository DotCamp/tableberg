import { BlockEditProps, registerBlockType } from "@wordpress/blocks";

import metadata from "./block.json";
import blockIcon from "./icon";
import {
    AlignmentToolbar,
    BlockControls,
    FontSizePicker,
    InspectorControls,
    useBlockProps,
    useInnerBlocksProps,
    store as blockEditorStore,
} from "@wordpress/block-editor";
import { getStyles } from "./get-styles";
import {
    ColorControl,
    SpacingControl,
    SpacingControlSingle,
} from "@tableberg/components";
import IconsLibrary from "@tableberg/components/icon-library";
import { __ } from "@wordpress/i18n";
import {
    BaseControl,
    Button,
    Modal,
    PanelBody,
    PanelRow,
    RangeControl,
    SelectControl,
    ToolbarButton,
} from "@wordpress/components";
import { useState } from "react";
import { formatOutdent, trash } from "@wordpress/icons";
import SVGComponent from "./get-icon";
import classNames from "classnames";
import { useSelect } from "@wordpress/data";
import { BlockInstance } from "@wordpress/blocks";
import { useDispatch } from "@wordpress/data";

export interface StyledListProps {
    icon: any;
    alignment: string;
    alignItems: "center" | "baseline" | "flex-start" | "flex-end";
    iconColor: string;
    iconSize: number;
    iconSpacing: string;
    fontSize: string;
    itemSpacing: string;
    textColor: string;
    backgroundColor: string;
    listSpacing: object;
    listIndent: string;
    parentCount: number;
}

const ALLOWED_BLOCKS = ["tableberg/styled-list-item"];

function edit(props: BlockEditProps<StyledListProps>) {
    const { attributes, setAttributes, clientId } = props;

    const blockProps = useBlockProps({
        style: getStyles(attributes),
        className: classNames({
            "tableberg-styled-list": true,
            "tableberg-list-has-icon": attributes.icon,
        }),
    });

    const innerBlocksProps = useInnerBlocksProps(blockProps as any, {
        allowedBlocks: ALLOWED_BLOCKS,
        template: [["tableberg/styled-list-item"]],
    });

    const [isLibraryOpen, setLibraryOpen] = useState(false);

    const storeActions: BlockEditorStoreActions = useDispatch(
        blockEditorStore,
    ) as any;

    const { listBlock, storeSelect, parentIds } = useSelect((select) => {
        const storeSelect = select(
            blockEditorStore,
        ) as BlockEditorStoreSelectors;
        const parentIds = storeSelect.getBlockParents(clientId)!;
        const listBlock: BlockInstance<StyledListProps> = storeSelect.getBlock(
            clientId,
        )! as any;
        return {
            listBlock,
            parentIds,
            storeSelect,
        };
    }, []);

    const outdentList = () => {
        const grandParentListId = parentIds[parentIds.length - 2];
        const grandParentList = storeSelect.getBlock(grandParentListId)!;
        if (grandParentList.name !== "tableberg/styled-list") {
            return;
        }
        const parentItemId = parentIds[parentIds.length - 1];
        const parentItemIndex = storeSelect.getBlockIndex(parentItemId);

        storeActions.moveBlocksToPosition(
            listBlock.innerBlocks.map((i) => i.clientId),
            listBlock.clientId,
            grandParentListId,
            parentItemIndex + 1,
        );

        storeActions.removeBlock(clientId, true);
    };

    return (
        <>
            <ul {...innerBlocksProps} />

            <BlockControls group="block">
                <AlignmentToolbar
                    value={attributes.alignment}
                    onChange={(value) => setAttributes({ alignment: value })}
                />
                <ToolbarButton
                    icon={formatOutdent}
                    onClick={outdentList}
                    label="Outdent"
                    placeholder={undefined}
                    onPointerEnterCapture={undefined}
                    onPointerLeaveCapture={undefined}
                    disabled={attributes.parentCount === 0}
                />
            </BlockControls>

            <InspectorControls group="color">
                <ColorControl
                    label={__("Icon Color", "tableberg-pro")}
                    colorValue={attributes.iconColor}
                    onColorChange={(iconColor: any) =>
                        setAttributes({ iconColor })
                    }
                    onDeselect={() => setAttributes({ iconColor: undefined })}
                />
                <ColorControl
                    label={__("List Text Color", "tableberg-pro")}
                    colorValue={attributes.textColor}
                    onColorChange={(textColor: any) =>
                        setAttributes({ textColor })
                    }
                    onDeselect={() => setAttributes({ textColor: undefined })}
                />
                <ColorControl
                    label={__("List Background Color", "tableberg-pro")}
                    colorValue={attributes.backgroundColor}
                    onColorChange={(backgroundColor: any) =>
                        setAttributes({ backgroundColor })
                    }
                    onDeselect={() =>
                        setAttributes({ backgroundColor: undefined })
                    }
                />
            </InspectorControls>
            <InspectorControls group="dimensions">
                <SpacingControl
                    label={__("Spacing around list", "tableberg-pro")}
                    value={attributes.listSpacing}
                    onChange={(listSpacing: any) =>
                        setAttributes({ listSpacing })
                    }
                    onDeselect={() => setAttributes({ listSpacing: undefined })}
                />
            </InspectorControls>

            <InspectorControls group="settings">
                <PanelBody title="List Settings" initialOpen={true}>
                    <BaseControl __nextHasNoMarginBottom>
                        <SpacingControlSingle
                            label={__("List item Indentation", "tableberg-pro")}
                            value={attributes.listIndent}
                            onChange={(listIndent) =>
                                setAttributes({ listIndent })
                            }
                            style={{ marginTop: "40px" }}
                        />
                    </BaseControl>

                    <BaseControl __nextHasNoMarginBottom>
                        <SpacingControlSingle
                            label={__("Item Spacing", "tableberg-pro")}
                            value={attributes.itemSpacing}
                            onChange={(itemSpacing) =>
                                setAttributes({ itemSpacing })
                            }
                        />
                    </BaseControl>
                    <BaseControl __nextHasNoMarginBottom>
                        <SelectControl
                            label={__("Vertical Alignment", "tableberg-pro")}
                            value={attributes.alignItems}
                            onChange={(alignItems: any) =>
                                setAttributes({ alignItems })
                            }
                            options={[
                                {label: "Center", value: "center"},
                                {label: "Baseline", value: "baseline"},
                                {label: "Top", value: "flex-start"},
                                {label: "Bottom", value: "flex-end"},
                            ]}
                        />
                    </BaseControl>
                </PanelBody>
                <PanelBody title="Icon Settings" initialOpen={true}>
                    <PanelRow className="tableberg-styled-list-icon-selector">
                        <label>Select Icon</label>
                        <div>
                            <Button
                                style={{
                                    border: "1px solid #eeeeee",
                                }}
                                icon={
                                    <SVGComponent
                                        icon={attributes.icon}
                                        iconName="wordpress"
                                        type="wordpress"
                                    />
                                }
                                onClick={() => setLibraryOpen(true)}
                            />
                        </div>
                    </PanelRow>
                    <RangeControl
                        label={__("Icon size", "tableberg-pro")}
                        value={attributes.iconSize}
                        onChange={(iconSize) => {
                            setAttributes({ iconSize });
                        }}
                        min={0}
                        max={500}
                    />
                    <SpacingControlSingle
                        label={__("Icon Spacing", "tableberg-pro")}
                        value={attributes.iconSpacing}
                        onChange={(iconSpacing) =>
                            setAttributes({ iconSpacing })
                        }
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
                            value={attributes.icon?.iconName as any}
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
    const blockProps = useBlockProps.save();
    const innerBlocksProps = useInnerBlocksProps.save(blockProps);
    return <ul {...innerBlocksProps} />;
}

registerBlockType(metadata as any, {
    icon: blockIcon,
    attributes: metadata.attributes as any,
    edit,
    save,
});
