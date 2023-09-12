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
} from "@wordpress/block-editor";
import { useState } from "react";

import "./style.scss";

interface ButtonElementBlockAttrs {
    text: string;
    width: number | undefined;
    backgroundColor: string;
    textColor: string;
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
    }>({
        color: attributes.textColor,
        backgroundColor: attributes.backgroundColor,
    });

    function ColorsPanel() {
        const resetAll = () => {
            setAttributes({ textColor: undefined, backgroundColor: undefined });
            setButtonStyle({});
        };

        const changeTextColor = (val: string) => {
            setAttributes({ textColor: val });
            setButtonStyle({ ...buttonStyle, color: val });
        };

        const changeBackgroundColor = (val: string) => {
            setAttributes({ backgroundColor: val });
            setButtonStyle({ ...buttonStyle, backgroundColor: val });
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
            </>
        );
    }

    const { text, width } = attributes;

    return (
        <>
            <div
                {...blockProps}
                className={classnames(blockProps.className, {
                    [`has-custom-width wp-block-button__width-${width}`]: width,
                })}
            >
                <RichText
                    className={classnames(
                        "wp-block-button__link",
                        "wp-element-button"
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
                    style={{ ...buttonStyle }}
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
    },
    example: {},
    edit,
    save,
});
