import {
    InspectorControls,
    useBlockProps,
} from "@wordpress/block-editor";
import {
    PanelBody,
    __experimentalToolsPanelItem as ToolsPanelItem,
    __experimentalToggleGroupControl as ToggleGroupControl,
    __experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from "@wordpress/components";
import { __ } from "@wordpress/i18n";
import { CSSProperties } from "react";

import { RANGE_CONFIG_POSITION, RANGE_CONFIG_SIZE, RibbonAttrs, RibbonProps } from "..";
import { SizeControl, SpacingControl } from "@tableberg/components";
import { getSpacingStyle } from "../../../utils/styling-helpers";

interface BookmarkAttrs {
    originX: "left" | "right";
    originY: "top" | "bottom";
    padding: any;
    x: string;
    y: string;
    height: string;
    width: string;
}

const getBlockStyle = (attrs: RibbonAttrs): CSSProperties => {
    const style: CSSProperties = {
        color: attrs.color,
        fontSize: attrs.fontSize,
        height: attrs.individual?.height,
        width: attrs.individual?.width,
    };

    const ind: BookmarkAttrs = attrs.individual;

    const xOrigin = ind?.originX || "left";
    const yOrigin = ind?.originY || "top";

    style[xOrigin] = ind?.x;
    style[yOrigin] = ind?.y;

    return style;
};

export default function Bookmark({
    attrs,
    setAttributes,
    clientId,
}: RibbonProps) {
    const blockProps = useBlockProps({
        style: getBlockStyle(attrs),
        className: "tableberg-ribbon tableberg-ribbon-bookmark",
    });

    const iAttrs = attrs.individual || {};

    const setAttrs = (attrs: Partial<BookmarkAttrs>) =>
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
                    className="tableberg-ribbon-bookmark-content"
                    style={{
                        background: attrs.bgGradient ?? attrs.background ?? "#ffffff",
                        ...getSpacingStyle(iAttrs.padding, "padding"),
                    }}
                >
                    {attrs.text}
                </div>
            </div>
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
            <InspectorControls group="dimensions">
                <SpacingControl
                    label={__("Padding", "tableberg-pro")}
                    value={iAttrs.padding}
                    onChange={(padding) => setAttrs({ padding })}
                    onDeselect={() => setAttrs({ padding: {} })}
                />
                <ToolsPanelItem
                    isShownByDefault
                    hasValue={() => true}
                    label="Height"
                    panelId={clientId}
                    onDeselect={() => setAttrs({ height: "70px" })}
                >
                    <SizeControl
                        label={__("Height", "tableberg-pro")}
                        value={iAttrs.height}
                        onChange={(height) => setAttrs({ height })}
                    />
                </ToolsPanelItem>
                <ToolsPanelItem
                    isShownByDefault
                    hasValue={() => true}
                    label="Width"
                    panelId={clientId}
                    onDeselect={() => setAttrs({ width: "100px" })}
                >
                    <SizeControl
                        label={__("Width", "tableberg-pro")}
                        value={iAttrs.width}
                        onChange={(width) => setAttrs({ width })}
                        rangeConfig={RANGE_CONFIG_SIZE}
                    />
                </ToolsPanelItem>
            </InspectorControls>
        </>
    );
}
