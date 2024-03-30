import { __ } from "@wordpress/i18n";

import { registerBlockType } from "@wordpress/blocks";
import { InnerBlocks } from "@wordpress/block-editor";
import { listItemIcon } from "../icon";
import Edit from "./edit";
import listItemMetaData from "./block.json";

registerBlockType(listItemMetaData, {
    icon: listItemIcon,
    attributes: listItemMetaData.attributes,
    edit: Edit,
    save: () => <InnerBlocks.Content />,
});
