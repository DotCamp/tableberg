// @ts-ignore
import { has, get, isEmpty } from "lodash";
import { BlockEditProps } from "@wordpress/blocks";
import { useBlockProps } from "@wordpress/block-editor";
import CustomMediaPlaceholder from "./media-placeholder";
import type { AttributesTypes } from "./types";
import Image from "./image";
import { ResizableBox } from "@wordpress/components";
import { useDispatch } from "@wordpress/data";
import BlockControls from "./block-controls";
import Inspector from "./inspector";

export interface EditProps {
  attributes: AttributesTypes;
  setAttributes: (attrs: object) => void;
  isSelected: boolean;
}

function Edit(props: BlockEditProps<AttributesTypes>) {
  const blockProps = useBlockProps();
  const { attributes, setAttributes, isSelected } = props;
  const { media, height, width } = attributes;
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
          <BlockControls />
          <ResizableBox
            size={{
              width: width,
              height: height,
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
