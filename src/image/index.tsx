import { registerBlockType } from "@wordpress/blocks";

import { image } from "@wordpress/icons";

import "./style.scss";
import edit from "./edit";

import metadata from "./block.json";

registerBlockType(metadata, {
    icon: image,
    title: metadata.title,
    category: metadata.category,
    edit,
    save: () => null,
});
