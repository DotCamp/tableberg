import classnames from "classnames";

import { BlockEditProps, registerBlockType } from "@wordpress/blocks";
import { prependHTTP } from "@wordpress/url";
import { useMergeRefs } from "@wordpress/compose";

import {
    Button,
    ButtonGroup,
    PanelBody,
    Popover,
    TextControl,
    ToolbarButton,
    CheckboxControl,
} from "@wordpress/components";

import metadata from "./block.json";
import {
    AlignmentControl,
    RichText,
    useBlockProps,
    InspectorControls,
    __experimentalUseBorderProps as useBorderProps,
    __experimentalLinkControl as LinkControl,
    BlockControls,
} from "@wordpress/block-editor";
import {
    MouseEvent,
    RefObject,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import "./style.scss";
import { alignNone, link, linkOff } from "@wordpress/icons";
import {
    ColorControl,
    SpacingControl,
    ToolbarWithDropdown,
} from "@tableberg/components";
import { __ } from "@wordpress/i18n";

import buttonBlockIcon from "@tableberg/shared/icons/button";

import { getStyleClass } from "./get-classes";
import { ButtonBlockTypes } from "./type";
import { getStyles, getInnerStyles } from "./get-styles";

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
    const richTextRef = useRef<HTMLDivElement>(null);
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

    const innerStyle = getInnerStyles(attributes);

    const blockAlignChange = (newValue: string | undefined) => {
        setAttributes({
            align: newValue as "left" | "center" | "right" | undefined,
        });
    };

    const onToggleOpenInNewTab = (value: boolean | undefined) => {
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
        [url, opensInNewTab],
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
                    ref={richTextRef as unknown as RefObject<"div">}
                    className={classnames(
                        "wp-block-button__link",
                        "wp-element-button",
                        borderProps.className,
                        {
                            [`has-text-align-${textAlign}`]: textAlign,
                        },
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
                    style={{ ...borderProps.style, ...innerStyle }}
                />
            </div>

            <BlockControls group="block">
                <ToolbarWithDropdown
                    icon={alignNone}
                    title="Align button"
                    value={align}
                    onChange={blockAlignChange}
                    controlset="alignment"
                />
                <AlignmentControl
                    value={textAlign}
                    onChange={(nextAlign: string) => {
                        setAttributes({ textAlign: nextAlign });
                    }}
                />
                {
                    // @ts-ignore
                    <ToolbarButton
                        icon={isURLSet ? linkOff : link}
                        title={isURLSet ? "Unlink" : "Link"}
                        onClick={isURLSet ? unlink : startEditing}
                        isActive={isURLSet}
                    />
                }
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
                <ColorControl
                    label={__("Text", "tableberg")}
                    colorValue={attributes.textColor}
                    onColorChange={(newValue) =>
                        setAttributes({ textColor: newValue })
                    }
                    onDeselect={() =>
                        setAttributes({
                            textColor: undefined,
                        })
                    }
                />
                <ColorControl
                    label={__("Hover Text", "tableberg")}
                    colorValue={attributes.textHoverColor}
                    onColorChange={(newValue) =>
                        setAttributes({ textHoverColor: newValue })
                    }
                    onDeselect={() =>
                        setAttributes({
                            textHoverColor: undefined,
                        })
                    }
                />
                <ColorControl
                    label={__("Background Color", "tableberg")}
                    colorValue={attributes.backgroundColor}
                    gradientValue={attributes.backgroundGradient}
                    onColorChange={(newValue) =>
                        setAttributes({ backgroundColor: newValue })
                    }
                    allowGradient
                    onGradientChange={(newValue) =>
                        setAttributes({ backgroundGradient: newValue })
                    }
                    onDeselect={() =>
                        setAttributes({
                            backgroundColor: undefined,
                            backgroundGradient: undefined,
                        })
                    }
                />
                <ColorControl
                    label={__("Hover Background Color", "tableberg")}
                    colorValue={attributes.backgroundHoverColor}
                    gradientValue={attributes.backgroundHoverGradient}
                    onColorChange={(newValue) =>
                        setAttributes({ backgroundHoverColor: newValue })
                    }
                    allowGradient
                    onGradientChange={(newValue) =>
                        setAttributes({ backgroundHoverGradient: newValue })
                    }
                    onDeselect={() =>
                        setAttributes({
                            backgroundHoverColor: undefined,
                            backgroundHoverGradient: undefined,
                        })
                    }
                />
            </InspectorControls>
            <InspectorControls>
                <WidthPanel
                    selectedWidth={width}
                    setAttributes={setAttributes}
                />
            </InspectorControls>

            <InspectorControls group="dimensions">
                <SpacingControl
                    value={attributes.padding}
                    label={__("Padding", "tableberg")}
                    onChange={(val) => setAttributes({ padding: val })}
                    sides={["horizontal", "vertical"]}
                    onDeselect={() => setAttributes({ padding: {} })}
                    isShownByDefault
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

// @ts-ignore
registerBlockType(metadata.name, {
    title: metadata.title,
    category: metadata.category,
    attributes: metadata.attributes,
    icon: buttonBlockIcon,
    edit,
});
