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

        const attrs = props.attributes;
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
                            props.setAttributes({ background })
                        }
                        onGradientChange={(bgGradient) =>
                            props.setAttributes({ bgGradient })
                        }
                        onDeselect={() =>
                            props.setAttributes({
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
