// @ts-ignore
import { addFilter } from "@wordpress/hooks";
import { createHigherOrderComponent } from "@wordpress/compose";
import { InspectorControls } from "@wordpress/block-editor";
import { ColorControl } from "@tableberg/components";

interface CellAttributesPro {
    background: string;
    bgGradient: string;
}

const CellBlockPro = createHigherOrderComponent((BlockEdit) => {
    return (props) => {
        if (!props.isSelected || props.name !== "tableberg/cell") {
            return <BlockEdit {...props} />;
        }

        const attrs: CellAttributesPro = props.attributes.pro || {};
        const setProAttrs = (newVals: Partial<CellAttributesPro>) => {
            props.setAttributes({
                pro: {
                    ...props.attributes.pro,
                    ...newVals,
                },
            });
        };
        return (
            <>
                <BlockEdit {...props} />
                <InspectorControls group="color">
                    <ColorControl
                        allowGradient
                        label="[PRO] Cell Background"
                        colorValue={attrs.background}
                        gradientValue={attrs.bgGradient}
                        onColorChange={(background) =>
                            setProAttrs({ background })
                        }
                        onGradientChange={(bgGradient) =>
                            setProAttrs({ bgGradient })
                        }
                        onDeselect={() =>
                            setProAttrs({
                                background: undefined,
                                bgGradient: undefined,
                            })
                        }
                    />
                </InspectorControls>
            </>
        );
    };
}, "tableberg/pro-enhancements");

addFilter("editor.BlockEdit", "tableberg/cell", CellBlockPro);
