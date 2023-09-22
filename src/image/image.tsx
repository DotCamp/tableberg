// @ts-ignore
import { get } from "lodash";
import type { ImageTypes } from "./types";
import {
  getBorderCSS,
  getSingleSideBorderValue,
} from "../utils/styling-helpers";

function Image(props: ImageTypes) {
  const { attributes, imageRef } = props;

  const sizeSlug = get(attributes, "sizeSlug", "large");
  const imageSrc = get(
    attributes,
    `media.sizes.${sizeSlug}.url`,
    attributes.media?.url ?? ""
  );
  const mediaAlt = get(attributes, "alt", "");
  const aspectRatio = get(attributes, "aspectRatio", "");
  const scale = get(attributes, "scale", "");
  const width = get(attributes, "width", "");
  const height = get(attributes, "height", "");
  const borderAttr = get(attributes, "border", "");
  const borderRadius = get(attributes, "borderRadius", "");
  const border = getBorderCSS(borderAttr);

  return (
    <img
      // @ts-ignore
      ref={imageRef}
      style={{
        aspectRatio,
        objectFit: scale,
        width,
        height,
        borderTopLeftRadius: borderRadius.topLeft,
        borderTopRightRadius: borderRadius.topRight,
        borderBottomLeftRadius: borderRadius.bottomLeft,
        borderBottomRightRadius: borderRadius.bottomRight,
        borderTop: getSingleSideBorderValue(border, "top"),
        borderRight: getSingleSideBorderValue(border, "right"),
        borderBottom: getSingleSideBorderValue(border, "bottom"),
        borderLeft: getSingleSideBorderValue(border, "left"),
      }}
      src={imageSrc}
      alt={mediaAlt}
    />
  );
}

export default Image;
