import { __ } from "@wordpress/i18n";
import { BlockControls as WPBlockControls } from "@wordpress/block-editor";
import { ToolbarGroup, ToolbarButton } from "@wordpress/components";
import { BlockEditProps } from "@wordpress/blocks";
import { BlockConfig } from "../types";

function BlockControls(props: BlockEditProps<BlockConfig>) {
    const { attributes, setAttributes } = props;

    const { reviewTextAlign } = attributes;
    return (
        <WPBlockControls>
            <ToolbarGroup>
                {["left", "center", "right"].map((a) => (
                    <ToolbarButton
                        icon={`align-${a}`}
                        label={__(`Align stars ${a}`)}
                        onClick={() => setAttributes({ starAlign: a })}
                    />
                ))}
            </ToolbarGroup>
            <ToolbarGroup>
                {["left", "center", "right", "justify"].map((a) => (
                    <ToolbarButton
                        icon={`editor-${a === "justify" ? a : "align" + a}`}
                        label={__(
                            (a !== "justify" ? "Align " : "") +
                                a[0].toUpperCase() +
                                a.slice(1),
                        )}
                        isActive={reviewTextAlign === a}
                        onClick={() => setAttributes({ reviewTextAlign: a })}
                    />
                ))}
            </ToolbarGroup>
        </WPBlockControls>
    );
}
export default BlockControls;
