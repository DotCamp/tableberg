import { isEmpty, get } from "lodash";
import { __ } from "@wordpress/i18n";
import { useDispatch } from "@wordpress/data";
import { useState, useRef, useMemo, useEffect } from "react";
import { BlockEditProps } from "@wordpress/blocks";
import CustomMediaPlaceholder from "./media-placeholder";
import { ResizableBox } from "@wordpress/components";
import {
    RichText,
    useBlockProps,
    __experimentalGetElementClassName,
    __experimentalImageEditor as ImageEditor,
} from "@wordpress/block-editor";
import Image from "./image";
import Inspector from "./inspector";
import BlockControls from "./block-controls";
import type { AttributesTypes, MediaSizes } from "./types";

function Edit(props: BlockEditProps<AttributesTypes>) {
    const { attributes, setAttributes, isSelected } = props;
    const { media, height, width, caption } = attributes;
    const [showCaption, setShowCaption] = useState(!!caption);
    const [isImageEditing, setIsEditingImage] = useState(false);
    const imageRef = useRef<HTMLImageElement>(null);
    const blockProps = useBlockProps({
        style: {
            width: "max-content",
        },
    });
    const hasImage = !isEmpty(media);
    const { toggleSelection } = useDispatch("core/block-editor");
    const { naturalWidth, naturalHeight } = useMemo(() => {
        return {
            naturalWidth: imageRef.current?.naturalWidth || undefined,
            naturalHeight: imageRef.current?.naturalHeight || undefined,
        };
    }, [imageRef.current?.complete]);

    const onResizeStart = () => {
        toggleSelection(false);
    };

    const onResizeStop = () => {
        toggleSelection(true);
    };

    // clientWidth needs to be a number for the image Cropper to work, but sometimes it's 0
    // So we try using the imageRef width first and fallback to clientWidth.
    const fallbackClientWidth = imageRef.current?.width;
    const id = get(media, "id", "");
    const sizeSlug = get(attributes, "sizeSlug", "large") as keyof MediaSizes;
    const url = get(media, `sizes.${sizeSlug}.url`, "");
    // The only supported unit is px, so we can parseInt to strip the px here.
    const numericWidth = width ? parseInt(width, 10) : undefined;
    const numericHeight = height ? parseInt(height, 10) : undefined;

    useEffect(() => {
        if (!numericWidth || !naturalWidth || !naturalHeight) {
            return;
        }
        let ratio = 1;

        if (!attributes.aspectRatio) {
            ratio = (naturalWidth || 1) / (naturalHeight || 1);
        } else {
            const sratio = attributes.aspectRatio.split("/", 2);
            if (sratio.length > 1) {
                ratio = parseInt(sratio[0]) / parseInt(sratio[1]);
            }
        }
        let h = numericWidth / ratio;
        setAttributes({
            height: `${h}px`,
        });
    }, [attributes.aspectRatio]);

    return (
        <figure {...blockProps}>
            {hasImage && (
                <>
                    <BlockControls
                        setIsEditingImage={setIsEditingImage}
                        showCaption={showCaption}
                        setShowCaption={setShowCaption}
                        attributes={attributes}
                        setAttributes={setAttributes}
                    />
                    {!isImageEditing && (
                        <ResizableBox
                            size={{
                                width,
                                height,
                            }}
                            showHandle={isSelected}
                            minWidth={"50"}
                            minHeight={"50"}
                            maxWidth="720px"
                            enable={{
                                top: false,
                                right: true,
                                bottom: true,
                                left: false,
                            }}
                            onResizeStart={onResizeStart}
                            onResizeStop={(_, direction, elt) => {
                                onResizeStop();

                                let ratio = 1;

                                if (!attributes.aspectRatio) {
                                    ratio =
                                        (naturalWidth || 1) /
                                        (naturalHeight || 1);
                                } else {
                                    const sratio = attributes.aspectRatio.split(
                                        "/",
                                        2
                                    );
                                    if (sratio.length > 1) {
                                        ratio =
                                            parseInt(sratio[0]) /
                                            parseInt(sratio[1]);
                                    }
                                }
                                let w = elt.offsetWidth;
                                let h = elt.offsetHeight;

                                if (direction === "bottom") {
                                    w = h * ratio;
                                } else {
                                    h = w / ratio;
                                }

                                setAttributes({
                                    width: `${w}px`,
                                    height: `${h}px`,
                                });
                            }}
                        >
                            <Image
                                imageRef={imageRef}
                                attributes={attributes}
                                setAttributes={setAttributes}
                            />
                            {showCaption &&
                                (!RichText.isEmpty(caption) || isSelected) && (
                                    <RichText
                                        identifier="caption"
                                        className={__experimentalGetElementClassName(
                                            "caption"
                                        )}
                                        tagName="figcaption"
                                        aria-label={__(
                                            "Image caption text",
                                            "tableberg"
                                        )}
                                        placeholder={__(
                                            "Add caption",
                                            "tableberg"
                                        )}
                                        value={caption}
                                        onChange={(value: string) =>
                                            setAttributes({ caption: value })
                                        }
                                        inlineToolbar
                                    />
                                )}
                        </ResizableBox>
                    )}
                    {isImageEditing && (
                        <ImageEditor
                            id={id}
                            url={url}
                            width={numericWidth}
                            height={numericHeight}
                            clientWidth={fallbackClientWidth}
                            naturalHeight={naturalHeight}
                            naturalWidth={naturalWidth}
                            onSaveImage={(imageAttributes) => {
                                setAttributes({
                                    media: {
                                        ...media,
                                        ...imageAttributes,
                                        sizes: {
                                            ...media.sizes,
                                            [sizeSlug]: {
                                                ...media.sizes[sizeSlug],
                                                ...imageAttributes,
                                            },
                                        },
                                    },
                                });
                            }}
                            onFinishEditing={() => {
                                setIsEditingImage(false);
                            }}
                        />
                    )}
                    <Inspector
                        attributes={attributes}
                        setAttributes={setAttributes}
                    />
                </>
            )}
            {!hasImage && (
                <CustomMediaPlaceholder
                    attributes={attributes}
                    setAttributes={setAttributes}
                />
            )}
        </figure>
    );
}

export default Edit;
