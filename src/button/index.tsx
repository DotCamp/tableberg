import classnames from "classnames";

import {
    BlockEditProps,
    BlockSaveProps,
    registerBlockType,
} from "@wordpress/blocks";

import {
    Button,
    ButtonGroup,
    PanelBody,
    __experimentalToolsPanel as ToolsPanel,
} from "@wordpress/components";

import metadata from "./block.json";
import {
    RichText,
    useBlockProps,
    InspectorControls,
    // @ts-ignore
    __experimentalColorGradientSettingsDropdown as ColorGradientSettingsDropdown,
    // @ts-ignore
    __experimentalUseMultipleOriginColorsAndGradients as useMultipleOriginColorsAndGradients,
    // @ts-ignore
    __experimentalUseBorderProps as useBorderProps,
} from "@wordpress/block-editor";
import { useEffect, useState } from "react";

import "./style.scss";

interface ButtonElementBlockAttrs {
    text: string;
    width: number | undefined;
    backgroundColor: string;
    textColor: string;
    backgroundHoverColor: string | undefined;
    textHoverColor: string | undefined;
}

function edit({
    attributes,
    setAttributes,
}: BlockEditProps<ButtonElementBlockAttrs>) {
    const blockProps = useBlockProps();

    function WidthPanel({
        selectedWidth,
        setAttributes,
    }: {
        selectedWidth: number | undefined;
        setAttributes: (attrs: Partial<ButtonElementBlockAttrs>) => void;
    }) {
        function handleChange(newWidth: number) {
            // Check if we are toggling the width off
            const width = selectedWidth === newWidth ? undefined : newWidth;

            // Update attributes.
            setAttributes({ width });
        }

        return (
            <PanelBody title={"Width settings"}>
                <ButtonGroup aria-label={"Button width"}>
                    {[25, 50, 75, 100].map((widthValue) => {
                        return (
                            <Button
                                key={widthValue}
                                isSmall
                                variant={
                                    widthValue === selectedWidth
                                        ? "primary"
                                        : undefined
                                }
                                onClick={() => handleChange(widthValue)}
                            >
                                {widthValue}%
                            </Button>
                        );
                    })}
                </ButtonGroup>
            </PanelBody>
        );
    }

    const [buttonStyle, setButtonStyle] = useState<{
        color?: string;
        backgroundColor?: string;
        "--text-hover-color"?: string;
        "--background-hover-color"?: string;
    }>({
        color: attributes.textColor,
        backgroundColor: attributes.backgroundColor,
        "--text-hover-color":
            attributes.textHoverColor ??
            attributes.textColor ??
            "var(--wp--preset--color--base)",
        "--background-hover-color":
            attributes.backgroundHoverColor ??
            attributes.backgroundColor ??
            "var(--wp--preset--color--primary)",
    });

    function ColorsPanel() {
        const resetAll = () => {
            setAttributes({ textColor: undefined, backgroundColor: undefined });
            setButtonStyle({
                ...buttonStyle,
                color: undefined,
                backgroundColor: undefined,
            });
        };

        const resetAllHover = () => {
            changeTextHoverColor(undefined);
            changeBackgroundHoverColor(undefined);
        };

        const changeTextColor = (val: string) => {
            setAttributes({ textColor: val });
            setButtonStyle({ ...buttonStyle, color: val });
        };

        const changeBackgroundColor = (val: string) => {
            setAttributes({ backgroundColor: val });
            setButtonStyle({ ...buttonStyle, backgroundColor: val });
        };

        const changeTextHoverColor = (val: string | undefined) => {
            setAttributes({ textHoverColor: val });
        };

        const changeBackgroundHoverColor = (val: string | undefined) => {
            setAttributes({ backgroundHoverColor: val });
        };

        const colorGradientSettings = useMultipleOriginColorsAndGradients();

        return (
            <>
                <ToolsPanel
                    label={"Color"}
                    resetAll={resetAll}
                    hasInnerWrapper
                    className="color-block-support-panel"
                    __experimentalFirstVisibleItemClass="first"
                    __experimentalLastVisibleItemClass="last"
                >
                    <div className="color-block-support-panel__inner-wrapper">
                        <ColorGradientSettingsDropdown
                            __experimentalIsRenderedInSidebar
                            settings={[
                                {
                                    colorValue: attributes.textColor,
                                    label: "Text",
                                    onColorChange: changeTextColor,
                                    clearable: true,
                                    resetAllFilter: () =>
                                        setAttributes({ textColor: undefined }),
                                },
                            ]}
                            {...colorGradientSettings}
                        />
                        <ColorGradientSettingsDropdown
                            __experimentalIsRenderedInSidebar
                            settings={[
                                {
                                    colorValue: attributes.backgroundColor,
                                    label: "Background",
                                    onColorChange: changeBackgroundColor,
                                    clearable: true,
                                    resetAllFilter: () =>
                                        setAttributes({
                                            backgroundColor: undefined,
                                        }),
                                },
                            ]}
                            {...colorGradientSettings}
                        />
                    </div>
                </ToolsPanel>
                <ToolsPanel
                    label={"Hover Color"}
                    resetAll={resetAllHover}
                    hasInnerWrapper
                    className="color-block-support-panel"
                    __experimentalFirstVisibleItemClass="first"
                    __experimentalLastVisibleItemClass="last"
                >
                    <div className="color-block-support-panel__inner-wrapper">
                        <ColorGradientSettingsDropdown
                            __experimentalIsRenderedInSidebar
                            settings={[
                                {
                                    colorValue: attributes.textHoverColor,
                                    label: "Text",
                                    onColorChange: changeTextHoverColor,
                                    clearable: true,
                                    resetAllFilter: () =>
                                        setAttributes({
                                            textHoverColor: undefined,
                                        }),
                                },
                            ]}
                            {...colorGradientSettings}
                        />
                        <ColorGradientSettingsDropdown
                            __experimentalIsRenderedInSidebar
                            settings={[
                                {
                                    colorValue: attributes.backgroundHoverColor,
                                    label: "Background",
                                    onColorChange: changeBackgroundHoverColor,
                                    clearable: true,
                                    resetAllFilter: () =>
                                        setAttributes({
                                            backgroundHoverColor: undefined,
                                        }),
                                },
                            ]}
                            {...colorGradientSettings}
                        />
                    </div>
                </ToolsPanel>
            </>
        );
    }

    useEffect(() => {
        setButtonStyle({
            ...buttonStyle,
            "--background-hover-color":
                attributes.backgroundHoverColor ??
                attributes.backgroundColor ??
                "var(--wp--preset--color--primary)",
        });
    }, [attributes.backgroundColor, attributes.backgroundHoverColor]);

    useEffect(() => {
        setButtonStyle({
            ...buttonStyle,
            "--text-hover-color":
                attributes.textHoverColor ??
                attributes.textColor ??
                "var(--wp--preset--color--base)",
        });
    }, [attributes.textColor, attributes.textHoverColor]);

    const { text, width } = attributes;
    const borderProps = useBorderProps(attributes);

    return (
        <>
            <div
                {...blockProps}
                className={classnames(blockProps.className, {
                    [`has-custom-width wp-block-button__width-${width}`]: width,
                    [`has-custom-font-size`]: blockProps.style.fontSize,
                })}
            >
                <RichText
                    className={classnames(
                        "wp-block-button__link",
                        "wp-element-button",
                        borderProps.className
                    )}
                    aria-label="Button text"
                    placeholder="Add text…"
                    value={text}
                    allowedFormats={["core/bold", "core/italic"]}
                    onChange={(value: string) =>
                        setAttributes({
                            text: value.replace(/<\/?a[^>]*>/g, ""),
                        })
                    }
                    // @ts-ignore
                    withoutInteractiveFormatting
                    identifier="text"
                    style={{ ...buttonStyle, ...borderProps.style }}
                />
            </div>
            <InspectorControls group="styles">
                <ColorsPanel />
            </InspectorControls>
            <InspectorControls key="setting">
                <WidthPanel
                    selectedWidth={width}
                    setAttributes={setAttributes}
                />
            </InspectorControls>
        </>
    );
}

function save({ attributes }: BlockSaveProps<ButtonElementBlockAttrs>) {
    const blockProps = useBlockProps.save();
    return (
        <div {...blockProps}>
            <RichText.Content
                tagName="a"
                className="wp-block-button__link wp-element-button"
                value={attributes.text}
            />
        </div>
    );
}

registerBlockType(metadata.name, {
    title: metadata.title,
    category: metadata.category,
    attributes: {
        text: {
            type: "string",
            source: "html",
            selector: "a",
        },
        width: {
            type: "number",
        },
        backgroundColor: {
            type: "string",
        },
        textColor: {
            type: "string",
        },
        backgroundHoverColor: {
            type: "string",
        },
        textHoverColor: {
            type: "string",
        },
    },
    example: {},
    edit,
    save,
});
