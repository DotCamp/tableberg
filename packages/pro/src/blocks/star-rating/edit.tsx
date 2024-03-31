/**
 * Wordpress Dependencies
 */
import { useSelect } from "@wordpress/data";
import { BlockEditProps } from "@wordpress/blocks";
// @ts-ignore
import { useState, useEffect } from "@wordpress/element";
import { useBlockProps } from "@wordpress/block-editor";
/**
 * Internal Imports
 */
import { BlockConfig } from "./types";
import { getStyles } from "./get-styles";
import Inspector from "./components/inspector-controls";
import BlockControls from "./components/block-controls";
import EditorDisplay from "./components/editor-display";

function Edit(props: BlockEditProps<BlockConfig>) {
    const [highlightedStars, setHighlightedStars] = useState(0);
    const { attributes, setAttributes, clientId } = props;
    const { blockID } = attributes;
    const { block } = useSelect(
        (select) => {
            const { getBlock } = select("core/block-editor");

            return {
                block: getBlock(clientId),
            };
        },
        [attributes],
    );

    useEffect(() => {
        if (blockID === "") {
            setAttributes({
                blockID: block.clientId,
                starColor: "#ffb901",
            });
        }
    });

    useEffect(() => {
        setAttributes({ blockID: block.clientId });
    }, [block.clientId]);

    const styles = getStyles(attributes);
    const blockProps = useBlockProps({
        className: "tb-star-rating",
        style: styles,
    });

    const editorDisplayProps = {
        highlightedStars,
        setHighlightedStars,
        ...props,
    };
    return (
        <div>
            <BlockControls {...props} />
            <Inspector {...props} />
            <div {...blockProps}>
                <EditorDisplay {...editorDisplayProps} />
            </div>
        </div>
    );
}
export default Edit;
