import { TablebergBlockAttrs } from "@tableberg/shared/types";
import { ProBlockProps } from "..";
import RowColOnlyBorderControl from "../../shared/RowColOnlyBorderControl";
import TableAndCellControl from "../TableAndCellControl";
import { createBlock } from "@wordpress/blocks";
import AITableModal from "../../ai-table/AITableModal";

interface TableProProps {
    onCreateWooTable: (
        storeActions: BlockEditorStoreActions
    ) => void;
    AITableModal: React.ComponentType<{
        onClose: () => void;
        onInsert: (block: any) => void;
        currentBlockId: string;
    }>;
}

const TablePro = ({ props, BlockEdit }: ProBlockProps<TablebergBlockAttrs>) => {
    const proProps: TableProProps = {
        onCreateWooTable: (storeActions) => {
            storeActions.replaceBlock(
                props.clientId, createBlock("tableberg-pro/woo")
            );
        },
        AITableModal: AITableModal
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
