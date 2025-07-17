import { __ } from "@wordpress/i18n";
import { InspectorControls, useBlockProps } from "@wordpress/block-editor";
import {
    PanelBody,
    SelectControl,
    __experimentalToggleGroupControl as ToggleGroupControl,
    __experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from "@wordpress/components";
import { CSSProperties } from "react";

import {
    RANGE_CONFIG_POSITION,
    RANGE_CONFIG_SIZE,
    RibbonAttrs,
    RibbonProps,
} from "..";
import { getSpacingStyle } from "../../../utils/styling-helpers";
import { Icon, IconPickerMini } from "@tableberg/components/icon-library";
import { SizeControl, SpacingControl } from "@tableberg/components";

interface IconAttrs {
    originX: "left" | "right";
    originY: "top" | "bottom";
    padding: any;
    x: string;
    y: string;
    size: string;
    shape: "rectangle" | "up" | "down" | "slant-up" | "slant-down";
    icon: any;
}

const getBlockStyle = (attrs: RibbonAttrs): CSSProperties => {
    const style: CSSProperties = {
        color: attrs.color,
        fontSize: attrs.fontSize,
    };

    const ind: IconAttrs = attrs.individual;

    const xOrigin = ind?.originX || "left";
    const yOrigin = ind?.originY || "top";

    style[xOrigin] = ind?.x;
    style[yOrigin] = ind?.y;

    return style;
};

export default function Corner({ attrs, setAttributes }: RibbonProps) {
    const blockProps = useBlockProps({
        style: getBlockStyle(attrs),
        className: "tableberg-ribbon tableberg-ribbon-icon",
    });

    const iAttrs = attrs.individual || {};

    const setAttrs = (attrs: Partial<IconAttrs>) =>
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
                    style={{
                        background:
                            attrs.bgGradient ?? attrs.background ?? "#ffffff",
                        ...getSpacingStyle(iAttrs.padding, "padding"),
                        fill: attrs.color,
                    }}
                    className={`tableberg-shape-${iAttrs.shape}`}
                >
                    <Icon icon={iAttrs.icon} size={iAttrs.size} />
                </div>
            </div>
            <InspectorControls>
                <PanelBody initialOpen>
                    <SelectControl
                        label="Shape"
                        value={iAttrs.shape}
                        options={[
                            { label: "Slant Down", value: "slant-down" },
                            { label: "Slant Up", value: "slant-up" },
                            { label: "Down", value: "down" },
                            { label: "Up", value: "up" },
                        ]}
                        onChange={(shape: any) => setAttrs({ shape })}
                    />
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
                    <SizeControl
                        label="Icon Size"
                        value={iAttrs.size}
                        onChange={(size) => setAttrs({ size })}
                        rangeConfig={RANGE_CONFIG_SIZE}
                    />
                </PanelBody>
                <PanelBody title="Icon" initialOpen>
                    <IconPickerMini
                        onSelect={(icon) => {
                            setAttrs({ icon });
                        }}
                    />
                </PanelBody>
            </InspectorControls>
            <InspectorControls group="dimensions">
                <SpacingControl
                    label={__("Padding", "tableberg-pro")}
                    value={iAttrs.padding}
                    onChange={(padding) => setAttrs({ padding })}
                    onDeselect={() => setAttrs({ padding: {} })}
                />
            </InspectorControls>
        </>
    );
}
