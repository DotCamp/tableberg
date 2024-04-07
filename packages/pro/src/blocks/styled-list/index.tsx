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
} from "@wordpress/block-editor";
import { getStyles } from "./get-styles";
import { ColorControl, SpacingControl } from "@tableberg/components";
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
    __experimentalToolsPanel as ToolsPanel,
    __experimentalToolsPanelItem as ToolsPanelItem,
} from "@wordpress/components";
import { useState } from "react";
import { edit as editIcon } from "@wordpress/icons";
import SVGComponent from "./get-icon";

export interface StyledListProps {
    isOrdered: boolean;
    icon: any;
    alignment: string;
    iconColor: string;
    iconSize: number;
    iconSpacing: number;
    fontSize: string;
    itemSpacing: number;
    textColor: string;
    backgroundColor: string;
    padding: object;
    margin: object;
}

const ALLOWED_BLOCKS = ["tableberg/styled-list-item"];

function edit(props: BlockEditProps<StyledListProps>) {
    const { attributes, setAttributes } = props;

    const blockProps = useBlockProps({
        style: getStyles(attributes),
        className: "tableberg-styled-list",
    });

    const innerBlocksProps = useInnerBlocksProps(blockProps as any, {
        allowedBlocks: ALLOWED_BLOCKS,
        template: [["tableberg/styled-list-item"]],
    });

    const [isLibraryOpen, setLibraryOpen] = useState(false);

    const TagName = attributes.isOrdered ? "ol" : "ul";

    return (
        <>
            <TagName {...innerBlocksProps} />

            <BlockControls>
                <AlignmentToolbar
                    value={attributes.alignment}
                    onChange={(value) => setAttributes({ alignment: value })}
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
                    label={__("Padding", "tableberg-pro")}
                    value={attributes.padding}
                    onChange={(padding) => setAttributes({ padding })}
                    onDeselect={() => setAttributes({ padding: undefined })}
                />
                <SpacingControl
                    label={__("Margin", "tableberg-pro")}
                    value={attributes.margin}
                    onChange={(margin) => setAttributes({ margin })}
                    onDeselect={() => setAttributes({ margin: undefined })}
                />
            </InspectorControls>

            <InspectorControls group="settings">
                <PanelBody title="List Settings" initialOpen={true}>
                    <BaseControl __nextHasNoMarginBottom>
                        <RangeControl
                            label={__("Item Spacing", "tableberg-pro")}
                            value={attributes.itemSpacing}
                            onChange={(itemSpacing) => {
                                setAttributes({ itemSpacing });
                            }}
                            min={0}
                            max={50}
                        />
                    </BaseControl>
                    <BaseControl __nextHasNoMarginBottom>
                        <SelectControl
                            label="List Type"
                            value={attributes.isOrdered ? "1" : "0"}
                            options={[
                                { label: "Orderded", value: "1" },
                                { label: "Unordered", value: "0" },
                            ]}
                            onChange={(isOrdered: any) => {
                                setAttributes({
                                    isOrdered: isOrdered == "1",
                                });
                            }}
                        />
                    </BaseControl>
                </PanelBody>
                {!attributes.isOrdered && (
                    <PanelBody title="Icon Settings" initialOpen={true}>
                        <PanelRow className="tableberg-styled-list-icon-selector">
                            <label>Select Icon</label>
                            <Button
                                style={{ border: "1px solid #eeeeee" }}
                                icon={
                                    (attributes.icon ? (
                                        <SVGComponent
                                            icon={attributes.icon}
                                            iconName="wordpress"
                                            type="wordpress"
                                        />
                                    ) : (
                                        editIcon
                                    )) as any
                                }
                                onClick={() => setLibraryOpen(true)}
                            />
                        </PanelRow>
                        <RangeControl
                            label={__("Icon size", "tableberg-pro")}
                            value={attributes.iconSize}
                            onChange={(iconSize) => {
                                setAttributes({ iconSize });
                            }}
                            min={10}
                            max={100}
                        />
                        <RangeControl
                            label={__("Icon Spacing", "tableberg-pro")}
                            value={attributes.iconSpacing}
                            onChange={(iconSpacing) => {
                                setAttributes({ iconSpacing });
                            }}
                            min={0}
                            max={20}
                        />
                    </PanelBody>
                )}
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
            </InspectorControls>
            {isLibraryOpen && (
                <Modal
                    isFullScreen
                    className="tableberg_icons_library_modal"
                    title={__("Icons", "tableberg-pro")}
                    onRequestClose={() => setLibraryOpen(false)}
                >
                    <IconsLibrary
                        value={attributes.icon.iconName as any}
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
