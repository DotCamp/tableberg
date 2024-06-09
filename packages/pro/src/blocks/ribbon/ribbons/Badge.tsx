import { InspectorControls, useBlockProps } from "@wordpress/block-editor";
import { __ } from "@wordpress/i18n";
import { CSSProperties } from "react";

import { RANGE_CONFIG_POSITION, RibbonAttrs, RibbonProps } from "..";
import {
    BorderRadiusControl,
    SizeControl,
    SpacingControl,
} from "@tableberg/components";
import {
    getSpacingStyle,
    getBorderRadiusCSS,
} from "@tableberg/shared/utils/styling-helpers";
import {
    PanelBody,
    __experimentalToggleGroupControl as ToggleGroupControl,
    __experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from "@wordpress/components";

interface BadgeAttrs {
    padding: any;
    borderRadius: any;
    originX: "left" | "right";
    originY: "top" | "bottom";
    x: string;
    y: string;
}

const getBlockStyle = (attrs: RibbonAttrs): CSSProperties => {
    const style: CSSProperties = {
        color: attrs.color,
        fontSize: attrs.fontSize,
    };

    const ind: BadgeAttrs = attrs.individual;

    const xOrigin = ind?.originX || "left";
    const yOrigin = ind?.originY || "top";

    style[xOrigin] = ind?.x;
    style[yOrigin] = ind?.y;

    return style;
};

export default function Badge({ attrs, setAttributes, clientId }: RibbonProps) {
    const blockProps = useBlockProps({
        style: getBlockStyle(attrs),
        className: "tableberg-ribbon tableberg-ribbon-badge",
    });

    const iAttrs: BadgeAttrs = attrs.individual || {};

    const setAttrs = (attrs: Partial<BadgeAttrs>) =>
        setAttributes({
            individual: {
                ...iAttrs,
                ...attrs,
            },
        });

    return (
        <>
            <div {...blockProps}>
                <div
                    className="tableberg-ribbon-badge-content"
                    style={{
                        background:
                            attrs.bgGradient ??
                            attrs.background ??
                            "rgb(203 175 255)",
                        ...getSpacingStyle(iAttrs.padding, "padding"),
                        ...getBorderRadiusCSS(iAttrs.borderRadius),
                    }}
                >
                    {attrs.text}
                </div>
            </div>
            <InspectorControls group="border">
                <BorderRadiusControl
                    label={__("Border Radius", "tableberg-pro")}
                    value={iAttrs.borderRadius}
                    onChange={(borderRadius) => setAttrs({ borderRadius })}
                    onDeselect={() => setAttrs({ borderRadius: {} })}
                />
            </InspectorControls>
            <InspectorControls group="dimensions">
                <SpacingControl
                    label={__("Padding", "tableberg-pro")}
                    value={iAttrs.padding}
                    onChange={(padding) => setAttrs({ padding })}
                    onDeselect={() => setAttrs({ padding: {} })}
                />
            </InspectorControls>
            <InspectorControls>
                <PanelBody initialOpen>
                    <div
                        style={{
                            display: "flex",
                            gap: "5px",
                            alignItems: "start",
                            justifyContent: "space-between",
                        }}
                    >
                        <ToggleGroupControl
                            label="Origin X"
                            value={iAttrs.originX}
                            isBlock
                            onChange={(originX: any) => setAttrs({ originX })}
                        >
                            <ToggleGroupControlOption
                                value="left"
                                label="Left"
                            />
                            <ToggleGroupControlOption
                                value="right"
                                label="Right"
                            />
                        </ToggleGroupControl>
                        <ToggleGroupControl
                            label="origin Y"
                            value={iAttrs.originY}
                            isBlock
                            onChange={(originY: any) => setAttrs({ originY })}
                        >
                            <ToggleGroupControlOption value="top" label="Top" />
                            <ToggleGroupControlOption
                                value="bottom"
                                label="Bottom"
                            />
                        </ToggleGroupControl>
                    </div>
                    <SizeControl
                        label="Position X"
                        value={iAttrs.x}
                        onChange={(x) => setAttrs({ x })}
                        rangeConfig={RANGE_CONFIG_POSITION}
                    />
                    <SizeControl
                        label="Position Y"
                        value={iAttrs.y}
                        onChange={(y) => setAttrs({ y })}
                        rangeConfig={RANGE_CONFIG_POSITION}
                    />
                </PanelBody>
            </InspectorControls>
        </>
    );
}
