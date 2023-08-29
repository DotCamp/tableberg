import {
    BlockEditProps,
    BlockSaveProps,
    registerBlockType,
} from "@wordpress/blocks";

import metadata from "./block.json";
import { RichText, useBlockProps } from "@wordpress/block-editor";

function edit({ attributes, setAttributes }: BlockEditProps<{}>) {
    const blockProps = useBlockProps();
    return (
        <>
            <div {...blockProps}>
                <RichText
                    className="wp-block-button__link"
                    aria-label="Button text"
                    placeholder="Add text…"
                    value={"abcd"}
                    onChange={(value: string) => console.log(value)}
                    // @ts-ignore
                    withoutInteractiveFormatting
                    identifier="text"
                />
            </div>
        </>
    );
}

function save(props: BlockSaveProps<{}>) {
    const blockProps = useBlockProps.save();
    return (
        <div {...blockProps}>
            <RichText.Content
                tagName="a"
                className="wp-block-button__link"
                value={""}
            />
        </div>
    );
}

registerBlockType(metadata.name, {
    title: metadata.title,
    category: metadata.category,
    attributes: {},
    example: {},
    edit,
    save,
});
