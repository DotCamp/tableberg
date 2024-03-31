import { __ } from "@wordpress/i18n";
import metadata from "./block.json";
import { registerBlockType } from "@wordpress/blocks";
import Edit from "./edit";
import { html } from "@wordpress/icons";

registerBlockType(metadata, {
    icon: html,
    attributes: metadata.attributes,
    example: {
        attributes: {
            selectedStars: 4,
        },
    },
    edit: Edit,
    save: () => null,
});
