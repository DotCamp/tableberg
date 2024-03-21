import { InspectorControls } from "@wordpress/block-editor";
import { Breakpoint, TablebergBlockAttrs, ResponsiveOptions } from "./types";
import { BaseControl, Notice, PanelBody, ToggleControl, __experimentalNumberControl as NumberControl, SelectControl } from "@wordpress/components";
import { __ } from "@wordpress/i18n";

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

export const ResponsiveControls = ({ preview, attributes, setTableAttributes }: {
    preview: keyof ResponsiveOptions["breakpoints"];
    attributes: TablebergBlockAttrs,
    setTableAttributes: (attributes: Record<string, any>) => void
}) => {
    const isDisabled = preview === "desktop";
    const breakpoint =
        attributes.responsive?.breakpoints?.[preview] ||
        DEFAULT_BREAKPOINT_OPTIONS[preview];

    const setResponsive = (options: Partial<Breakpoint>) => {
        if (isDisabled) {
            return;
        }
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

    return <InspectorControls group="settings">
                <PanelBody
                    title={`Responsiveness Settings [${preview.toUpperCase()}]`}
                    initialOpen={true}
                >
                    <BaseControl __nextHasNoMarginBottom>
                        <Notice className="add-margin-bottom" isDismissible={false}>
                            Use the block editor preview modes to configure and
                            preview the table at different breakpoints
                        </Notice>
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
}
