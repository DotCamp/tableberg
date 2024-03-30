import { __ } from "@wordpress/i18n";
import metadata from "./block.json";
import { registerBlockType } from "@wordpress/blocks";
import { BlockIcon } from "./icons";
import Edit from "./edit";

registerBlockType(metadata, {
    icon: BlockIcon,
    attributes: metadata.attributes,
    example: {
        attributes: {
            selectedStars: 4,
        },
    },
    edit: Edit,
    save: () => null,
});
