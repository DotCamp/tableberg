// @ts-ignore
import { isEmpty } from "lodash";
import { __ } from "@wordpress/i18n";
// @ts-ignore
import { useState } from "@wordpress/element";
import { useDispatch } from "@wordpress/data";
import { BlockEditProps } from "@wordpress/blocks";
import CustomMediaPlaceholder from "./media-placeholder";
import { ResizableBox } from "@wordpress/components";
import {
  RichText,
  useBlockProps,
  // @ts-ignore
  __experimentalGetElementClassName,
} from "@wordpress/block-editor";
import Image from "./image";
import Inspector from "./inspector";
import BlockControls from "./block-controls";
import type { AttributesTypes } from "./types";

export interface EditProps {
  attributes: AttributesTypes;
  setAttributes: (attrs: object) => void;
  isSelected: boolean;
}

function Edit(props: BlockEditProps<AttributesTypes>) {
  const { attributes, setAttributes, isSelected } = props;
  const { media, height, width, caption } = attributes;
  const [showCaption, setShowCaption] = useState(!!caption);
  const [isImageEditor, setIsEditingImage] = useState(false);

  const blockProps = useBlockProps();
  const hasImage = !isEmpty(media);
  const { toggleSelection } = useDispatch("core/block-editor");

  function onResizeStart() {
    toggleSelection(false);
  }

  function onResizeStop() {
    toggleSelection(true);
  }
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
          <ResizableBox
            size={{
              width,
              height,
            }}
            showHandle={isSelected}
            minWidth={"50"}
            minHeight={"50"}
            enable={{
              top: false,
              right: true,
              bottom: true,
              left: false,
            }}
            onResizeStart={onResizeStart}
            onResizeStop={(event, direction, elt) => {
              onResizeStop();
              // Since the aspect ratio is locked when resizing, we can
              // use the width of the resized element to calculate the
              // height in CSS to prevent stretching when the max-width
              // is reached.
              setAttributes({
                width: `${elt.offsetWidth}px`,
                height: "auto",
              });
            }}
          >
            <Image attributes={attributes} setAttributes={setAttributes} />
            {showCaption && (!RichText.isEmpty(caption) || isSelected) && (
              <RichText
                identifier="caption"
                className={__experimentalGetElementClassName("caption")}
                tagName="figcaption"
                aria-label={__("Image caption text", "tableberg")}
                placeholder={__("Add caption", "tableberg")}
                value={caption}
                onChange={(value: string) => setAttributes({ caption: value })}
                inlineToolbar
              />
            )}
          </ResizableBox>
          <Inspector attributes={attributes} setAttributes={setAttributes} />
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
