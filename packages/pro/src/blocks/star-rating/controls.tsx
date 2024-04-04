import { __ } from "@wordpress/i18n";
import {
    InspectorControls,
    BlockControls as WPBlockControls,
} from "@wordpress/block-editor";
import {
    ToolbarGroup,
    ToolbarButton,
    PanelBody,
    RangeControl,
} from "@wordpress/components";
import { BlockEditProps } from "@wordpress/blocks";
import { BlockConfig } from "./types";
import {
    ColorSettings,
    SpacingControl,
} from "../../components/styling-controls";

function StarBlockControls(props: BlockEditProps<BlockConfig>) {
    const { attributes, setAttributes } = props;

    const { starCount, starSize, selectedStars, reviewTextAlign, starAlign } =
        attributes;
    return (
        <>
            <WPBlockControls>
                <ToolbarGroup>
                    {["left", "center", "right"].map((a) => (
                        // @ts-ignore
                        <ToolbarButton
                            icon={`align-${a}` as any}
                            label={__(`Align stars ${a}`)}
                            onClick={() => setAttributes({ starAlign: a })}
                            isActive={starAlign === a}
                        />
                    ))}
                </ToolbarGroup>
                <ToolbarGroup>
                    {["left", "center", "right", "justify"].map((a) => (
                        // @ts-ignore
                        <ToolbarButton
                            icon={
                                `editor-${
                                    a === "justify" ? a : "align" + a
                                }` as any
                            }
                            label={__(
                                (a !== "justify" ? "Align " : "") +
                                    a[0].toUpperCase() +
                                    a.slice(1),
                            )}
                            isActive={reviewTextAlign === a}
                            onClick={() =>
                                setAttributes({ reviewTextAlign: a })
                            }
                        />
                    ))}
                </ToolbarGroup>
            </WPBlockControls>
            <InspectorControls group="settings">
                <PanelBody title={__("General")} initialOpen={true}>
                    <RangeControl
                        label={__("Number of stars")}
                        value={starCount}
                        onChange={(value) =>
                            setAttributes({
                                starCount: value,
                                selectedStars:
                                    value! < selectedStars
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
                        value={starSize as any}
                        onChange={(value) =>
                            setAttributes({ starSize: value as any })
                        }
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
export default StarBlockControls;
