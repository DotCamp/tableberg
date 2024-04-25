import { __ } from "@wordpress/i18n";
import {
    HeightControl,
    InspectorControls,
    useBlockProps,
} from "@wordpress/block-editor";
import {
    PanelBody,
    __experimentalToggleGroupControl as ToggleGroupControl,
    __experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from "@wordpress/components";
import { CSSProperties } from "react";

import { RibbonAttrs, RibbonProps } from "..";
import { StyleAttr } from "../../../utils/styling-helpers";

const getBlockStyle = (attrs: RibbonAttrs): CSSProperties => {
    const style: StyleAttr = {
        color: attrs.color,
        fontSize: attrs.fontSize,
    };

    const isLefty = attrs.individual?.side !== "right";
    if (isLefty) {
        style.left = "-3px";
    } else {
        style.right = "-3px";
    }

    const size = attrs.individual?.distance || "50px";
    style.width = `calc( 2 * ${size})`;
    style.aspectRatio = 1;

    return style;
};

export default function Corner({ attrs, setAttributes }: RibbonProps) {
    const isLefty = attrs.individual?.side !== "right";
    const blockProps = useBlockProps({
        style: getBlockStyle(attrs),
        className: "tableberg-ribbon tableberg-ribbon-corner",
    });

    return (
        <>
            <div {...blockProps}>
                <div
                    className={`tableberg-ribbon-corner-${
                        isLefty ? "left" : "right"
                    }`}
                    style={{
                        background: attrs.bgGradient || attrs.background,
                    }}
                >
                    {attrs.text}
                </div>
            </div>
            <InspectorControls>
                <PanelBody initialOpen>
                    <ToggleGroupControl
                        label="Side"
                        value={attrs.individual?.side}
                        isBlock
                        onChange={(val) =>
                            setAttributes({
                                individual: {
                                    ...attrs.individual,
                                    side: val,
                                },
                            })
                        }
                    >
                        <ToggleGroupControlOption value="left" label="Left" />
                        <ToggleGroupControlOption value="right" label="Right" />
                    </ToggleGroupControl>
                    <HeightControl
                        label={__("Distance", "tableberg-pro")}
                        value={attrs.individual?.distance}
                        onChange={(distance) =>
                            setAttributes({
                                individual: {
                                    ...attrs.individual,
                                    distance,
                                },
                            })
                        }
                    />
                </PanelBody>
            </InspectorControls>
        </>
    );
}
