import {
    AlignmentControl,
    BlockControls,
    InspectorControls,
    store,
    useBlockProps,
} from "@wordpress/block-editor";
import { __ } from "@wordpress/i18n";
import { CSSProperties, useEffect } from "react";

import {
    RibbonAttrs,
    RibbonProps,
} from "..";
import {
    BorderRadiusControl,
    SpacingControl,
} from "@tableberg/components";
import { getSpacingStyle, getBorderRadiusCSS } from "@tableberg/shared/utils/styling-helpers";
import { useDispatch, useSelect } from "@wordpress/data";

interface BadgeAttrs {
    alignment: "left" | "center" | "right";
    isPositioned: boolean;
    padding: any;
    borderRadius: any;
}

const getBlockStyle = (attrs: RibbonAttrs): CSSProperties => {
    const style: CSSProperties = {
        color: attrs.color,
        fontSize: attrs.fontSize,
        height: attrs.individual?.height,
        width: attrs.individual?.width,
    };

    return style;
};

export default function Badge({ attrs, setAttributes, clientId }: RibbonProps) {
    const blockProps = useBlockProps({
        style: getBlockStyle(attrs),
        className:
            "tableberg-ribbon tableberg-ribbon-badge tableberg-ribbon-badge-" +
            (attrs.individual?.alignment || "center"),
    });

    const iAttrs: BadgeAttrs = attrs.individual || {};

    const storeActions: BlockEditorStoreActions = useDispatch(store) as any;
    const storeSelect: BlockEditorStoreSelectors = useSelect(
        (select) => select(store) as any,
        [],
    );

    useEffect(() => {
        if (!iAttrs.isPositioned) {
            const cellBlock = storeSelect.getBlock(
                storeSelect.getBlockRootClientId(clientId)!,
            )!;
            let pos = 0;
            while (pos < cellBlock.innerBlocks.length) {
                if (cellBlock.innerBlocks[pos].name !== "tableberg/badge") {
                    break;
                }
                pos++;
            }
            storeActions.moveBlockToPosition(
                clientId,
                cellBlock.clientId,
                cellBlock.clientId,
                pos,
            );
            setAttrs({ isPositioned: true });
            setAttributes({background: "rgb(203 175 255)"})
        }
    }, []);

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
                            attrs.bgGradient ?? attrs.background ?? "rgb(203 175 255)",
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
            <BlockControls group="block">
                <AlignmentControl
                    value={iAttrs.alignment}
                    onChange={(alignment: any) => {
                        setAttrs({ alignment });
                    }}
                />
            </BlockControls>
        </>
    );
}
