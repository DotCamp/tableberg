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
    BaseControl,
    PanelBody,
    SelectControl,
    __experimentalNumberControl as NumberControl,
    ToggleControl,
    __experimentalToolsPanel as ToolsPanel,
    __experimentalToolsPanelItem as ToolsPanelItem,
    Notice,
} from "@wordpress/components";
/**
 * Internal Imports
 */
import { Breakpoint, ResponsiveOptions, TablebergBlockAttrs } from "./types";
import {
    BorderControl,
    ColorPickerDropdown,
    CustomToggleGroupControl,
    SpacingControl,
} from "./components";
import { ColorSettingsWithGradient } from "./components";
import { dispatch } from "@wordpress/data";

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

const DEFAULT_BREAKPOINT_OPTIONS = {
    desktop: {
        enabled: false,
        headerAsCol: true,
        maxWidth: 1024,
        mode: "",
        direction: "row",
        stackCount: 3,
    },
    mobile: {
        enabled: false,
        headerAsCol: true,
        maxWidth: 700,
        mode: "",
        direction: "row",
        stackCount: 1,
    },
    tablet: {
        enabled: false,
        headerAsCol: true,
        maxWidth: 1024,
        mode: "",
        direction: "row",
        stackCount: 3,
    },
} as const;

const DEVICE_TYPE_IDX = {
    desktop: 0,
    tablet: 1,
    mobile: 2,
} as const;

function TablebergControls(
    props: BlockEditProps<TablebergBlockAttrs> & {
        preview: keyof ResponsiveOptions["breakpoints"];
    }
) {
    const { attributes, setAttributes, clientId, preview } = props;
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

    const isDisabled = preview === "desktop";
    const breakpoint =
        // @ts-ignore
        attributes.responsive?.breakpoints?.[preview] ||
        DEFAULT_BREAKPOINT_OPTIONS[preview];

    const setResponsive = (options: Partial<Breakpoint>) => {
        if (isDisabled) {
            return;
        }
        setAttributes({
            responsive: {
                ...(attributes.responsive || {}),
                breakpoints: {
                    ...(attributes.responsive.breakpoints || {}),
                    [preview]: {
                        ...breakpoint,
                        ...options,
                    } as any,
                },
            },
        });
    };

    return (
        <>
            <InspectorControls>
                <PanelBody>
                    <BaseControl __nextHasNoMarginBottom>
                        <BaseControl.VisualLabel>
                            Header Settings
                        </BaseControl.VisualLabel>
                        <ToggleControl
                            checked={attributes.enableTableHeader === ""}
                            label="Disable Header"
                            onChange={(val) => {
                                setAttributes({
                                    enableTableHeader: val ? "" : "added",
                                });
                            }}
                        />
                        <ToggleControl
                            checked={
                                attributes.enableTableHeader === "converted"
                            }
                            label="Make Top Row Header"
                            onChange={(val) => {
                                setAttributes({
                                    enableTableHeader: val ? "converted" : "",
                                });
                            }}
                        />
                        <ToggleControl
                            checked={attributes.enableTableHeader === "added"}
                            label="Insert Header"
                            onChange={(val) => {
                                setAttributes({
                                    enableTableHeader: val ? "added" : "",
                                });
                            }}
                        />
                    </BaseControl>
                </PanelBody>
                <PanelBody>
                    <BaseControl __nextHasNoMarginBottom>
                        <BaseControl.VisualLabel>
                            Footer Settings
                        </BaseControl.VisualLabel>
                        <ToggleControl
                            checked={attributes.enableTableFooter === ""}
                            label="Disable Footer"
                            onChange={(val) => {
                                setAttributes({
                                    enableTableFooter: val ? "" : "added",
                                });
                            }}
                        />
                        <ToggleControl
                            checked={
                                attributes.enableTableFooter === "converted"
                            }
                            label="Make Bottom Row Footer"
                            onChange={(val) => {
                                setAttributes({
                                    enableTableFooter: val ? "converted" : "",
                                });
                            }}
                        />
                        <ToggleControl
                            checked={attributes.enableTableFooter === "added"}
                            label="Insert Footer"
                            onChange={(val) => {
                                setAttributes({
                                    enableTableFooter: val ? "added" : "",
                                });
                            }}
                        />
                    </BaseControl>
                </PanelBody>
                <PanelBody>
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
                    sides={["horizontal", "vertical"]}
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
                <PanelBody title="Responsiveness Settings" initialOpen={true}>
                    <BaseControl __nextHasNoMarginBottom>
                        <Notice
                            className="add-margin-bottom"
                            isDismissible={false}
                        >
                            Use the block editor preview modes to configure and
                            preview the table at different breakpoints
                        </Notice>

                        <SelectControl
                            label="Preview Mode"
                            value={preview}
                            options={[
                                { label: "Desktop", value: "desktop" },
                                { label: "Tablet", value: "tablet" },
                                { label: "Mobile", value: "mobile" },
                            ]}
                            onChange={async (previewMode: any) => {
                                previewMode = (previewMode as string).charAt(0).toUpperCase() + previewMode.slice(1)
                                // prettier-ignore
                                if (dispatch("core/editor")?.setDeviceType){
                                    dispatch("core/editor").setDeviceType(previewMode);
                                } else if (dispatch("core/edit-site")?.__experimentalSetPreviewDeviceType) {
                                    dispatch("core/edit-site").__experimentalSetPreviewDeviceType(previewMode);
                                } else if (dispatch("core/edit-post")?.__experimentalSetPreviewDeviceType) {
                                    dispatch("core/edit-post").__experimentalSetPreviewDeviceType(previewMode);
                                }
                            }}
                        />

                        <ToggleControl
                            label={__("Enable Breakpoint", "tableberg")}
                            checked={breakpoint?.enabled}
                            onChange={() =>
                                setResponsive({
                                    enabled: !breakpoint?.enabled,
                                })
                            }
                            disabled={isDisabled}
                        />
                        <ToggleControl
                            checked={
                                attributes.enableTableHeader === "converted"
                            }
                            label="Make Top Row Header"
                            onChange={(val) => {
                                setAttributes({
                                    enableTableHeader: val ? "converted" : "",
                                });
                            }}
                            disabled={isDisabled}
                        />
                        <NumberControl
                            label={__("Max Width", "tableberg")}
                            onChange={(val) =>
                                setResponsive({
                                    maxWidth: parseInt(val || "0"),
                                })
                            }
                            min={1}
                            value={breakpoint?.maxWidth}
                            labelPosition="side"
                            suffix="px"
                            spinControls="none"
                            size="small"
                            help="These responsiveness settings will be active until the viewport reaches this width (Frontend only)."
                            disabled={isDisabled}
                        />
                        <SelectControl
                            label="Mode"
                            value={breakpoint?.mode || "scroll"}
                            options={[
                                { label: "Scroll", value: "scroll" },
                                { label: "Stack Cells", value: "stack" },
                            ]}
                            onChange={(mode: any) =>
                                setResponsive({
                                    mode,
                                })
                            }
                            disabled={isDisabled}
                            __nextHasNoMarginBottom
                        />
                        {breakpoint?.mode === "stack" && (
                            <>
                                <SelectControl
                                    label="Stack Direction"
                                    value={breakpoint?.direction}
                                    options={[
                                        { label: "Row", value: "row" },
                                        { label: "Column", value: "col" },
                                    ]}
                                    onChange={(direction: any) =>
                                        setResponsive({
                                            direction,
                                        })
                                    }
                                    disabled={isDisabled}
                                    __nextHasNoMarginBottom
                                />
                                {breakpoint?.direction === "row" && (
                                    <ToggleControl
                                        label={__(
                                            "Show header in first column",
                                            "tableberg"
                                        )}
                                        checked={breakpoint?.headerAsCol}
                                        onChange={() =>
                                            setResponsive({
                                                headerAsCol:
                                                    !breakpoint?.headerAsCol,
                                            })
                                        }
                                        disabled={isDisabled}
                                    />
                                )}
                                <NumberControl
                                    label={__("Items per row", "tableberg")}
                                    onChange={(val: any) =>
                                        setResponsive({
                                            stackCount: Math.max(
                                                1,
                                                parseInt(val)
                                            ),
                                        })
                                    }
                                    min={1}
                                    value={breakpoint?.stackCount}
                                    disabled={isDisabled}
                                />
                            </>
                        )}
                    </BaseControl>
                </PanelBody>
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
