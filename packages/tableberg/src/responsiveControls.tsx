import { InspectorControls } from "@wordpress/block-editor";
import { Breakpoint, TablebergBlockAttrs, ResponsiveOptions } from "./types";
import { BaseControl, PanelBody, ToggleControl, __experimentalNumberControl as NumberControl, SelectControl, Button, ButtonGroup } from "@wordpress/components";
import { useDispatch } from "@wordpress/data";
import { __ } from "@wordpress/i18n";
import { desktop, mobile, tablet } from "@wordpress/icons";

export const ResponsiveControls = ({ preview, attributes, setTableAttributes }: {
    preview: keyof ResponsiveOptions["breakpoints"];
    attributes: TablebergBlockAttrs,
    setTableAttributes: (attributes: Record<string, any>) => void
}) => {
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
            direction: "col",
            stackCount: 1,
        },
        tablet: {
            enabled: false,
            headerAsCol: true,
            maxWidth: 1024,
            mode: "",
            direction: "col",
            stackCount: 3,
        },
    } as const;

    const isDisabled = !attributes.responsive?.breakpoints?.[preview]?.enabled;
    const breakpoint =
        attributes.responsive?.breakpoints?.[preview] ||
        DEFAULT_BREAKPOINT_OPTIONS[preview];

    const setResponsive = (options: Partial<Breakpoint>) => {
        setTableAttributes({
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

    const editorActions = useDispatch("core/editor");
    const siteEditorActions = useDispatch("core/edit-site");
    const postEditorActions = useDispatch("core/edit-post");

    return <InspectorControls group="settings">
        <PanelBody title="Responsiveness Settings" initialOpen={true}>
            <BaseControl __nextHasNoMarginBottom>
                <ButtonGroup
                    className="tableberg-responsiveness-device-switcher-container"
                >
                    {[
                        { label: "Desktop", value: "desktop", icon: desktop },
                        { label: "Tablet", value: "tablet", icon: tablet },
                        { label: "Mobile", value: "mobile", icon: mobile },
                    ].map(({ label, value, icon }) => {
                        return <Button
                            isPressed={preview === value}
                            icon={icon}
                            className="tableberg-responsiveness-device-switcher"
                            onClick={() => {
                                // prettier-ignore
                                if (editorActions?.setDeviceType) {
                                    editorActions.setDeviceType(label);
                                } else if (siteEditorActions?.__experimentalSetPreviewDeviceType) {
                                    siteEditorActions.__experimentalSetPreviewDeviceType(label);
                                } else if (postEditorActions?.__experimentalSetPreviewDeviceType) {
                                    postEditorActions.__experimentalSetPreviewDeviceType(label);
                                }
                            }}
                        >
                            {label}
                        </Button>
                    })}
                </ButtonGroup>

                {preview === "desktop" ? (<>
                    <div>This is how the table looks on desktop.</div>
                    <div>Click on "Tablet" or "Mobile" to customize how the table looks on those devices.</div>
                </>) : (
                    <>
                        <ToggleControl
                            label={__("Enable responsive rule", "tableberg")}
                            checked={breakpoint?.enabled}
                            onChange={() =>
                                setResponsive({
                                    enabled: !breakpoint?.enabled,
                                })
                            }
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
                            help="The columns will be stacked when browser window width is less than this width"
                            disabled={isDisabled}
                        />
                        <SelectControl
                            label="Mode"
                            value={breakpoint?.mode || "scroll"}
                            options={[
                                { label: "Scroll", value: "scroll" },
                                { label: "Stack", value: "stack" },
                            ]}
                            onChange={(mode: any) =>
                                setResponsive({
                                    mode,
                                })
                            }
                            disabled={isDisabled}
                            __nextHasNoMarginBottom
                            help={
                                breakpoint?.mode === "scroll" ?
                                    "Makes the table horizontally scrollable" :
                                    "Breaks the table by columns and stacks the columns"
                            }
                        />
                        {breakpoint?.mode === "stack" && (
                            <>
                                <ToggleControl
                                    label={__(
                                        "Transform rows to columns",
                                        "tableberg"
                                    )}
                                    checked={breakpoint?.direction === "row"}
                                    onChange={(checked) =>
                                        setResponsive({
                                            direction: checked ? "row" : "col",
                                        })
                                    }
                                    disabled={isDisabled}
                                />
                                <ToggleControl
                                    label={__(
                                        "Show first column in every stack row",
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
                                    help={breakpoint?.direction === "row" &&
                                        <span>First column of the transformed table</span>}
                                />
                                <NumberControl
                                    label={__("Items per stack row", "tableberg")}
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
                    </>
                )}
            </BaseControl>
        </PanelBody>
    </InspectorControls>
}
