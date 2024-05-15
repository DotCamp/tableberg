import { createHigherOrderComponent } from "@wordpress/compose";
import { addFilter } from "@wordpress/hooks";

import { CellBlockPro } from "./cell";
import { BlockEditProps } from "@wordpress/blocks";

export interface ProBlockProps<T extends Record<string, any>> {
    props: BlockEditProps<T>;
    BlockEdit: any;
}


const ProEnhancements = createHigherOrderComponent((BlockEdit) => {
    return (props) => {
        if (props.name !== "tableberg/cell") {
            return <BlockEdit {...props} />;
        }
        return <CellBlockPro props={props} BlockEdit={BlockEdit} />;
    };
}, "tableberg/pro-enhancements");

addFilter("editor.BlockEdit", "tableberg/cell", ProEnhancements);
