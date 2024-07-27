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
    RangeControl,
    __experimentalToggleGroupControl as ToggleGroupControl,
    __experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from "@wordpress/components";

interface BadgeAttrs {
    padding: any;
    borderRadius: any;
    originX: "left" | "right" | "center";
    originY: "top" | "bottom" | "center";
    x: string;
    y: string;
    rotate: number;
}

const getBlockStyle = (attrs: RibbonAttrs): CSSProperties => {
    const style: CSSProperties = {
        color: attrs.color,
        fontSize: attrs.fontSize,
    };

    const ind: BadgeAttrs = attrs.individual;

    const xOrigin = ind?.originX || "left";
    const yOrigin = ind?.originY || "top";
    let translateX = "0px";
    let translateY = "0px";

    if (xOrigin === "center") {
        style.left = `calc(50% + (${ind?.x || "0px"}))`;
        translateX = "-50%";
    } else {
        style[xOrigin] = ind?.x;
    }

    if (yOrigin === "center") {
        style.top = `calc(50% + (${ind?.y || "0px"}))`;
        translateY = "-50%";
    } else {
        style[yOrigin] = ind?.y;
    }

    style.transform = `translate(${translateX}, ${translateY})`;

    if (ind?.rotate) {
        style.transform += ` rotate(${ind?.rotate}deg)`;
    }

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
                    <ToggleGroupControl
                        label="Horizontal Position"
                        value={iAttrs.originX}
                        isBlock
                        onChange={(originX: any) => setAttrs({ originX })}
                    >
                        <ToggleGroupControlOption value="left" label="Left" />
                        <ToggleGroupControlOption
                            value="center"
                            label="Center"
                        />
                        <ToggleGroupControlOption value="right" label="Right" />
                    </ToggleGroupControl>

                    <SizeControl
                        label="Horizontal Position Offset"
                        value={iAttrs.x}
                        onChange={(x) => setAttrs({ x })}
                        rangeConfig={RANGE_CONFIG_POSITION}
                    />
                    <div style={{ marginTop: "20px" }} />
                    <ToggleGroupControl
                        label="Vertical Position"
                        value={iAttrs.originY}
                        isBlock
                        onChange={(originY: any) => setAttrs({ originY })}
                    >
                        <ToggleGroupControlOption value="top" label="Top" />
                        <ToggleGroupControlOption
                            value="center"
                            label="Center"
                        />
                        <ToggleGroupControlOption
                            value="bottom"
                            label="Bottom"
                        />
                    </ToggleGroupControl>
                    <SizeControl
                        label="Vertical Position Offset"
                        value={iAttrs.y}
                        onChange={(y) => setAttrs({ y })}
                        rangeConfig={RANGE_CONFIG_POSITION}
                    />
                    <div style={{ marginTop: "30px" }} />
                    <RangeControl
                        label="Rotation"
                        value={iAttrs.rotate}
                        onChange={(rotate) => setAttrs({ rotate })}
                        min={-360}
                        max={360}
                        step={1}
                        initialPosition={0}
                    />
                </PanelBody>
            </InspectorControls>
        </>
    );
}
