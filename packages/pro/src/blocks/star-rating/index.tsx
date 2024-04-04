/**
 * Wordpress Dependencies
 */
import { BlockEditProps } from "@wordpress/blocks";
// @ts-ignore
import { useState } from "@wordpress/element";
import {
    useBlockProps,
    RichText,
} from "@wordpress/block-editor";
/**
 * Internal Imports
 */

import metadata from "./block.json";
import { BlockConfig } from "./types";
import { getStyles } from "./get-styles";
import { BlockIcon, Star } from "./icons";
import { __ } from "@wordpress/i18n";
import StarBlockControls from "./controls";

function Edit(props: BlockEditProps<BlockConfig>) {
    const [highlightedStars, setHighlightedStars] = useState(0);
    const { attributes, setAttributes, clientId } = props;
    const {
        starAlign,
        starCount,
        starColor,
        selectedStars,
        starSize,
        reviewText,
        reviewTextAlign,
        reviewTextColor,
    } = attributes;
    
    const styles = getStyles(attributes);
    const blockProps = useBlockProps({
        className: "tb-star-rating",
        style: styles,
    });

    return (
        <>
            <div {...blockProps}>
                <div
                    className="tb-star-outer-container"
                    style={{
                        justifyContent:
                            starAlign === "center"
                                ? "center"
                                : `flex-${
                                      starAlign === "left" ? "start" : "end"
                                  }`,
                    }}
                >
                    <div
                        className="tb-star-inner-container"
                        onMouseLeave={() => setHighlightedStars(0)}
                    >
                        {Array(starCount).fill(0).map((_, i) => (
                            <div
                                key={i}
                                onMouseEnter={() => setHighlightedStars(i + 1)}
                                onClick={() => {
                                    if (selectedStars % 1 === 0) {
                                        setAttributes({
                                            selectedStars:
                                                i +
                                                (selectedStars - 1 === i
                                                    ? 0.5
                                                    : 1),
                                        });
                                    } else {
                                        setAttributes({
                                            selectedStars:
                                                i +
                                                (selectedStars - 0.5 === i
                                                    ? 1
                                                    : 0.5),
                                        });
                                    }
                                }}
                            >
                                <Star
                                    id={clientId}
                                    index={i}
                                    size={starSize}
                                    value={
                                        (highlightedStars -
                                            (highlightedStars === selectedStars
                                                ? 0.5
                                                : 0) || selectedStars) - i
                                    }
                                    displayColor={starColor}
                                />
                            </div>
                        ))}
                    </div>
                </div>
                <RichText
                    tagName="div"
                    className="tb-review-text"
                    placeholder={__("The text of the review goes here")}
                    value={reviewText}
                    style={{
                        textAlign: reviewTextAlign as any,
                        color: reviewTextColor || "inherit",
                    }}
                    onChange={(text) => setAttributes({ reviewText: text })}
                    keepPlaceholderOnFocus={true}
                    allowedFormats={[
                        "core/bold",
                        "core/italic",
                        "core/strikethrough",
                        "core/link",
                    ]}
                />
            </div>
            <StarBlockControls {...props}/>
            </>
    );
}


// @ts-ignore
registerBlockType(metadata, {
    icon: BlockIcon,
    attributes: metadata.attributes,
    example: {
        attributes: {
            selectedStars: 4,
        },
    },
    edit: Edit,
});


