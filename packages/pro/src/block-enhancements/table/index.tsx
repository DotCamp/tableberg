import { TablebergBlockAttrs } from "@tableberg/shared/types";
import { ProBlockProps } from "..";
import RowColOnlyBorderControl from "../../shared/RowColOnlyBorderControl";

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
        </>
    );
};

export default TablePro;
