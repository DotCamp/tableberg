import { SpacingControl, ColorSettings } from "@Components/styling-controls";
import { __ } from "@wordpress/i18n";
import { InspectorControls, ColorPalette } from "@wordpress/block-editor";
import { PanelBody, RangeControl } from "@wordpress/components";
import { BlockEditProps } from "@wordpress/blocks";
import { BlockConfig } from "../types";

function Inspector(props: BlockEditProps<BlockConfig>) {
    const { attributes, setAttributes } = props;

    const { starCount, starSize, starColor, selectedStars, reviewTextColor } =
        attributes;
    return (
        <>
            <InspectorControls group="settings">
                <PanelBody title={__("General")} initialOpen={true}>
                    <RangeControl
                        label={__("Number of stars")}
                        value={starCount}
                        onChange={(value) =>
                            setAttributes({
                                starCount: value,
                                selectedStars:
                                    value < selectedStars
                                        ? value
                                        : selectedStars,
                            })
                        }
                        min={5}
                        max={10}
                        beforeIcon="star-empty"
                    />
                    <RangeControl
                        label={__("Star value")}
                        value={selectedStars}
                        onChange={(selectedStars) =>
                            setAttributes({ selectedStars })
                        }
                        min={0.1}
                        max={starCount}
                        step={0.1}
                        beforeIcon="star-half"
                    />
                    <RangeControl
                        label={__("Star size")}
                        value={starSize}
                        onChange={(value) => setAttributes({ starSize: value })}
                        min={10}
                        max={30}
                        beforeIcon="editor-contract"
                        afterIcon="editor-expand"
                    />
                </PanelBody>
            </InspectorControls>
            <InspectorControls group="color">
                <ColorSettings
                    attrKey="starColor"
                    label={__("Star Color", "tableberg-pro")}
                />
                <ColorSettings
                    attrKey="reviewTextColor"
                    label={__("Text Color", "tableberg-pro")}
                />
            </InspectorControls>
            <InspectorControls group="dimensions">
                <SpacingControl
                    showByDefault
                    attrKey="padding"
                    label={__("Padding", "tableberg-pro")}
                />
                <SpacingControl
                    minimumCustomValue={-Infinity}
                    showByDefault
                    attrKey="margin"
                    label={__("Margin", "tableberg-pro")}
                />
            </InspectorControls>
        </>
    );
}
export default Inspector;
