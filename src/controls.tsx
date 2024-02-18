/**
 * WordPress Imports
 */
import { __ } from "@wordpress/i18n";
import { justifyLeft, justifyCenter, justifyRight } from "@wordpress/icons";
import {
    InspectorControls,
    HeightControl,
    BlockControls,
    BlockAlignmentToolbar,
    FontSizePicker,
} from "@wordpress/block-editor";
import { BlockEditProps } from "@wordpress/blocks";
import {
    PanelBody,
    ToggleControl,
    __experimentalToolsPanel as ToolsPanel,
    __experimentalToolsPanelItem as ToolsPanelItem,
} from "@wordpress/components";
/**
 * Internal Imports
 */
import { TablebergBlockAttrs } from "./types";
import {
    BorderControl,
    ColorPickerDropdown,
    CustomToggleGroupControl,
    SpacingControl,
} from "./components";
import { ColorSettingsWithGradient } from "./components";

import {
    AddHeaderIcon,
    ConvertHeaderIcon,
    NoHeaderIcon,
    AddFooterIcon,
    ConvertFooterIcon,
    NoFooterIcon,
} from "./icons/header-footer";

const AVAILABLE_JUSTIFICATIONS = [
    {
        value: "left",
        icon: justifyLeft,
        label: __("Left", "tableberg"),
    },
    {
        value: "center",
        icon: justifyCenter,
        label: __("Center", "tableberg"),
    },
    {
        value: "right",
        icon: justifyRight,
        label: __("Right", "tableberg"),
    },
];

const HEADER_OPTIONS = [
    {
        value: "",
        icon: NoHeaderIcon,
        label: __("Disable Header", "tableberg"),
    },
    {
        value: "added",
        icon: AddHeaderIcon,
        label: __("Insert Header", "tableberg"),
    },

    {
        value: "converted",
        icon: ConvertHeaderIcon,
        label: __("Make Top Row Header", "tableberg"),
    },
];

const FOOTER_OPTIONS = [
    {
        value: "",
        icon: NoFooterIcon,
        label: __("Disable Footer", "tableberg"),
    },
    {
        value: "added",
        icon: AddFooterIcon,
        label: __("Insert Footer", "tableberg"),
    },

    {
        value: "converted",
        icon: ConvertFooterIcon,
        label: __("Make Bottom Row Footer", "tableberg"),
    },
];

function TablebergControls(props: BlockEditProps<TablebergBlockAttrs>) {
    const { attributes, setAttributes, clientId } = props;
    const { enableInnerBorder, tableAlignment } = attributes;

    const blockAlignChange = (newValue: "left" | "right" | "center") => {
        setAttributes({ tableAlignment: newValue });
    };

    const onFontColorChange = (value: any) => {
        setAttributes({ fontColor: value });
    };
    const onFontSizeChange = (value: any) => {
        setAttributes({ fontSize: value });
    };
    const onLinkColorChange = (value: any) => {
        setAttributes({ linkColor: value });
    };

    return (
        <>
            <InspectorControls>
                <PanelBody>
                    <CustomToggleGroupControl
                        options={HEADER_OPTIONS}
                        attributeKey="enableTableHeader"
                        label={__("Table Header Setting", "tableberg")}
                    />
                    <CustomToggleGroupControl
                        options={FOOTER_OPTIONS}
                        attributeKey="enableTableFooter"
                        label={__("Table Footer Setting", "tableberg")}
                    />

                    <HeightControl
                        value={attributes.tableWidth}
                        label={__("Table Width", "tableberg")}
                        onChange={(newValue: string) =>
                            setAttributes({ tableWidth: newValue })
                        }
                    />
                    <CustomToggleGroupControl
                        options={AVAILABLE_JUSTIFICATIONS}
                        attributeKey="tableAlignment"
                        label={__("Table Alignment", "tableberg")}
                    />
                </PanelBody>
            </InspectorControls>

            <InspectorControls group="styles">
                <ToolsPanel
                    label={__("Global Font Style", "tableberg")}
                    resetAll={() =>
                        setAttributes({
                            fontColor: "",
                            fontSize: "",
                            linkColor: "",
                        })
                    }
                >
                    <ToolsPanelItem
                        label={__("Font Color", "tableberg")}
                        hasValue={() => true}
                    >
                        <ColorPickerDropdown
                            label={__("Font Color", "tableberg")}
                            value={attributes.fontColor}
                            onChange={onFontColorChange}
                        />
                    </ToolsPanelItem>
                    <ToolsPanelItem
                        label={__("Link Color", "tableberg")}
                        hasValue={() => true}
                    >
                        <ColorPickerDropdown
                            label={__("Link Color", "tableberg")}
                            value={attributes.linkColor}
                            onChange={onLinkColorChange}
                        />
                    </ToolsPanelItem>
                    <ToolsPanelItem
                        label={__("Font Size", "tableberg")}
                        hasValue={() => true}
                    >
                        <FontSizePicker
                            value={attributes.fontSize as any}
                            onChange={onFontSizeChange}
                        />
                    </ToolsPanelItem>
                </ToolsPanel>
            </InspectorControls>

            <InspectorControls group="color">
                <ColorSettingsWithGradient
                    label={__("Header Background Color", "tableberg")}
                    attrBackgroundKey="headerBackgroundColor"
                    attrGradientKey="headerBackgroundGradient"
                />
                <ColorSettingsWithGradient
                    label={__("Even Row Background Color", "tableberg")}
                    attrBackgroundKey="evenRowBackgroundColor"
                    attrGradientKey="evenRowBackgroundGradient"
                />
                <ColorSettingsWithGradient
                    label={__("Odd Row Background Color", "tableberg")}
                    attrBackgroundKey="oddRowBackgroundColor"
                    attrGradientKey="oddRowBackgroundGradient"
                />
                <ColorSettingsWithGradient
                    label={__("Footer Background Color", "tableberg")}
                    attrBackgroundKey="footerBackgroundColor"
                    attrGradientKey="footerBackgroundGradient"
                />
            </InspectorControls>

            <InspectorControls group="dimensions">
                <SpacingControl
                    attrKey="cellPadding"
                    label={__("Cell Padding", "tableberg")}
                    showByDefault
                />
                <SpacingControl
                    attrKey="cellSpacing"
                    label={__("Cell Spacing", "tableberg")}
                    sides={["horizontal", "vertical"]}
                    showByDefault
                />
            </InspectorControls>

            <InspectorControls group="border">
                <BorderControl
                    showDefaultBorder
                    showBorderRadius={false}
                    attrBorderKey="tableBorder"
                    borderLabel={__("Table Border Size", "tableberg")}
                />
                <ToolsPanelItem
                    panelId={clientId}
                    isShownByDefault={true}
                    resetAllFilter={() =>
                        setAttributes({
                            enableInnerBorder: false,
                        })
                    }
                    hasValue={() => enableInnerBorder}
                    label={__("Enable Inner Border", "tableberg")}
                    onDeselect={() => {
                        setAttributes({ enableInnerBorder: false });
                    }}
                >
                    <ToggleControl
                        label={__("Enable Inner Border", "tableberg")}
                        checked={enableInnerBorder}
                        onChange={() =>
                            setAttributes({
                                enableInnerBorder:
                                    !attributes.enableInnerBorder,
                            })
                        }
                    />
                </ToolsPanelItem>
                <BorderControl
                    showDefaultBorder
                    showBorderRadius={false}
                    showBorder={attributes.enableInnerBorder}
                    attrBorderKey="innerBorder"
                    borderLabel={__("Inner Border Size", "tableberg")}
                />
            </InspectorControls>
            <InspectorControls group="settings">
                <ToggleControl
                    label={__("Enable Responsiveness", "tableberg")}
                    checked={!!attributes?.responsive?.enabled}
                    onChange={() =>
                        setAttributes({
                            responsive: {
                                ...(attributes?.responsive || {}),
                                enabled: !attributes?.responsive?.enabled,
                                type: "stack",
                            },
                        })
                    }
                />
            </InspectorControls>
            <BlockControls>
                <BlockAlignmentToolbar
                    value={tableAlignment}
                    onChange={blockAlignChange}
                    controls={["left", "center", "right"]}
                />
            </BlockControls>
        </>
    );
}
export default TablebergControls;
