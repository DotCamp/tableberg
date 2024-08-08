import { registerBlockType } from "@wordpress/blocks";

import imageBlockIcon from "@tableberg/shared/icons/image";

import "./style.scss";
import edit from "./edit";

import metadata from "./block.json";

// @ts-ignore to remove this, we have to manually add the attributes
// from block.json, which is not very scalable or pleasant.
// We'll think of removing this @ts-ignore later
registerBlockType(metadata, {
    icon: imageBlockIcon,
    title: metadata.title,
    category: metadata.category,
    edit,
    save: () => null,
});
