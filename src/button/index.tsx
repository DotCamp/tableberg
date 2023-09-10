import {
    BlockEditProps,
    BlockSaveProps,
    registerBlockType,
} from "@wordpress/blocks";

import metadata from "./block.json";
import { RichText, useBlockProps } from "@wordpress/block-editor";

interface ButtonElementBlockAttrs {
    text: string;
}

function edit({
    attributes,
    setAttributes,
}: BlockEditProps<ButtonElementBlockAttrs>) {
    const blockProps = useBlockProps();
    return (
        <>
            <div {...blockProps}>
                <RichText
                    className="wp-block-button__link wp-element-button"
                    aria-label="Button text"
                    placeholder="Add text…"
                    value={attributes.text}
                    allowedFormats={["core/bold", "core/italic"]}
                    onChange={(value: string) =>
                        setAttributes({
                            text: value.replace(/<\/?a[^>]*>/g, ""),
                        })
                    }
                    // @ts-ignore
                    withoutInteractiveFormatting
                    identifier="text"
                />
            </div>
        </>
    );
}

function save({ attributes }: BlockSaveProps<ButtonElementBlockAttrs>) {
    const blockProps = useBlockProps.save();
    return (
        <div {...blockProps}>
            <RichText.Content
                tagName="a"
                className="wp-block-button__link wp-element-button"
                value={attributes.text}
            />
        </div>
    );
}

registerBlockType(metadata.name, {
    title: metadata.title,
    category: metadata.category,
    attributes: {
        text: {
            type: "string",
            source: "html",
            selector: "a",
        },
    },
    example: {},
    edit,
    save,
});
