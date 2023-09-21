// @ts-ignore
import { get, has, isEmpty } from "lodash";
import { MainPropTypes } from "./types";

function Image(props: MainPropTypes) {
  const { attributes } = props;

  const sizeSlug = get(attributes, "sizeSlug", "large");
  const imageSrc = get(attributes, `media.sizes.${sizeSlug}.url`, "");
  const mediaAlt = get(attributes, "alt", "");
  const aspectRatio = get(attributes, "aspectRatio", "");
  const scale = get(attributes, "scale", "");
  const width = get(attributes, "width", "");
  const height = get(attributes, "height", "");

  return (
    <img
      style={{ aspectRatio, objectFit: scale, width, height }}
      src={imageSrc}
      alt={mediaAlt}
    />
  );
}

export default Image;
