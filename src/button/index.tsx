import classnames from "classnames";

import {
    BlockEditProps,
    BlockSaveProps,
    registerBlockType,
} from "@wordpress/blocks";
import { prependHTTP } from "@wordpress/url";
import { useMergeRefs } from "@wordpress/compose";

import {
    Button,
    ButtonGroup,
    PanelBody,
    Popover,
    TextControl,
    ToolbarButton,
    __experimentalToolsPanel as ToolsPanel,
    CheckboxControl,
} from "@wordpress/components";

import metadata from "./block.json";
import {
    AlignmentControl,
    RichText,
    useBlockProps,
    InspectorControls,
    __experimentalUseBorderProps as useBorderProps,
    // @ts-ignore
    __experimentalLinkControl as LinkControl,
    BlockControls,
    BlockAlignmentToolbar,
} from "@wordpress/block-editor";
import { MouseEvent, useEffect, useMemo, useRef, useState } from "react";

import "./style.scss";
import { link, linkOff } from "@wordpress/icons";
import { ColorSettings, ColorSettingsWithGradient } from "../components";
import { __ } from "@wordpress/i18n";
import { getStyleClass } from "./get-classes";
import { ButtonBlockTypes } from "./type";
import { getStyles } from "./get-styles";

const ALL_REL = ["sponsored", "nofollow", "noreferrer", "noopener"];
const NEW_TAB_REL = "noreferrer noopener";

function edit({
    attributes,
    setAttributes,
    isSelected,
}: BlockEditProps<ButtonBlockTypes>) {
    function WidthPanel({
        selectedWidth,
        setAttributes,
    }: {
        selectedWidth: number | undefined;
        setAttributes: (attrs: Partial<ButtonBlockTypes>) => void;
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

    const { text, align, width, textAlign, id, url, rel, linkTarget } =
        attributes;
    const ref = useRef();
    const richTextRef = useRef<HTMLDivElement>();
    const isURLSet = !!url;
    const opensInNewTab = linkTarget === "_blank";
    const borderProps = useBorderProps(attributes);

    const [isEditingURL, setIsEditingURL] = useState(false);
    const [popoverAnchor, setPopoverAnchor] = useState(null);

    const blockProps = useBlockProps({
        ref: useMergeRefs([setPopoverAnchor, ref]),
        className: getStyleClass(attributes),
        style: getStyles(attributes),
    });

    const blockAlignChange = (newValue: "left" | "right" | "center") => {
        setAttributes({ align: newValue });
    };

    const onToggleOpenInNewTab = (value: boolean) => {
        const newLinkTarget = value ? "_blank" : undefined;

        if (newLinkTarget && !rel) {
            handleRelChange(NEW_TAB_REL);
        }

        setAttributes({
            linkTarget: newLinkTarget,
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

    const handleRelChange = (relOpt: string, state = true) => {
        if (state && rel === undefined) {
            setAttributes({ rel: relOpt });
            return;
        }

        if (state && rel?.includes(relOpt)) {
            return;
        }

        if (state) {
            setAttributes({ rel: rel + ` ${relOpt}` });
            return;
        }

        if (rel?.includes(relOpt)) {
            setAttributes({ rel: rel.replace(relOpt, "").trim() });
            return;
        }
    };

    return (
        <>
            <div
                {...blockProps}
                className={classnames(blockProps.className, {
                    [`has-custom-width wp-block-button__width-${width}`]: width,
                    [`has-custom-font-size`]: blockProps.style.fontSize,
                    [`block-align-${align}`]: align,
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
                    withoutInteractiveFormatting
                    identifier="text"
                    style={{ ...borderProps.style }}
                />
            </div>

            <BlockControls group="block">
                <BlockAlignmentToolbar
                    value={align}
                    onChange={blockAlignChange}
                    controls={["left", "center", "right"]}
                />
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

            <InspectorControls group="color">
                <ColorSettings
                    attrKey="textColor"
                    label={__("Text", "tableberg")}
                />
                <ColorSettings
                    attrKey="textHoverColor"
                    label={__("Hover Text", "tableberg")}
                />
                <ColorSettingsWithGradient
                    label={__("Background Color", "tableberg")}
                    attrBackgroundKey="backgroundColor"
                    attrGradientKey="backgroundGradient"
                />
                <ColorSettingsWithGradient
                    label={__("Hover Background Color", "tableberg")}
                    attrBackgroundKey="backgroundHoverColor"
                    attrGradientKey="backgroundHoverGradient"
                />
            </InspectorControls>
            <InspectorControls>
                <WidthPanel
                    selectedWidth={width}
                    setAttributes={setAttributes}
                />
            </InspectorControls>

            <InspectorControls group="advanced">
                <TextControl
                    label="HTML ID"
                    onChange={(value: string) => {
                        setAttributes({ id: value });
                    }}
                    value={id}
                />
            </InspectorControls>
            {isURLSet && (
                <InspectorControls>
                    <PanelBody title="Link rel">
                        {ALL_REL.map((relOpt) => (
                            <>
                                <CheckboxControl
                                    onChange={(val) =>
                                        handleRelChange(relOpt, val)
                                    }
                                    label={relOpt}
                                    checked={rel?.includes(relOpt)}
                                />
                            </>
                        ))}
                    </PanelBody>
                </InspectorControls>
            )}
        </>
    );
}

registerBlockType(metadata.name, {
    title: metadata.title,
    category: metadata.category,
    attributes: {
        text: {
            type: "string",
        },
        align: {
            type: "string",
        },
        width: {
            type: "number",
        },
        backgroundGradient: {
            type: "string",
        },
        backgroundHoverGradient: {
            type: "string",
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
});
