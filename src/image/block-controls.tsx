//@ts-ignore
import { get } from "lodash";
import { useSelect, useDispatch } from "@wordpress/data";
import {
  BlockControls as WPBlockControls,
  //@ts-ignore
  MediaReplaceFlow,
  //@ts-ignore
  useBlockEditContext,
} from "@wordpress/block-editor";
import { __ } from "@wordpress/i18n";
import { ToolbarGroup } from "@wordpress/components";

function BlockControls() {
  const { clientId } = useBlockEditContext();
  //@ts-ignore
  const block = useSelect((select) =>
    //@ts-ignore
    select("core/block-editor").getBlock(clientId)
  );
  const { updateBlockAttributes } = useDispatch("core/block-editor");
  const setAttributes = (newAttributes: object) => {
    updateBlockAttributes(clientId, newAttributes);
  };
  const attributes = block.attributes;
  const imageUrl = get(attributes.media, "url", "");
  const mediaId = get(attributes.media, "id", -1);

  return (
    //@ts-ignore
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
  );
}
export default BlockControls;
