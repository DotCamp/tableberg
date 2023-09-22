//@ts-ignore
import { get } from "lodash";
import { __ } from "@wordpress/i18n";
//@ts-ignore
import { useEffect } from "@wordpress/element";
import { caption as captionIcon, crop } from "@wordpress/icons";
import {
  BlockControls as WPBlockControls,
  //@ts-ignore
  MediaReplaceFlow,
  // @ts-ignore
  __experimentalImageURLInputUI as ImageURLInputUI,
} from "@wordpress/block-editor";
//@ts-ignore
import { usePrevious } from "@wordpress/compose";
import { ToolbarButton, ToolbarGroup } from "@wordpress/components";
import type { ExtendMainPropTypes } from "./types";

function BlockControls(props: ExtendMainPropTypes) {
  const {
    attributes,
    setAttributes,
    setShowCaption,
    showCaption,
    setIsEditingImage,
  } = props;
  const { media, caption, linkClass, linkDestination, linkTarget, href, rel } =
    attributes;
  const prevCaption = usePrevious(caption);

  useEffect(() => {
    if (caption && !prevCaption) {
      setShowCaption(true);
    }
  }, [caption, prevCaption]);
  const imageUrl = get(media, "url", "");
  const mediaId = get(media, "id", -1);
  const imageLink = get(media, "link", "");
  function onSetHref(props: any) {
    setAttributes(props);
  }
  return (
    <>
      {/* @ts-ignore */}
      <WPBlockControls group={"block"}>
        <ToolbarButton
          onClick={() => {
            setShowCaption(!showCaption);
            if (showCaption && caption) {
              setAttributes({ caption: undefined });
            }
          }}
          icon={captionIcon}
          isPressed={showCaption}
          label={showCaption ? __("Remove caption") : __("Add caption")}
        />
        <ImageURLInputUI
          url={href || ""}
          onChangeUrl={onSetHref}
          linkDestination={linkDestination}
          mediaUrl={imageUrl}
          mediaLink={imageLink}
          linkTarget={linkTarget}
          linkClass={linkClass}
          rel={rel}
        />
        <ToolbarButton
          onClick={() => setIsEditingImage(true)}
          icon={crop}
          label={__("Crop", "tableberg")}
        />
      </WPBlockControls>
      <WPBlockControls>
        <ToolbarGroup>
          <MediaReplaceFlow
            mediaURL={imageUrl}
            mediaId={mediaId}
            onSelect={(newMedia: any) =>
              setAttributes({ media: newMedia, alt: newMedia.alt })
            }
            name={__("Replace", "tableberg")}
          />
        </ToolbarGroup>
      </WPBlockControls>
    </>
  );
}
export default BlockControls;
