import { ReactNode } from "react";
import { get, isEmpty } from "lodash";
import { __ } from "@wordpress/i18n";
import { Placeholder } from "@wordpress/components";
import { image as imageIcon } from "@wordpress/icons";
import { MediaPlaceholder } from "@wordpress/block-editor";
import type { AttributesTypes, MainPropTypes } from "./types";

function CustomMediaPlaceholder(props: MainPropTypes) {
    const {
        attributes: { media },
        setAttributes,
    } = props;

    const placeholder = (content: ReactNode) => {
        return (
            <Placeholder
                className={"block-editor-media-placeholder"}
                withIllustration={true}
                icon={imageIcon}
                label={__("Image", "tableberg")}
                instructions={__(
                    "Upload an image file, pick one from your media library, or add one with a URL.",
                )}
            >
                {content}
            </Placeholder>
        );
    };
    function onSelectImage(media: any) {
        if (!media || !media.url) {
            setAttributes({
                media: {},
            });
        } else {
            let alt = media.alt;
            setAttributes({ media, alt });
        }
    }
    const id = get(media, "id", -1);
    return (
        <MediaPlaceholder
            icon={imageIcon}
            accept="image/*"
            placeholder={placeholder}
            //  onError={onUploadError}
            onSelect={onSelectImage}
            //  onSelectURL={onSelectURL}
            allowedTypes={["image"]}
            value={id}
            //  mediaPreview={mediaPreview}
            //  disableMediaButtons={temporaryURL || url}
        />
    );
}
export default CustomMediaPlaceholder;
