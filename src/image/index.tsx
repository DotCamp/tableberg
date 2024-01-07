import { registerBlockType } from "@wordpress/blocks";

import { image } from "@wordpress/icons";

import "./style.scss";
import edit from "./edit";

import metadata from "./block.json";

// @ts-ignore to remove this, we have to manually add the attributes
// from block.json, which is not very scalable or pleasant.
// We'll think of removing this @ts-ignore later
registerBlockType(metadata, {
    icon: image,
    title: metadata.title,
    category: metadata.category,
    edit,
    save: () => null,
});
