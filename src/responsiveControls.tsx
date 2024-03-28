import { InspectorControls } from "@wordpress/block-editor";
import { Breakpoint, TablebergBlockAttrs, ResponsiveOptions } from "./types";
import { BaseControl, PanelBody, ToggleControl, __experimentalNumberControl as NumberControl, SelectControl } from "@wordpress/components";
import { useDispatch } from "@wordpress/data";
import { __ } from "@wordpress/i18n";

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

    const editorActions = useDispatch("core/editor");
    const siteEditorActions = useDispatch("core/edit-site");
    const postEditorActions = useDispatch("core/edit-post");

    return <InspectorControls group="settings">
        <PanelBody title="Responsiveness Settings" initialOpen={true}>
            <BaseControl __nextHasNoMarginBottom>
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
                        if (editorActions?.setDeviceType) {
                            editorActions.setDeviceType(previewMode);
                        } else if (siteEditorActions?.__experimentalSetPreviewDeviceType) {
                            siteEditorActions.__experimentalSetPreviewDeviceType(previewMode);
                        } else if (postEditorActions?.__experimentalSetPreviewDeviceType) {
                            postEditorActions.__experimentalSetPreviewDeviceType(previewMode);
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
                        setTableAttributes({
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
}
