/**
 * WordPress dependencies
 */
import { __ } from "@wordpress/i18n";
import { useContext, useState } from "@wordpress/element";
import {
    BlockControls,
    PlainText,
    useBlockProps,
} from "@wordpress/block-editor";
import {
    ToolbarButton,
    Disabled,
    ToolbarGroup,
    VisuallyHidden,
} from "@wordpress/components";
import { useInstanceId } from "@wordpress/compose";

/**
 * Internal dependencies
 */
import Preview from "./preview";
import { BlockConfig } from "./types";
import { BlockEditProps } from "@wordpress/blocks";

export default function HTMLEdit({
    attributes,
    setAttributes,
    isSelected,
}: BlockEditProps<BlockConfig>) {
    const [isPreview, setIsPreview] = useState();
    const isDisabled = useContext(Disabled.Context);

    const instanceId = useInstanceId(HTMLEdit, "html-edit-desc");

    function switchToPreview() {
        setIsPreview(true);
    }

    function switchToHTML() {
        setIsPreview(false);
    }

    const blockProps = useBlockProps({
        className: "tb-custom-html",
        "aria-describedby": isPreview ? instanceId : undefined,
    });

    return (
        <div {...blockProps}>
            <BlockControls>
                <ToolbarGroup>
                    {/* @ts-ignore */}
                    <ToolbarButton
                        className="components-tab-button"
                        isPressed={!isPreview}
                        onClick={switchToHTML}
                    >
                        {__("HTML", "tableberg-pro")}
                    </ToolbarButton>
                    {/* @ts-ignore */}
                    <ToolbarButton
                        className="components-tab-button"
                        isPressed={isPreview}
                        onClick={switchToPreview}
                    >
                        {__("Preview", "tableberg-pro")}
                    </ToolbarButton>
                </ToolbarGroup>
            </BlockControls>
            {isPreview || isDisabled ? (
                <>
                    <Preview
                        content={attributes.content}
                        isSelected={isSelected}
                    />
                    <VisuallyHidden id={instanceId}>
                        {__(
                            "HTML preview is not yet fully accessible. Please switch screen reader to virtualized mode to navigate the below iFrame.",
                            "tableberg-pro",
                        )}
                    </VisuallyHidden>
                </>
            ) : (
                <PlainText
                    value={attributes.content}
                    onChange={(content) => setAttributes({ content })}
                    placeholder={__("Write HTML…", "tableberg-pro")}
                    aria-label={__("HTML", "tableberg-pro")}
                />
            )}
        </div>
    );
}
