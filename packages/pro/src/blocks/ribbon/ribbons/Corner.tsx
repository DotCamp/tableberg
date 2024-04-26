import { __ } from "@wordpress/i18n";
import {
    InspectorControls,
    useBlockProps,
} from "@wordpress/block-editor";
import {
    PanelBody,
    __experimentalToggleGroupControl as ToggleGroupControl,
    __experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from "@wordpress/components";
import { CSSProperties } from "react";

import { RANGE_CONFIG_SIZE, RibbonAttrs, RibbonProps } from "..";
import { StyleAttr } from "../../../utils/styling-helpers";
import { SizeControl } from "@tableberg/components";

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
                        background: attrs.bgGradient ?? attrs.background ?? "#ffffff",
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
                    <SizeControl
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
                        rangeConfig={RANGE_CONFIG_SIZE}
                    />
                </PanelBody>
            </InspectorControls>
        </>
    );
}
