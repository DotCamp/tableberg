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
    store as blockEditorStore
} from "@wordpress/block-editor";
import {
    ToggleControl,
    __experimentalToolsPanel as ToolsPanel,
    __experimentalToolsPanelItem as ToolsPanelItem,
    __experimentalToggleGroupControl as ToggleGroupControl,
    __experimentalToggleGroupControlOptionIcon as ToggleGroupControlOptionIcon,
    PanelBody,
} from "@wordpress/components";
/**
 * Internal Imports
 */
import { ResponsiveOptions, TablebergBlockAttrs } from "./types";
import {
    ColorPickerDropdown,
    SpacingControl,
} from "./components";
import { ColorSettingsWithGradient } from "./components";
import { useDispatch, useSelect } from "@wordpress/data";
import { ResponsiveControls } from "./responsiveControls";
import BorderControl from "./components/BorderControl";

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

function TablebergControls(
    { clientId, preview }: {
        clientId: string;
        preview?: keyof ResponsiveOptions["breakpoints"];
    }
) {
    const { isTableControls, tableAttributes, tableBlockClientId, cellBlock } = useSelect((select) => {
        const storeSelect = select(blockEditorStore) as BlockEditorStoreSelectors;
        const currentBlock = storeSelect.getBlock(clientId)!;
        const isTableControls = currentBlock?.name === "tableberg/table";

        let tableBlock = currentBlock;
        let cellBlock = null;

        if (!isTableControls) {
            const parentBlocks = storeSelect.getBlockParents(clientId)
            const tableBlockClientId = parentBlocks.find(
                (blockClientId) =>
                    storeSelect.getBlock(blockClientId)?.name === "tableberg/table"
            )!;

            tableBlock = storeSelect.getBlock(tableBlockClientId)!;
            cellBlock = currentBlock;
        }

        const tableAttributes = tableBlock.attributes as TablebergBlockAttrs;

        return {
            isTableControls,
            tableAttributes,
            tableBlockClientId: tableBlock.clientId,
            cellBlock
        }
    }, [])

    const { enableInnerBorder, tableAlignment } = tableAttributes;

    const { updateBlockAttributes } = useDispatch(
        blockEditorStore
    ) as BlockEditorStoreActions;

    const setTableAttributes = (attributes: Record<string, any>) => {
        updateBlockAttributes(tableBlockClientId, attributes);
    }

    const onFontColorChange = (value: any) => {
        setTableAttributes({ fontColor: value });
    };
    const onFontSizeChange = (value: any) => {
        setTableAttributes({ fontSize: value });
    };
    const onLinkColorChange = (value: any) => {
        setTableAttributes({ linkColor: value });
    };

    const setHeight = (val: string) => {
        if (!cellBlock) {
            return;
        }

        const rowHeights = [...tableAttributes.rowHeights];
        rowHeights[cellBlock.attributes.row] = val;
        setTableAttributes({ rowHeights });
    };
    const setWidth = (val: string) => {
        if (!cellBlock) {
            return;
        }

        const colWidths = [...tableAttributes.colWidths];
        colWidths[cellBlock.attributes.col] = val;
        setTableAttributes({ colWidths });
    };

    return (
        <>
            {(!isTableControls && cellBlock) &&
                <InspectorControls group="styles">
                    <ToolsPanel
                        label={__("Cell Settings", "tableberg")}
                        resetAll={() => {
                            setHeight("");
                            setWidth("");
                        }}
                    >
                        <ToolsPanelItem
                            label={__("Column Width", "tableberg")}
                            hasValue={() => true}
                        >
                            <HeightControl
                                value={tableAttributes.colWidths[cellBlock.attributes.col] as any}
                                label={__("Column Width", "tableberg")}
                                onChange={setWidth}
                            />
                        </ToolsPanelItem>
                        <ToolsPanelItem
                            label={__("Row Height", "tableberg")}
                            hasValue={() => true}
                        >
                            <HeightControl
                                value={tableAttributes.rowHeights[cellBlock.attributes.row] as any}
                                label={__("Row Height", "tableberg")}
                                onChange={setHeight}
                            />
                        </ToolsPanelItem>
                    </ToolsPanel>
                </InspectorControls>
            }
            <InspectorControls>
                <PanelBody
                    title="Header Settings"
                >
                    <ToggleControl
                        checked={tableAttributes.enableTableHeader === ""}
                        label="Disable Header"
                        onChange={(val) => { setTableAttributes({ enableTableHeader: val ? "" : "added" }) }}
                    />
                    <ToggleControl
                        checked={tableAttributes.enableTableHeader === "converted"}
                        label="Make Top Row Header"
                        onChange={(val) => { setTableAttributes({ enableTableHeader: val ? "converted" : "" }) }}
                    />
                    <ToggleControl
                        checked={tableAttributes.enableTableHeader === "added"}
                        label="Insert Header"
                        onChange={(val) => { setTableAttributes({ enableTableHeader: val ? "added" : "" }) }}
                    />
                </PanelBody>
                <PanelBody
                    title="Footer Settings"
                >
                    <ToggleControl
                        checked={tableAttributes.enableTableFooter === ""}
                        label="Disable Footer"
                        onChange={(val) => { setTableAttributes({ enableTableFooter: val ? "" : "added" }) }}
                    />
                    <ToggleControl
                        checked={tableAttributes.enableTableFooter === "converted"}
                        label="Make Bottom Row Footer"
                        onChange={(val) => { setTableAttributes({ enableTableFooter: val ? "converted" : "" }) }}
                    />
                    <ToggleControl
                        checked={tableAttributes.enableTableFooter === "added"}
                        label="Insert Footer"
                        onChange={(val) => { setTableAttributes({ enableTableFooter: val ? "added" : "" }) }}
                    />
                </PanelBody>
                <PanelBody>
                    <HeightControl
                        value={tableAttributes.tableWidth}
                        label={__("Table Width", "tableberg")}
                        onChange={(newValue: string) =>
                            setTableAttributes({ tableWidth: newValue })
                        }
                    />
                    <ToggleGroupControl
                        label={__("Table Alignment", "tableberg")}
                        __nextHasNoMarginBottom
                        value={tableAlignment}
                        onChange={(newValue) => {
                            setTableAttributes({ tableAlignment: newValue })
                        }}
                    >
                        {AVAILABLE_JUSTIFICATIONS.map(({ value, icon, label }) => (
                            <ToggleGroupControlOptionIcon
                                key={value}
                                value={value}
                                icon={icon}
                                label={label}
                            />
                        )
                        )}
                    </ToggleGroupControl>
                </PanelBody>
            </InspectorControls>

            <InspectorControls group="styles">
                <ToolsPanel
                    label={__("Global Font Style", "tableberg")}
                    resetAll={() =>
                        setTableAttributes({
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
                            value={tableAttributes.fontColor}
                            onChange={onFontColorChange}
                        />
                    </ToolsPanelItem>
                    <ToolsPanelItem
                        label={__("Link Color", "tableberg")}
                        hasValue={() => true}
                    >
                        <ColorPickerDropdown
                            label={__("Link Color", "tableberg")}
                            value={tableAttributes.linkColor}
                            onChange={onLinkColorChange}
                        />
                    </ToolsPanelItem>
                    <ToolsPanelItem
                        label={__("Font Size", "tableberg")}
                        hasValue={() => true}
                    >
                        <FontSizePicker
                            value={tableAttributes.fontSize as any}
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
                    label={__("Table Border Size", "tableberg")}
                    value={tableAttributes.tableBorder}
                    onChange={(newBorder) => {
                        setTableAttributes(
                            { tableBorder: newBorder }
                        )
                    }}
                    onDeselect={() => {
                        setTableAttributes(
                            { tableBorder: undefined }
                        )
                    }}
                />
                <ToolsPanelItem
                    panelId={clientId}
                    isShownByDefault={true}
                    resetAllFilter={() =>
                        setTableAttributes({
                            enableInnerBorder: true,
                        })
                    }
                    hasValue={() => !enableInnerBorder}
                    label={__("Enable Inner Border", "tableberg")}
                    onDeselect={() => {
                        setTableAttributes({ enableInnerBorder: true });
                    }}
                >
                    <ToggleControl
                        label={__("Enable Inner Border", "tableberg")}
                        checked={enableInnerBorder}
                        onChange={() =>
                            setTableAttributes({
                                enableInnerBorder:
                                    !tableAttributes.enableInnerBorder,
                            })
                        }
                    />
                </ToolsPanelItem>
                {tableAttributes.enableInnerBorder &&
                    <BorderControl
                        label={__("Inner Border Size", "tableberg")}
                        value={tableAttributes.innerBorder}
                        onChange={(newBorder) => {
                            setTableAttributes(
                                { innerBorder: newBorder }
                            )
                        }}
                        onDeselect={() => {
                            setTableAttributes(
                                { innerBorder: undefined }
                            )
                        }}
                    />}
            </InspectorControls>
            {!!preview &&
                <ResponsiveControls
                    preview={preview}
                    attributes={tableAttributes}
                    setTableAttributes={setTableAttributes}
                />
            }
            <BlockControls>
                <BlockAlignmentToolbar
                    value={tableAlignment}
                    onChange={(newValue) => {
                        setTableAttributes({ tableAlignment: newValue });
                    }}
                    controls={["left", "center", "right"]}
                />
            </BlockControls>
        </>
    );
}
export default TablebergControls;
