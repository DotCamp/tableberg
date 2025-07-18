import { __ } from "@wordpress/i18n";
import { ColorControl } from "@tableberg/components";
import { FontSizePicker, InspectorControls } from "@wordpress/block-editor";
import { BlockEditProps, registerBlockType } from "@wordpress/blocks";
import {
    BaseControl,
    PanelBody,
    SelectControl,
    TextControl,
} from "@wordpress/components";

import metadata from "./block.json";

import Bookmark from "./ribbons/Bookmark";
import Corner from "./ribbons/Corner";
import Icon from "./ribbons/Icon";
import Side from "./ribbons/Side";
import Badge from "./ribbons/Badge";

import { SizeControlProps } from "@tableberg/components/editor/SizeControl";
import RibbonBlockIcon from "@tableberg/shared/icons/ribbon";

import exampleImage1 from "./preview-1.png";
import exampleImage2 from "./preview-2.png";
import exampleImage3 from "./preview-3.png";
import exampleImage4 from "./preview-4.png";
import { useState, useEffect } from "react";

export interface RibbonAttrs {
    type: "bookmark" | "corner" | "side" | "icon" | "badge";
    text: string;
    fontSize?: string;
    color?: string;
    background?: string;
    bgGradient?: string;
    individual: any;
    isExample: boolean;
}

export interface RibbonProps {
    attrs: RibbonAttrs;
    setAttributes: (attrs: Partial<RibbonAttrs>) => void;
    clientId: string;
}

export const RANGE_CONFIG_POSITION: SizeControlProps["rangeConfig"] = {
    px: { min: -100, max: 300, step: 1 },
    "%": { min: -20, max: 100, step: 1 },
    em: { min: -10, max: 50, step: 0.1 },
    rem: { min: -10, max: 50, step: 0.1 },
};
export const RANGE_CONFIG_SIZE: SizeControlProps["rangeConfig"] = {
    px: { max: 300, step: 1 },
};

const RIBBONS_MAP = {
    bookmark: Bookmark,
    corner: Corner,
    icon: Icon,
    side: Side,
    badge: Badge,
};

const DEFAULT_ATTRS: Record<string, Partial<RibbonAttrs>> = {
    bookmark: {
        type: "bookmark",
        individual: {
            x: "20px",
            y: "-3px",
            originX: "right",
            originY: "top",
            height: "70px",
            width: "100px",
        },
    },
    corner: {
        type: "corner",
        individual: {
            side: "left",
            distance: "50px",
        },
    },
    icon: {
        type: "icon",
        individual: {
            x: "20px",
            y: "-3px",
            originX: "right",
            originY: "top",
            icon: {
                iconName: "star",
                type: "font-awesome",
                icon: {
                    type: "svg",
                    props: {
                        xmlns: "http://www.w3.org/2000/svg",
                        viewBox: "0 0 576 512",
                        children: {
                            type: "path",
                            props: {
                                d: "M259.3 17.8L194 150.2 47.9 171.5c-26.2 3.8-36.7 36.1-17.7 54.6l105.7 103-25 145.5c-4.5 26.3 23.2 46 46.4 33.7L288 439.6l130.7 68.7c23.2 12.2 50.9-7.4 46.4-33.7l-25-145.5 105.7-103c19-18.5 8.5-50.8-17.7-54.6L382 150.2 316.7 17.8c-11.7-23.6-45.6-23.9-57.4 0z",
                            },
                        },
                    },
                },
            },
            size: "20px",
            shape: "up",
            padding: {
                top: "10px",
                right: "5px",
                bottom: "10px",
                left: "5px",
            },
        },
    },
    side: {
        type: "side",
        individual: {
            originY: "top",
            y: "10px",
            side: "left",
            padding: {
                top: "5px",
                right: "5px",
                bottom: "5px",
                left: "5px",
            },
            border: {
                width: "1px",
            },
        },
    },
    badge: {
        type: "badge",
        individual: {
            x: "-1px",
            y: "-3px",
            originX: "left",
            originY: "top",
        },
    },
};

function edit({
    attributes,
    setAttributes,
    clientId,
}: BlockEditProps<RibbonAttrs>) {
    // @ts-ignore
    const Ribbon = RIBBONS_MAP[attributes.type];

    const hasText = attributes.type !== "icon";

    if (attributes.isExample) {
        const previews = [
            exampleImage1,
            exampleImage2,
            exampleImage3,
            exampleImage4,
        ];

        const [counter, setCounter] = useState(0);
        useEffect(() => {
            const interval = setInterval(() => {
                setCounter(counter < 3 ? counter + 1 : 0);
            }, 1000);

            return () => {
                clearInterval(interval);
            };
        });

        return <img src={previews[counter]} style={{ maxWidth: "100%" }}></img>;
    }

    return (
        <>
            <InspectorControls group="settings">
                <PanelBody initialOpen>
                    <SelectControl
                        label={__("Ribbon Type", "tableberg-pro")}
                        value={attributes.type}
                        options={[
                            { label: "Bookmark", value: "bookmark" },
                            { label: "Corner", value: "corner" },
                            { label: "Side", value: "side" },
                            { label: "Icon", value: "icon" },
                            { label: "Badge", value: "badge" },
                        ]}
                        onChange={(type: string) =>
                            setAttributes(DEFAULT_ATTRS[type] || {})
                        }
                    />
                    {hasText && (
                        <TextControl
                            label={__("Ribbon Text", "tableberg-pro")}
                            value={attributes.text}
                            onChange={(text) => setAttributes({ text })}
                        />
                    )}
                </PanelBody>
            </InspectorControls>
            <Ribbon
                attrs={attributes}
                setAttributes={setAttributes}
                clientId={clientId}
            />
            <InspectorControls group="color">
                <ColorControl
                    label={__("Text Color", "tableberg-pro")}
                    colorValue={attributes.color}
                    onDeselect={() => setAttributes({ color: undefined })}
                    onColorChange={(color) => setAttributes({ color })}
                />
                <ColorControl
                    allowGradient
                    label={__("Background", "tableberg-pro")}
                    colorValue={attributes.background}
                    onDeselect={() =>
                        setAttributes({
                            background: undefined,
                            bgGradient: undefined,
                        })
                    }
                    onColorChange={(background) =>
                        setAttributes({ background })
                    }
                    gradientValue={attributes.bgGradient}
                    onGradientChange={(bgGradient) =>
                        setAttributes({ bgGradient })
                    }
                />
            </InspectorControls>
            {hasText && (
                <InspectorControls>
                    <PanelBody initialOpen>
                        <BaseControl __nextHasNoMarginBottom>
                            <FontSizePicker
                                value={attributes.fontSize as any}
                                onChange={(fontSize: any) =>
                                    setAttributes({ fontSize })
                                }
                            />
                        </BaseControl>
                    </PanelBody>
                </InspectorControls>
            )}
        </>
    );
}

registerBlockType(metadata as any, {
    attributes: metadata.attributes as any,
    edit,
    icon: RibbonBlockIcon,
});
