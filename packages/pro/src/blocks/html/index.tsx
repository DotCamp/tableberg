import { __ } from "@wordpress/i18n";
import { useEffect, useMemo, useRef, useState } from "react";
import {
    BlockControls,
    PlainText,
    useBlockProps,
    store as blockEditorStore,
    transformStyles,
    InspectorControls,
} from "@wordpress/block-editor";
import {
    ToolbarButton,
    ToolbarGroup,
    VisuallyHidden,
    __experimentalToolsPanel as ToolsPanel,
    __experimentalToolsPanelItem as ToolsPanelItem,
    TextareaControl,
} from "@wordpress/components";
import { useInstanceId } from "@wordpress/compose";
import { BlockEditProps, registerBlockType } from "@wordpress/blocks";
import { html } from "@wordpress/icons";

/**
 * Internal dependencies
 */
import metadata from "./block.json";
import { useSelect } from "@wordpress/data";

interface HtmlBlockProps {
    content: string;
}

// Default styles used to unset some of the styles
// that might be inherited from the editor style.
const DEFAULT_STYLES = `
	html,body,:root {
		margin: 0 !important;
		padding: 0 !important;
		overflow: visible !important;
		min-height: auto !important;
	}
`;

function edit({
    attributes,
    setAttributes,
    clientId,
    isSelected
}: BlockEditProps<HtmlBlockProps>) {
    const [isPreview, setIsPreview] = useState<boolean>(false);
    const iframeRef = useRef<HTMLIFrameElement>();

    const instanceId = useInstanceId(edit, "html-edit-desc");

    function switchToPreview() {
        setIsPreview(true);
    }

    function switchToHTML() {
        setIsPreview(false);
    }

    const blockProps = useBlockProps({
        className: "tableberg-custom-html",
        "aria-describedby": isPreview ? instanceId : undefined,
    });

    const settingStyles = useSelect(
        (select) =>
            (
                select(blockEditorStore) as BlockEditorStoreSelectors
            ).getSettings().styles,
        [],
    );

    const styles = useMemo(
        () => [
            DEFAULT_STYLES,
            ...transformStyles(settingStyles.filter((style) => style.css)),
        ].join(''),
        [settingStyles],
    );

    const renderIframeContent = () => {
        const iframe = iframeRef.current;
        if (!iframe) {
            return;
        }
        const iframeDocument = iframe.contentWindow!.document!;
        iframeDocument.head.innerHTML = `<style>${styles}</style>`;
        iframeDocument.body.innerHTML = attributes.content ?
            `<div
                style="width: max-content; overflow: hidden;"
                data-tableberg-${clientId}
                class="editor-styles-wrapper"
            >
                ${attributes.content}
            </div>`
            : `<div
                style="width: max-content; overflow: hidden; color: grey;"
                data-tableberg-${clientId}
                class="editor-styles-wrapper"
            >
                Empty custom HTML block
            </div>`

        const contentRect = iframeDocument
            .querySelector(`[data-tableberg-${clientId}]`)!
            .getBoundingClientRect();
        iframe.height = `${Math.ceil(contentRect.height) + 1}px`;
        iframe.width = `${Math.ceil(contentRect.width) + 1}px`;
    }

    useEffect(renderIframeContent, [styles, isPreview, attributes.content]);

    if (!isSelected) {
        return <div {...blockProps}>
            <VisuallyHidden id={instanceId}>
                {__(
                    "HTML preview is not yet fully accessible. Please switch screen reader to virtualized mode to navigate the below iFrame.",
                    "tableberg-pro",
                )}
            </VisuallyHidden>
            <iframe
                ref={iframeRef as any}
                title={__("Custom HTML Preview", "tableberg-pro")}
                tabIndex={-1}
                sandbox="allow-same-origin"
                onLoad={renderIframeContent}
            />
        </div>
    }

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
            <InspectorControls>
                <ToolsPanel
                    label={__('Settings')}
                    resetAll={() => { }}
                >
                    <ToolsPanelItem
                        label={__("HTML Code")}
                        isShownByDefault
                        hasValue={() => false}
                        onDeselect={() => { }}
                    >
                        <TextareaControl
                            label={__("HTML Code")}
                            value={attributes.content}
                            onChange={content => setAttributes({ content })}
                            help="Write the HTML code here"
                            __nextHasNoMarginBottom
                        />
                    </ToolsPanelItem>
                </ToolsPanel>
            </InspectorControls>
            {isPreview ? (
                <>
                    <VisuallyHidden id={instanceId}>
                        {__(
                            "HTML preview is not yet fully accessible. Please switch screen reader to virtualized mode to navigate the below iFrame.",
                            "tableberg-pro",
                        )}
                    </VisuallyHidden>
                    <iframe
                        ref={iframeRef as any}
                        title={__("Custom HTML Preview", "tableberg-pro")}
                        tabIndex={-1}
                        sandbox="allow-same-origin"
                        onLoad={renderIframeContent}
                    />
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

// @ts-ignore
registerBlockType(metadata, {
    icon: html,
    edit,
});
