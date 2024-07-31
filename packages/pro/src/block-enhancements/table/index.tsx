import { TablebergBlockAttrs } from "@tableberg/shared/types";
import { ProBlockProps } from "..";
import RowColOnlyBorderControl from "../../shared/RowColOnlyBorderControl";
import TableAndCellControl from "../TableAndCellControl";

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
                <TableAndCellControl
                    tableAttrs={props.attributes}
                    setTableAttrs={props.setAttributes}
                />
            )}
        </>
    );
};

export default TablePro;
