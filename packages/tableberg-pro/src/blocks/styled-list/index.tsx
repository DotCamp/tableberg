import { __ } from "@wordpress/i18n";

import { registerBlockType, createBlock } from "@wordpress/blocks";
import { InnerBlocks } from "@wordpress/block-editor";
import icon from "./icon";
import Edit from "./edit";
import listMetadata from "./block.json";

registerBlockType(listMetadata, {
    icon: icon,
    attributes: listMetadata.attributes,
    transforms: {
        from: [
            {
                type: "block",
                blocks: ["core/list"],
                transform: (attributes, innerBlocks) => {
                    if (attributes.ordered) {
                        console.log("cannot be used for ordered lists");
                        return null;
                    } else {
                        const convertSubitems = (subitems) =>
                            subitems.map((subitem) =>
                                createBlock(
                                    "tableberg/styled-list-item",
                                    {
                                        itemText: subitem.attributes.content,
                                    },
                                    subitem.innerBlocks.length > 0
                                        ? [
                                              createBlock(
                                                  "tableberg/styled-list",
                                                  attributes,
                                                  convertSubitems(
                                                      subitem.innerBlocks[0]
                                                          .innerBlocks,
                                                  ),
                                              ),
                                          ]
                                        : [],
                                ),
                            );

                        return createBlock(
                            "tableberg/styled-list",
                            attributes,
                            convertSubitems(innerBlocks),
                        );
                    }
                },
            },
        ],
    },
    example: {},
    edit: Edit,
    save: () => <InnerBlocks.Content />,
});
