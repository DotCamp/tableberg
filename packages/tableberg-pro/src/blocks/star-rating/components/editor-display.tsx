import { Star } from "../icons";

// import { SpacingControl } from "$Components";
import { __ } from "@wordpress/i18n";
import { RichText } from "@wordpress/block-editor";
import { BlockConfig } from "../types";
import { BlockEditProps } from "@wordpress/blocks";
interface EditorDisplayTypes extends BlockEditProps<BlockConfig> {
    setHighlightedStars: Function;
    highlightedStars: number;
}
function EditorDisplay(props: EditorDisplayTypes) {
    const { setAttributes, setHighlightedStars, highlightedStars } = props;

    const {
        blockID,
        starCount,
        starSize,
        starColor,
        selectedStars,
        reviewText,
        reviewTextColor,
        reviewTextAlign,
        starAlign,
    } = props.attributes;
    return (
        <>
            <div
                className="tb-star-outer-container"
                style={{
                    justifyContent:
                        starAlign === "center"
                            ? "center"
                            : `flex-${starAlign === "left" ? "start" : "end"}`,
                }}
            >
                <div
                    className="tb-star-inner-container"
                    onMouseLeave={() => setHighlightedStars(0)}
                >
                    {[...Array(starCount)].map((e, i) => (
                        <div
                            key={i}
                            onMouseEnter={() => setHighlightedStars(i + 1)}
                            onClick={() => {
                                if (selectedStars % 1 === 0) {
                                    setAttributes({
                                        selectedStars:
                                            i +
                                            (selectedStars - 1 === i ? 0.5 : 1),
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
                                id={blockID}
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
                    textAlign: reviewTextAlign,
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
        </>
    );
}
export default EditorDisplay;
