import { __ } from "@wordpress/i18n";
import metadata from "./block.json";
import { BlockEditProps, registerBlockType } from "@wordpress/blocks";
import {
    BlockControls,
    HeightControl,
    InspectorControls,
    useBlockProps,
    // @ts-ignore
    JustifyContentControl,
    __experimentalLinkControl as LinkControl,
} from "@wordpress/block-editor";
import {
    getSpacingStyle,
    getBorderCSS,
    getBorderRadiusCSS,
    StyleAttr,
} from "../../utils/styling-helpers";
import { isEmpty, isUndefined, omitBy, trim } from "lodash";
import {
    PanelBody,
    Popover,
    RangeControl,
    SelectControl,
    TabPanel,
    TextControl,
    ToolbarButton,
    ToolbarGroup,
} from "@wordpress/components";
import {
    BorderControl,
    BorderRadiusControl,
    ColorControl,
    SpacingControl,
} from "@tableberg/components";
import classNames from "classnames";
import { Icon, IconPickerMini } from "@tableberg/components/icon-library";
import { useState } from "react";
import { link } from "@wordpress/icons";

interface IconAttrs {
    icon: any;
    size: string;
    behavior: "paragraph" | "char";
    linkUrl: string;
    linkTarget: string;
    rotation: number;
    justify: "center" | "left" | "right";
    color: string;
    colorHover: string;
    background: string;
    backgroundHover: string;
    bgGradient: string;
    bgGradientHover?: string;
    padding: any;
    margin: any;
    border: any;
    borderRadius: any;
}

const getStyle = (attrs: IconAttrs) => {
    const style: StyleAttr = {
        justifyContent: attrs.justify,
        background: attrs.bgGradient || attrs.background,
        ...getSpacingStyle(attrs.padding, "padding"),
        ...getSpacingStyle(attrs.margin, "margin"),
        ...getBorderCSS(attrs.border),
        ...getBorderRadiusCSS(attrs.borderRadius),
        // @ts-ignore
        "--tableberg-icon-color-hover": attrs.colorHover || attrs.color,
        // @ts-ignore
        "--tableberg-icon-bg-hover":
            attrs.bgGradientHover ||
            attrs.backgroundHover ||
            attrs.bgGradient ||
            attrs.background,
    };

    if (attrs.rotation) {
        style.transform = `rotate(${attrs.rotation}deg)`;
    }

    return omitBy(
        style,
        (value: any) =>
            value === false ||
            isEmpty(value) ||
            isUndefined(value) ||
            trim(value) === "" ||
            trim(value) === "undefined undefined undefined",
    );
};

function edit({ attributes, setAttributes }: BlockEditProps<IconAttrs>) {
    const { size, linkUrl, linkTarget } = attributes;
    const [iconMode, setIconMode] = useState(
        attributes.icon?.type === "url" ? "url" : "icon",
    );

    const [isUrlEditing, setUrlEditingMode] = useState(false);

    const blockProps = useBlockProps({
        style: getStyle(attributes),
        className: classNames({
            "tableberg-icon": true,
            "tableberg-icon-as-char": attributes.behavior === "char",
        }),
    });

    const colorControl: any = [
        {
            name: "normal",
            title: __("Normal", "tableberg-pro"),
            component: (
                <>
                    <ColorControl
                        label={__("Icon Color", "tableberg-pro")}
                        colorValue={attributes.color}
                        onColorChange={(color) => setAttributes({ color })}
                        onDeselect={() =>
                            setAttributes({
                                // @ts-ignore
                                color: metadata.attributes.color.default,
                            })
                        }
                    />
                    <ColorControl
                        allowGradient={true}
                        label={__("Background Color", "tableberg-pro")}
                        colorValue={attributes.background}
                        onColorChange={(background) =>
                            setAttributes({ background })
                        }
                        gradientValue={attributes.bgGradient}
                        onGradientChange={(bgGradient) =>
                            setAttributes({ bgGradient })
                        }
                        onDeselect={() =>
                            setAttributes({
                                // @ts-ignore
                                background:
                                    metadata.attributes.background.default,
                                // @ts-ignore
                                bgGradient:
                                    metadata.attributes.bgGradient.default,
                            })
                        }
                    />
                </>
            ),
        },
        {
            name: "hover",
            title: __("Hover", "tableberg-pro"),
            component: (
                <>
                    <ColorControl
                        label={__("Icon Color", "tableberg-pro")}
                        colorValue={attributes.colorHover}
                        onColorChange={(colorHover) =>
                            setAttributes({ colorHover })
                        }
                        onDeselect={() =>
                            setAttributes({
                                // @ts-ignore
                                colorHover:
                                    metadata.attributes.colorHover.default,
                            })
                        }
                    />
                    <ColorControl
                        allowGradient={true}
                        label={__("Background Color", "tableberg-pro")}
                        colorValue={attributes.backgroundHover}
                        onColorChange={(backgroundHover) =>
                            setAttributes({ backgroundHover })
                        }
                        gradientValue={attributes.bgGradientHover}
                        onGradientChange={(bgGradientHover) =>
                            setAttributes({ bgGradientHover })
                        }
                        onDeselect={() =>
                            setAttributes({
                                // @ts-ignore
                                backgroundHover:
                                    metadata.attributes.backgroundHover.default,
                                // @ts-ignore
                                bgGradientHover:
                                    metadata.attributes.bgGradientHover.default,
                            })
                        }
                    />
                </>
            ),
        },
    ];

    const icon = attributes.icon || metadata.attributes.icon.default;

    return (
        <>
            <div {...blockProps}>
                {icon.type !== "url" ? (
                    <Icon
                        icon={icon}
                        size={size}
                        style={{ fill: attributes.color }}
                    />
                ) : (
                    <img
                        src={icon.url}
                        style={{
                            height: size,
                            width: size,
                        }}
                    />
                )}
            </div>
            <BlockControls>
                <ToolbarGroup>
                    <JustifyContentControl
                        value={attributes.justify}
                        allowedControls={["left", "center", "right"]}
                        onChange={(justify: any) => {
                            setAttributes({ justify });
                        }}
                    />
                </ToolbarGroup>
                <ToolbarGroup>
                    <ToolbarButton
                        icon={link}
                        title={__("Link", "tableberg-pro")}
                        onClick={() => setUrlEditingMode(true)}
                        isActive={!!linkUrl}
                        placeholder={undefined}
                        onPointerEnterCapture={undefined}
                        onPointerLeaveCapture={undefined}
                    />
                </ToolbarGroup>
            </BlockControls>
            <InspectorControls>
                <PanelBody>
                    <SelectControl
                        label={__("Behave As", "tableberg-pro")}
                        value={attributes.behavior}
                        options={[
                            { value: "paragraph", label: "Paragraph" },
                            { value: "char", label: "Character" },
                        ]}
                        onChange={(behavior: any) =>
                            setAttributes({ behavior })
                        }
                    />
                    <HeightControl
                        value={attributes.size}
                        label={__("Icon Size", "tableberg-pro")}
                        onChange={(newSize) => setAttributes({ size: newSize })}
                    />
                    <RangeControl
                        max={180}
                        min={-180}
                        allowReset
                        resetFallbackValue={0}
                        value={attributes.rotation}
                        defaultValue={0}
                        label={__("Rotation", "tableberg-pro")}
                        onChange={(rotation) => setAttributes({ rotation })}
                    />
                </PanelBody>
                <PanelBody title="Icon" initialOpen>
                    <SelectControl
                        label={__("Icon type", "tableberg-pro")}
                        options={[
                            {
                                value: "icon",
                                label: "Icon",
                            },
                            {
                                value: "url",
                                label: "URL",
                            },
                        ]}
                        value={iconMode}
                        onChange={(mode) => setIconMode(mode)}
                    />
                    {iconMode === "icon" ? (
                        <IconPickerMini
                            onSelect={(icon) => setAttributes({ icon })}
                            maxHeight="180px"
                        />
                    ) : (
                        <TextControl
                            label={__("Icon Url", "tableberg-pro")}
                            value={attributes.icon?.url}
                            onChange={(url) =>
                                setAttributes({
                                    icon: {
                                        type: "url",
                                        url: encodeURI(url),
                                    },
                                })
                            }
                        />
                    )}
                </PanelBody>
            </InspectorControls>
            <InspectorControls group="color">
                <div style={{ marginTop: "0", gridColumn: "1/-1" }}>
                    <TabPanel tabs={colorControl}>
                        {(tab) => tab.component}
                    </TabPanel>
                </div>
            </InspectorControls>
            <InspectorControls group="border">
                <BorderControl
                    label={__("Border", "tableberg-pro")}
                    value={attributes.border}
                    onChange={(border) => setAttributes({ border })}
                    onDeselect={() => setAttributes({ border: {} })}
                />
                <BorderRadiusControl
                    label={__("Border Radius", "tableberg-pro")}
                    value={attributes.borderRadius}
                    onChange={(borderRadius) => setAttributes({ borderRadius })}
                    onDeselect={() => setAttributes({ borderRadius: {} })}
                />
            </InspectorControls>
            <InspectorControls group="dimensions">
                <SpacingControl
                    label={__("Padding", "tableberg-pro")}
                    value={attributes.padding}
                    onChange={(padding) => setAttributes({ padding })}
                    onDeselect={() => setAttributes({ padding: {} })}
                />
                <SpacingControl
                    label={__("Margin", "tableberg-pro")}
                    value={attributes.margin}
                    onChange={(margin) => setAttributes({ margin })}
                    onDeselect={() => setAttributes({ margin: {} })}
                />
            </InspectorControls>

            {isUrlEditing && (
                <Popover
                    position="bottom center"
                    onClose={() => {
                        setUrlEditingMode(false);
                    }}
                    focusOnMount={isUrlEditing ? "firstElement" : false}
                >
                    <LinkControl
                        value={{
                            url: linkUrl,
                            opensInNewTab: linkTarget === "_blank",
                        }}
                        onChange={({ url = "", opensInNewTab }) => {
                            setAttributes({
                                linkUrl: url,
                                linkTarget: opensInNewTab ? "_blank" : "_self",
                            });
                        }}
                        onRemove={() => {
                            setAttributes({
                                // @ts-ignore
                                linkUrl: metadata.attributes.linkUrl.default,
                                linkTarget:
                                    //@ts-ignore
                                    metadata.attributes.linkTarget.default,
                            });
                        }}
                    />
                </Popover>
            )}
        </>
    );
}

registerBlockType(metadata as any, {
    attributes: metadata.attributes as any,
    edit,
});
