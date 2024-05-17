import { TablebergBlockAttrs } from "@tableberg/shared/types";
import { ProBlockProps } from "..";
import RowColOnlyBorderControl from "../../shared/RowColOnlyBorderControl";
import { InspectorControls } from "@wordpress/block-editor";
import StickyRowColControl from "../../shared/StickyRowColControl";

const TablePro = ({ props, BlockEdit }: ProBlockProps<TablebergBlockAttrs>) => {
    return (
        <>
            {props.isSelected && (
                <RowColOnlyBorderControl
                    value={props.attributes.innerBorderType}
                    setAttr={props.setAttributes}
                    clientId={props.clientId}
                />
            )}
            <BlockEdit {...props} />
            {props.isSelected && (
                <InspectorControls>
                    <StickyRowColControl
                        attrs={props.attributes}
                        setAttrs={props.setAttributes}
                    />
                </InspectorControls>
            )}
        </>
    );
};

export default TablePro;
