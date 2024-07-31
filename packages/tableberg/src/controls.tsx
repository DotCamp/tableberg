/**
 * WordPress Imports
 */
import { __ } from "@wordpress/i18n";
import {
    justifyLeft,
    justifyCenter,
    justifyRight,
    alignNone,
    arrowRight,
    arrowDown,
} from "@wordpress/icons";
import {
    InspectorControls,
    HeightControl,
    BlockControls,
    FontSizePicker,
    store as blockEditorStore,
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
import {
    ResponsiveOptions,
    TablebergBlockAttrs,
    TablebergCellBlockAttrs,
} from "@tableberg/shared/types";
import { useDispatch, useSelect } from "@wordpress/data";
import { ResponsiveControls } from "./responsiveControls";
import {
    SpacingControl,
    ColorControl,
    ColorPickerDropdown,
    ToolbarWithDropdown,
    SizeControl,
    SpacingControlSingle,
    BorderWithRadiusControl,
} from "@tableberg/components";
import LockedControl from "./components/LockedControl";
import LockedBorderWithRadiusControl from "./components/LockedBorderWithRadiusControl";
import CellOrientationControl from "./components/CellOrientationControl";

const IS_PRO = TABLEBERG_CFG.IS_PRO;

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

interface Props {
    clientId: string;
    preview?: keyof ResponsiveOptions["breakpoints"];
    attributes: TablebergBlockAttrs | TablebergCellBlockAttrs;
    setAttributes: (
        attrs: Partial<TablebergBlockAttrs | TablebergCellBlockAttrs>,
    ) => void;
}

function TablebergControls({
    clientId,
    preview,
    attributes,
    setAttributes,
}: Props) {
    const { tableAttributes, tableBlockClientId, cellBlock, themeColors } =
        useSelect((select) => {
            const storeSelect = select(
                blockEditorStore,
            ) as BlockEditorStoreSelectors;
            const currentBlock = storeSelect.getBlock(clientId)!;
            const isTableControls = currentBlock?.name === "tableberg/table";

            let tableBlock = currentBlock;
            let cellBlock = null;

            if (!isTableControls) {
                const parentBlocks = storeSelect.getBlockParents(clientId);
                const tableBlockClientId = parentBlocks.find(
                    (blockClientId) =>
                        storeSelect.getBlock(blockClientId)?.name ===
                        "tableberg/table",
                )!;

                tableBlock = storeSelect.getBlock(tableBlockClientId)!;
                cellBlock = currentBlock;
            }

            const tableAttributes =
                tableBlock.attributes as TablebergBlockAttrs;

            return {
                isTableControls,
                tableAttributes,
                tableBlockClientId: tableBlock.clientId,
                cellBlock,
                themeColors:
                    storeSelect.getSettings()?.__experimentalFeatures?.color
                        .palette.theme,
            };
        }, []);

    const {
        enableInnerBorder,
        tableAlignment,
        cellPadding,
        cellSpacing,
        fontColor,
        linkColor,
        fontSize,
    } = tableAttributes;

    const { updateBlockAttributes } = useDispatch(blockEditorStore as any);

    const setTableAttributes = (attributes: Record<string, any>) => {
        updateBlockAttributes(tableBlockClientId, attributes);
    };

    const setRowStyle = (styles: TablebergBlockAttrs["rowStyles"][number]) => {
        if (!cellBlock) {
            return;
        }

        const rowStyles = { ...tableAttributes.rowStyles };
        rowStyles[cellBlock.attributes.row] = {
            ...rowStyles[cellBlock.attributes.row],
            ...styles,
        };
        setTableAttributes({ rowStyles });
    };
    const setColStyle = (styles: TablebergBlockAttrs["colStyles"][number]) => {
        if (!cellBlock) {
            return;
        }

        const colStyles = { ...tableAttributes.colStyles };
        colStyles[cellBlock.attributes.col] = {
            ...colStyles[cellBlock.attributes.col],
            ...styles,
        };
        setTableAttributes({ colStyles });
    };

    return (
        <>
            <InspectorControls>
                <ToolsPanel
                    label={__("Cell Settings", "tableberg")}
                    resetAll={() => {}}
                >
                    <ToolsPanelItem label={__("")} hasValue={() => true}>
                        <ToggleControl
                            checked={tableAttributes.fixedColWidth}
                            label="Fixed width cells"
                            onChange={(fixedColWidth) => {
                                setTableAttributes({
                                    fixedColWidth,
                                });
                            }}
                        />
                    </ToolsPanelItem>
                    {cellBlock && (
                        <>
                            {IS_PRO ? (
                                <>
                                    <ToolsPanelItem
                                        label={__("")}
                                        hasValue={() => true}
                                    >
                                        <ToggleControl
                                            checked={
                                                cellBlock.attributes.isEmpty
                                            }
                                            label="[PRO] Empty Cell"
                                            onChange={(isEmpty) => {
                                                setAttributes({
                                                    isEmpty,
                                                });
                                            }}
                                        />
                                    </ToolsPanelItem>
                                    <CellOrientationControl
                                        attrs={cellBlock.attributes as any}
                                        setAttrs={setAttributes as any}
                                    />
                                </>
                            ) : (
                                <>
                                    <LockedControl
                                        isEnhanced
                                        inToolsPanel
                                        selected="empty-cell"
                                    >
                                        <ToggleControl
                                            label={__(
                                                "[PRO] Empty Cell",
                                                "tableberg",
                                            )}
                                            checked={
                                                cellBlock.attributes.isEmpty
                                            }
                                            onChange={() => {}}
                                        />
                                    </LockedControl>
                                    <LockedControl
                                        isEnhanced
                                        inToolsPanel
                                        selected="cell-orientation"
                                    >
                                        <ToggleGroupControl
                                            __nextHasNoMarginBottom
                                            className="block-editor-hooks__flex-layout-orientation-controls"
                                            label={__("Orientation")}
                                            value={"vertical"}
                                        >
                                            <ToggleGroupControlOptionIcon
                                                icon={arrowRight}
                                                value="horizontal"
                                                label={__("Horizontal")}
                                            />
                                            <ToggleGroupControlOptionIcon
                                                icon={arrowDown}
                                                value="vertical"
                                                label={__("Vertical")}
                                            />
                                        </ToggleGroupControl>
                                    </LockedControl>
                                </>
                            )}
                            <ToolsPanelItem
                                label={__("Column Width", "tableberg")}
                                hasValue={() => true}
                            >
                                <SizeControl
                                    value={
                                        tableAttributes.colStyles[
                                            cellBlock.attributes.col
                                        ]?.width as any
                                    }
                                    label={__("Column Width", "tableberg")}
                                    onChange={(width: any) =>
                                        setColStyle({ width })
                                    }
                                    disabled={tableAttributes.fixedColWidth}
                                />
                            </ToolsPanelItem>
                            <ToolsPanelItem
                                label={__("Row Height", "tableberg")}
                                hasValue={() => true}
                            >
                                <HeightControl
                                    value={
                                        tableAttributes.rowStyles[
                                            cellBlock.attributes.row
                                        ]?.height as any
                                    }
                                    label={__("Row Height", "tableberg")}
                                    onChange={(height: any) =>
                                        setRowStyle({ height })
                                    }
                                />
                            </ToolsPanelItem>
                        </>
                    )}
                </ToolsPanel>
            </InspectorControls>

            <InspectorControls>
                <PanelBody title="Header Settings">
                    <ToggleControl
                        checked={tableAttributes.enableTableHeader === ""}
                        label="Disable Header"
                        onChange={(val) => {
                            setTableAttributes({
                                enableTableHeader: val ? "" : "added",
                            });
                        }}
                    />
                    <ToggleControl
                        checked={
                            tableAttributes.enableTableHeader === "converted"
                        }
                        label="Make Top Row Header"
                        onChange={(val) => {
                            setTableAttributes({
                                enableTableHeader: val ? "converted" : "",
                            });
                        }}
                    />
                    <ToggleControl
                        checked={tableAttributes.enableTableHeader === "added"}
                        label="Insert Header"
                        onChange={(val) => {
                            setTableAttributes({
                                enableTableHeader: val ? "added" : "",
                            });
                        }}
                    />
                </PanelBody>
                <PanelBody title="Footer Settings">
                    <ToggleControl
                        checked={tableAttributes.enableTableFooter === ""}
                        label="Disable Footer"
                        onChange={(val) => {
                            setTableAttributes({
                                enableTableFooter: val ? "" : "added",
                            });
                        }}
                    />
                    <ToggleControl
                        checked={
                            tableAttributes.enableTableFooter === "converted"
                        }
                        label="Make Bottom Row Footer"
                        onChange={(val) => {
                            setTableAttributes({
                                enableTableFooter: val ? "converted" : "",
                            });
                        }}
                    />
                    <ToggleControl
                        checked={tableAttributes.enableTableFooter === "added"}
                        label="Insert Footer"
                        onChange={(val) => {
                            setTableAttributes({
                                enableTableFooter: val ? "added" : "",
                            });
                        }}
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
                            setTableAttributes({ tableAlignment: newValue });
                        }}
                    >
                        {AVAILABLE_JUSTIFICATIONS.map(
                            ({ value, icon, label }) => (
                                <ToggleGroupControlOptionIcon
                                    key={value}
                                    value={value}
                                    icon={icon}
                                    label={label}
                                />
                            ),
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
                        hasValue={() => !!fontColor}
                        onDeselect={() => setTableAttributes({ fontColor: "" })}
                        isShownByDefault
                    >
                        <ColorPickerDropdown
                            label={__("Font Color", "tableberg")}
                            value={tableAttributes.fontColor}
                            onChange={(val) =>
                                setTableAttributes({ fontColor: val })
                            }
                            colors={themeColors}
                        />
                    </ToolsPanelItem>
                    <ToolsPanelItem
                        label={__("Link Color", "tableberg")}
                        hasValue={() => !!linkColor}
                        onDeselect={() => setTableAttributes({ linkColor: "" })}
                        isShownByDefault
                    >
                        <ColorPickerDropdown
                            label={__("Link Color", "tableberg")}
                            value={tableAttributes.linkColor}
                            onChange={(val) =>
                                setTableAttributes({ linkColor: val })
                            }
                            colors={themeColors}
                        />
                    </ToolsPanelItem>
                    <ToolsPanelItem
                        label={__("Font Size", "tableberg")}
                        hasValue={() => !!fontSize}
                        onDeselect={() => setTableAttributes({ fontSize: "" })}
                        isShownByDefault
                    >
                        <FontSizePicker
                            value={tableAttributes.fontSize as any}
                            onChange={(val) =>
                                setTableAttributes({ fontSize: val })
                            }
                        />
                    </ToolsPanelItem>
                </ToolsPanel>
            </InspectorControls>
            <InspectorControls group="color">
                <ColorControl
                    label={__("Header Background Color", "tableberg")}
                    colorValue={tableAttributes.headerBackgroundColor}
                    gradientValue={tableAttributes.headerBackgroundGradient}
                    onColorChange={(newValue) =>
                        setTableAttributes({
                            headerBackgroundColor: newValue,
                        })
                    }
                    allowGradient
                    onGradientChange={(newValue) =>
                        setTableAttributes({
                            headerBackgroundGradient: newValue,
                        })
                    }
                    onDeselect={() =>
                        setTableAttributes({
                            headerBackgroundColor: undefined,
                            headerBackgroundGradient: undefined,
                        })
                    }
                />
                <ColorControl
                    label={__("Even Row Background Color", "tableberg")}
                    colorValue={tableAttributes.evenRowBackgroundColor}
                    gradientValue={tableAttributes.evenRowBackgroundGradient}
                    onColorChange={(newValue) =>
                        setTableAttributes({
                            evenRowBackgroundColor: newValue,
                        })
                    }
                    allowGradient
                    onGradientChange={(newValue) =>
                        setTableAttributes({
                            evenRowBackgroundGradient: newValue,
                        })
                    }
                    onDeselect={() =>
                        setTableAttributes({
                            evenRowBackgroundColor: undefined,
                            evenRowBackgroundGradient: undefined,
                        })
                    }
                />
                <ColorControl
                    label={__("Odd Row Background Color", "tableberg")}
                    colorValue={tableAttributes.oddRowBackgroundColor}
                    gradientValue={tableAttributes.oddRowBackgroundGradient}
                    onColorChange={(newValue) =>
                        setTableAttributes({
                            oddRowBackgroundColor: newValue,
                        })
                    }
                    allowGradient
                    onGradientChange={(newValue) =>
                        setTableAttributes({
                            oddRowBackgroundGradient: newValue,
                        })
                    }
                    onDeselect={() =>
                        setTableAttributes({
                            oddRowBackgroundColor: undefined,
                            oddRowBackgroundGradient: undefined,
                        })
                    }
                />
                <ColorControl
                    label={__("Footer Background Color", "tableberg")}
                    colorValue={tableAttributes.footerBackgroundColor}
                    gradientValue={tableAttributes.footerBackgroundGradient}
                    onColorChange={(newValue) =>
                        setTableAttributes({
                            footerBackgroundColor: newValue,
                        })
                    }
                    allowGradient
                    onGradientChange={(newValue) =>
                        setTableAttributes({
                            footerBackgroundGradient: newValue,
                        })
                    }
                    onDeselect={() =>
                        setTableAttributes({
                            footerBackgroundColor: undefined,
                            footerBackgroundGradient: undefined,
                        })
                    }
                />

                {!IS_PRO && (
                    <LockedControl inToolsPanel isEnhanced selected="cell-bg">
                        <ColorControl
                            label={__("[PRO] Cell Background", "tableberg")}
                            colorValue={null}
                            onColorChange={() => {}}
                            onDeselect={() => {}}
                        />
                    </LockedControl>
                )}
                {!IS_PRO && (
                    <LockedControl inToolsPanel isEnhanced selected="row-bg">
                        <ColorControl
                            label={__(
                                "[PRO] Row Background Color",
                                "tableberg",
                            )}
                            colorValue={null}
                            onColorChange={() => {}}
                            onDeselect={() => {}}
                        />
                    </LockedControl>
                )}
                {!IS_PRO && (
                    <LockedControl inToolsPanel isEnhanced selected="col-bg">
                        <ColorControl
                            label={__(
                                "[PRO] Col Background Color",
                                "tableberg",
                            )}
                            colorValue={null}
                            onColorChange={() => {}}
                            onDeselect={() => {}}
                        />
                    </LockedControl>
                )}
            </InspectorControls>

            <InspectorControls group="dimensions">
                <SpacingControl
                    label="Cell Padding"
                    value={cellPadding}
                    onChange={(val) => setTableAttributes({ cellPadding: val })}
                    onDeselect={() => setTableAttributes({ cellPadding: {} })}
                />
                <SpacingControl
                    label="Cell Spacing"
                    value={cellSpacing}
                    onChange={(val) => setTableAttributes({ cellSpacing: val })}
                    onDeselect={() => setTableAttributes({ cellSpacing: {} })}
                />
                <ToolsPanelItem
                    panelId={clientId}
                    isShownByDefault={true}
                    resetAllFilter={() =>
                        setAttributes({ blockSpacing: undefined })
                    }
                    className={"tools-panel-item-spacing"}
                    label="Block SPacing"
                    hasValue={() => !!attributes.blockSpacing}
                >
                    <SpacingControlSingle
                        label="Block Spacing"
                        value={attributes.blockSpacing}
                        onChange={(blockSpacing) =>
                            setAttributes({ blockSpacing })
                        }
                    />
                </ToolsPanelItem>
            </InspectorControls>

            <InspectorControls group="border">
                {!IS_PRO && (
                    <>
                        <LockedControl
                            isEnhanced
                            inToolsPanel
                            selected="col-only-border"
                        >
                            <ToggleControl
                                label={__(
                                    "[PRO] Column Only Border",
                                    "tableberg",
                                )}
                                checked={false}
                                onChange={() => {}}
                            />
                        </LockedControl>
                        <LockedControl
                            isEnhanced
                            inToolsPanel
                            selected="row-only-border"
                        >
                            <ToggleControl
                                label={__(
                                    "[PRO] Row Only Border",
                                    "tableberg-pro",
                                )}
                                checked={false}
                                onChange={() => {}}
                            />
                        </LockedControl>
                    </>
                )}

                <ToolsPanelItem
                    panelId={clientId}
                    isShownByDefault={true}
                    resetAllFilter={() =>
                        setTableAttributes({
                            hideCellOutsideBorders: true,
                        })
                    }
                    hasValue={() => !tableAttributes.hideCellOutsideBorders}
                    label={__("Hide Cell Outside Borders", "tableberg")}
                    onDeselect={() => {
                        setTableAttributes({ hideCellOutsideBorders: true });
                    }}
                >
                    <div className="tableberg-tools-panel-item-margin"></div>
                    <ToggleControl
                        label={__("Hide Cell Outside Borders", "tableberg")}
                        checked={tableAttributes.hideCellOutsideBorders}
                        onChange={() =>
                            setTableAttributes({
                                hideCellOutsideBorders:
                                    !tableAttributes.hideCellOutsideBorders,
                            })
                        }
                    />
                </ToolsPanelItem>
                <BorderWithRadiusControl
                    isShownByDefault={false}
                    label={__("Table Border", "tableberg")}
                    value={tableAttributes.tableBorder}
                    onChange={(tableBorder: any) =>
                        setTableAttributes({ tableBorder })
                    }
                    radiusValue={tableAttributes.tableBorderRadius}
                    onRadiusChange={(tableBorderRadius: any) =>
                        setTableAttributes({ tableBorderRadius })
                    }
                    onDeselect={() =>
                        setTableAttributes({
                            tableBorder: {},
                        })
                    }
                />
                <BorderWithRadiusControl
                    isShownByDefault={false}
                    label="Inner Border"
                    value={tableAttributes.innerBorder}
                    onChange={(innerBorder: any) =>
                        setTableAttributes({ innerBorder })
                    }
                    radiusValue={tableAttributes.cellBorderRadius}
                    onRadiusChange={(val: any) =>
                        setTableAttributes({ cellBorderRadius: val })
                    }
                    onDeselect={() =>
                        setTableAttributes({
                            innerBorder: {
                                color: "#000000",
                                width: "1px",
                            },
                        })
                    }
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
                </BorderWithRadiusControl>
                {!IS_PRO && (
                    <>
                        <LockedBorderWithRadiusControl
                            label="[PRO] Row Border"
                            clientId={clientId}
                            selected="row-border"
                            selectedRadius="row-border-radius"
                        />
                        <LockedBorderWithRadiusControl
                            label="[PRO] Column Border"
                            clientId={clientId}
                            selected="col-border"
                            selectedRadius="col-border-radius"
                        />
                    </>
                )}
            </InspectorControls>
            {!!preview && (
                <ResponsiveControls
                    preview={preview}
                    attributes={tableAttributes}
                    setTableAttributes={setTableAttributes}
                />
            )}
            {!IS_PRO && (
                <InspectorControls>
                    <PanelBody title="[PRO] Table Sticky Row/Col">
                        <LockedControl isEnhanced selected="sticky-top-row">
                            <ToggleControl
                                checked={false}
                                label="Sticky Top Row"
                                onChange={() => {}}
                            />
                        </LockedControl>
                        <LockedControl isEnhanced selected="sticky-first-col">
                            <ToggleControl
                                checked={false}
                                label="Sticky First Col"
                                onChange={() => {}}
                            />
                        </LockedControl>
                    </PanelBody>
                    <PanelBody title="[PRO] Search">
                        <LockedControl isEnhanced selected="search">
                            <ToggleControl
                                checked={false}
                                label="Enable Search"
                                onChange={() => {}}
                            />
                        </LockedControl>
                    </PanelBody>
                </InspectorControls>
            )}
            <BlockControls>
                <ToolbarWithDropdown
                    icon={alignNone}
                    title="Align table"
                    value={tableAlignment}
                    onChange={(tableAlignment) => {
                        setTableAttributes({ tableAlignment });
                    }}
                    controlset="all"
                />
            </BlockControls>
        </>
    );
}
export default TablebergControls;
