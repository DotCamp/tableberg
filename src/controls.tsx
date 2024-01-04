/**
 * WordPress Imports
 */
import { __ } from "@wordpress/i18n";
import { justifyLeft, justifyCenter, justifyRight } from "@wordpress/icons";
//@ts-ignore
import {
    InspectorControls,
    HeightControl,
    BlockControls,
    BlockAlignmentToolbar,
} from "@wordpress/block-editor";
import { BlockEditProps } from "@wordpress/blocks";
import {
    ColorPicker,
    PanelBody,
    RangeControl,
    ToggleControl,
    __experimentalToolsPanelItem as ToolsPanelItem,
} from "@wordpress/components";
/**
 * Internal Imports
 */
import { TablebergBlockAttrs } from "./types";
import {
    BorderControl,
    CustomToggleGroupControl,
    SpacingControl,
} from "./components";
import { ColorSettingsWithGradient } from "./components";

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

function TablebergControls(props: BlockEditProps<TablebergBlockAttrs>) {
    const { attributes, setAttributes, clientId } = props;
    const { enableInnerBorder, tableAlignment } = attributes;

    const blockAlignChange = (newValue: "left" | "right" | "center") => {
        setAttributes({ tableAlignment: newValue });
    };

    const onFontColorChange = (value: any) => {
        setAttributes({ fontColor: value.hex });
    };
    const onFontSizeChange = (value: any) => {
        
        setAttributes({ fontSize: value.toString() + 'px' });
    };
    const onLinkColorChange = (value: any) => {
        setAttributes({ linkColor: value.hex });
    };

    return (
        <>
            <InspectorControls>
                <PanelBody title="Global Style" initialOpen={false}>
                    <ColorPicker
                        color={attributes.fontColor}
                        onChangeComplete={onFontColorChange}
                    />
                    <RangeControl
                        label="Size"
                        value={parseInt(attributes.fontSize) || 0}
                        min={3}
                        max={100}
                        onChange={onFontSizeChange}
                    />
                </PanelBody>
            </InspectorControls>
            <InspectorControls>
                <PanelBody>
                    <ToggleControl
                        checked={attributes.enableTableHeader}
                        label={__("Enable Table Header", "tableberg")}
                        onChange={() =>
                            setAttributes({
                                enableTableHeader:
                                    !attributes.enableTableHeader,
                            })
                        }
                    />
                    <ToggleControl
                        checked={attributes.enableTableFooter}
                        label={__("Enable Table Footer", "tableberg")}
                        onChange={() =>
                            setAttributes({
                                enableTableFooter:
                                    !attributes.enableTableFooter,
                            })
                        }
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

            {/* @ts-ignore  */}
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

            {/* @ts-ignore  */}
            <InspectorControls group="dimensions">
                <SpacingControl
                    attrKey="cellPadding"
                    label={__("Cell Padding", "tableberg")}
                    showByDefault
                />
            </InspectorControls>
            {/* @ts-ignore  */}
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
