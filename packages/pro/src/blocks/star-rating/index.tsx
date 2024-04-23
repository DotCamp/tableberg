/**
 * Wordpress Dependencies
 */
import { BlockEditProps, registerBlockType } from "@wordpress/blocks";
import { useState } from "react";
import { useBlockProps, RichText } from "@wordpress/block-editor";
/**
 * Internal Imports
 */

import metadata from "./block.json";
import { getStyles } from "./get-styles";
import { BlockIcon, Star } from "./icons";
import { __ } from "@wordpress/i18n";
import StarBlockControls from "./controls";
import classNames from "classnames";
import { SpacingTypes } from "../../utils/types";

export interface StarRatingProps {
    starCount: number;
    starSize: string;
    starColor: string | null;
    selectedStars: number;
    reviewText: string;
    reviewTextAlign: string;
    reviewTextColor: string | null;
    starAlign: string;
    padding: SpacingTypes;
    margin: SpacingTypes;
}

function Edit(props: BlockEditProps<StarRatingProps>) {
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
        className: "tableberg-star-rating",
        style: styles,
    });

    return (
        <>
            <div {...blockProps}>
                <div
                    className={classNames(
                        "tableberg-stars",
                        `tableberg-stars-${starAlign}`,
                    )}
                    onMouseLeave={() => setHighlightedStars(0)}
                >
                    {Array(starCount)
                        .fill(0)
                        .map((_, i) => (
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
                <RichText
                    tagName="div"
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
            <StarBlockControls {...props} />
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
