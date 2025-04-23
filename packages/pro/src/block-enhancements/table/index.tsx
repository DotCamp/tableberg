import { TablebergBlockAttrs } from "@tableberg/shared/types";
import { ProBlockProps } from "..";
import RowColOnlyBorderControl from "../../shared/RowColOnlyBorderControl";
import TableAndCellControl from "../TableAndCellControl";
import { createBlock } from "@wordpress/blocks";

interface TableProProps {
    onCreateWooTable: (
        storeActions: BlockEditorStoreActions
    ) => void;
}

const TablePro = ({ props, BlockEdit }: ProBlockProps<TablebergBlockAttrs>) => {
    const proProps: TableProProps = {
        onCreateWooTable: (storeActions) => {
            storeActions.replaceBlock(
                props.clientId, createBlock("tableberg-pro/woo")
            );
        }
    };

    return (
        <>
            {props.isSelected && (
                <RowColOnlyBorderControl
                    value={props.attributes.innerBorderType}
                    setAttr={props.setAttributes}
                    clientId={props.clientId}
                />
            )}
            <BlockEdit {...props} proProps={proProps} />
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
