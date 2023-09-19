import classnames from "classnames";

import {
    BlockEditProps,
    BlockSaveProps,
    registerBlockType,
} from "@wordpress/blocks";
// @ts-ignore
import { prependHTTP } from "@wordpress/url";
// @ts-ignore
import { useMergeRefs } from "@wordpress/compose";

import {
    Button,
    ButtonGroup,
    PanelBody,
    Popover,
    TextControl,
    ToolbarButton,
    __experimentalToolsPanel as ToolsPanel,
} from "@wordpress/components";

import metadata from "./block.json";
import {
    // @ts-ignore
    AlignmentControl,
    RichText,
    useBlockProps,
    InspectorControls,
    // @ts-ignore
    __experimentalColorGradientSettingsDropdown as ColorGradientSettingsDropdown,
    // @ts-ignore
    __experimentalUseMultipleOriginColorsAndGradients as useMultipleOriginColorsAndGradients,
    // @ts-ignore
    __experimentalUseBorderProps as useBorderProps,
    // @ts-ignore
    __experimentalLinkControl as LinkControl,
    BlockControls,
} from "@wordpress/block-editor";
import { MouseEvent, useEffect, useMemo, useRef, useState } from "react";

import "./style.scss";
import { link, linkOff } from "@wordpress/icons";

interface ButtonElementBlockAttrs {
    text: string;
    width: number | undefined;
    backgroundColor: string;
    textColor: string;
    backgroundHoverColor: string | undefined;
    textHoverColor: string | undefined;
    textAlign: string;
    id: string;
    url: string | undefined;
    linkTarget: "_blank" | undefined;
    rel: string | undefined;
}

const NEW_TAB_REL = "noreferrer noopener";

function edit({
    attributes,
    setAttributes,
    isSelected,
}: BlockEditProps<ButtonElementBlockAttrs>) {
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

    const { text, width, textAlign, id, url, rel, linkTarget } = attributes;
    const ref = useRef();
    const richTextRef = useRef<HTMLDivElement>();
    const isURLSet = !!url;
    const opensInNewTab = linkTarget === "_blank";
    const borderProps = useBorderProps(attributes);

    const [isEditingURL, setIsEditingURL] = useState(false);
    const [popoverAnchor, setPopoverAnchor] = useState(null);

    const blockProps = useBlockProps({
        ref: useMergeRefs([setPopoverAnchor, ref]),
    });

    const onToggleOpenInNewTab = (value: boolean) => {
        const newLinkTarget = value ? "_blank" : undefined;

        let updatedRel = rel;
        if (newLinkTarget && !rel) {
            updatedRel = NEW_TAB_REL;
        } else if (!newLinkTarget && rel === NEW_TAB_REL) {
            updatedRel = undefined;
        }

        setAttributes({
            linkTarget: newLinkTarget,
            rel: updatedRel,
        });
    };

    const startEditing = (event: MouseEvent) => {
        event.preventDefault();
        setIsEditingURL(true);
    };

    const unlink = () => {
        setAttributes({
            url: undefined,
            linkTarget: undefined,
            rel: undefined,
        });
        setIsEditingURL(false);
    };

    useEffect(() => {
        if (!isSelected) {
            setIsEditingURL(false);
        }
    }, [isSelected]);

    // Memoize link value to avoid overriding the LinkControl's internal state.
    // This is a temporary fix. See https://github.com/WordPress/gutenberg/issues/51256.
    const linkValue = useMemo(
        () => ({ url, opensInNewTab }),
        [url, opensInNewTab]
    );

    return (
        <>
            <div
                {...blockProps}
                className={classnames(blockProps.className, {
                    [`has-custom-width wp-block-button__width-${width}`]: width,
                    [`has-custom-font-size`]: blockProps.style.fontSize,
                })}
                id={id}
            >
                <RichText
                    // @ts-ignore
                    ref={richTextRef}
                    className={classnames(
                        "wp-block-button__link",
                        "wp-element-button",
                        borderProps.className,
                        {
                            [`has-text-align-${textAlign}`]: textAlign,
                        }
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
            {/* @ts-ignore */}
            <BlockControls group="block">
                <AlignmentControl
                    value={textAlign}
                    onChange={(nextAlign: string) => {
                        setAttributes({ textAlign: nextAlign });
                    }}
                />
                <ToolbarButton
                    icon={isURLSet ? linkOff : link}
                    title={isURLSet ? "Unlink" : "Link"}
                    onClick={isURLSet ? unlink : startEditing}
                    isActive={isURLSet}
                />
                {isSelected && (isEditingURL || isURLSet) && (
                    <Popover
                        placement="bottom"
                        onClose={() => {
                            setIsEditingURL(false);
                            richTextRef.current?.focus();
                        }}
                        anchor={popoverAnchor}
                        focusOnMount={isEditingURL ? "firstElement" : false}
                        __unstableSlotName={"__unstable-block-tools-after"}
                        shift
                    >
                        <LinkControl
                            value={linkValue}
                            onChange={({
                                url: newURL = "",
                                opensInNewTab: newOpensInNewTab,
                            }: {
                                url: string;
                                opensInNewTab: boolean;
                            }) => {
                                setAttributes({ url: prependHTTP(newURL) });

                                if (opensInNewTab !== newOpensInNewTab) {
                                    onToggleOpenInNewTab(newOpensInNewTab);
                                }
                            }}
                            onRemove={() => {
                                unlink();
                                richTextRef.current?.focus();
                            }}
                            forceIsEditingLink={isEditingURL}
                        />
                    </Popover>
                )}
            </BlockControls>
            {/* @ts-ignore */}
            <InspectorControls group="styles">
                <ColorsPanel />
            </InspectorControls>
            <InspectorControls>
                <WidthPanel
                    selectedWidth={width}
                    setAttributes={setAttributes}
                />
            </InspectorControls>
            {/* @ts-ignore */}
            <InspectorControls group="advanced">
                <TextControl
                    label="HTML ID"
                    onChange={(value: string) => {
                        setAttributes({ id: value });
                    }}
                    value={id}
                />
            </InspectorControls>
            {/* @ts-ignore */}
            <InspectorControls group="advanced">
                <TextControl
                    __nextHasNoMarginBottom
                    label={"Link rel"}
                    value={rel || ""}
                    onChange={(newRel) => setAttributes({ rel: newRel })}
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
        textAlign: {
            type: "string",
        },
        id: {
            type: "string",
        },
        url: {
            type: "string",
        },
        linkTarget: {
            type: "string",
        },
        rel: {
            type: "string",
        },
    },
    example: {},
    edit,
    save,
});
