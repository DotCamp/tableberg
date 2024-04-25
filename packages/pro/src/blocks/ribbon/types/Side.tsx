import {
    HeightControl,
    InspectorControls,
    useBlockProps,
} from "@wordpress/block-editor";
import { RibbonAttrs, RibbonProps } from "..";
import {
    PanelBody,
    __experimentalToggleGroupControl as ToggleGroupControl,
    __experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from "@wordpress/components";
import { __ } from "@wordpress/i18n";
import { CSSProperties } from "react";

import { BorderControl, SpacingControl } from "@tableberg/components";
import { getSpacingStyle, getBorderCSS } from "../../../utils/styling-helpers";

interface SideAttrs {
    padding: any;
    border: any;
    side: "left" | "right";
    originY: "top" | "bottom";
    y: string;
}

const getBlockStyle = (attrs: RibbonAttrs): CSSProperties => {
    const style: CSSProperties = {
        color: attrs.color,
        fontSize: attrs.fontSize,
        height: attrs.individual?.height,
        width: attrs.individual?.width,
    };

    const ind: SideAttrs = attrs.individual;

    const yOrigin = ind?.originY || "top";
    style[yOrigin] = ind?.y;

    const isLefty = ind.side !== "right";
    style[isLefty ? "left" : "right"] = "-20px";

    return style;
};

export default function Side({ attrs, setAttributes, clientId }: RibbonProps) {
    const iAttrs: SideAttrs = attrs.individual;
    const blockProps = useBlockProps({
        style: getBlockStyle(attrs),
        className:
            "tableberg-ribbon tableberg-ribbon-side tableberg-ribbon-side-" +
            iAttrs.side,
    });

    const setAttrs = (attrs: Partial<SideAttrs>) =>
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
                    className="tableberg-ribbon-side-content"
                    style={{
                        background: attrs.bgGradient || attrs.background,
                        ...getSpacingStyle(iAttrs.padding, "padding"),
                        ...getBorderCSS(iAttrs.border),
                    }}
                >
                    {attrs.text}
                </div>
                <div className="tableberg-ribbon-side-shadow" />
            </div>
            <InspectorControls>
                <PanelBody initialOpen>
                    <ToggleGroupControl
                        label="Side"
                        value={iAttrs.side}
                        isBlock
                        onChange={(side: any) => setAttrs({ side })}
                    >
                        <ToggleGroupControlOption value="left" label="Left" />
                        <ToggleGroupControlOption value="right" label="Right" />
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
                    <HeightControl
                        label="Position Y"
                        value={iAttrs.y}
                        onChange={(y) => setAttrs({ y })}
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
                <BorderControl
                    label={__("Border", "tableberg-pro")}
                    value={iAttrs.border}
                    onChange={(border) => setAttrs({ border })}
                    onDeselect={() => setAttrs({ border: {} })}
                />
            </InspectorControls>
        </>
    );
}
