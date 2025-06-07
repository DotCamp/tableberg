import { useEffect, useState } from "react";
import apiFetch from "@wordpress/api-fetch";
import { PostsTableIcon } from "@tableberg/shared/icons/table-creation";
import {
    BlockEditProps,
    createBlock,
    createBlocksFromInnerBlocksTemplate,
    InnerBlockTemplate,
    registerBlockType,
} from "@wordpress/blocks";
import metadata from "./block.json";
import {
    InnerBlocks,
    useBlockProps,
    store as BlockEditorStore,
} from "@wordpress/block-editor";
import { useDispatch } from "@wordpress/data";
import PostsTableInspectorControls from "./PostsTableInspectorControls";
import AssignmentFactory, { AssignmentTypeId } from "./inc/AssignmentFactory";

interface PostsTableAttributes {
    postType: string;
    columns: string[];
}

const objectPropertyMapping = {
    title: "rendered",
};

function edit(props: BlockEditProps<PostsTableAttributes>) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const blockProps = useBlockProps();

    const { attributes, clientId } = props;
    const { postType, columns } = attributes;
    const [currentAssingments, setCurrentAssingments] = useState<
        Record<string, AssignmentTypeId>
    >({});

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const storeActions: BlockEditorStoreActions = useDispatch(
        BlockEditorStore
    ) as any;

    /**
     * Generates a tableberg cell block template.
     *
     * @param row           Row index.
     * @param column        Column index.
     * @param assignmentId  Assignment type ID.
     * @param propertyValue Value to assign to the cell.
     */
    const generateTablebergCell = (
        row: number,
        column: number,
        assignmentId: AssignmentTypeId,
        propertyValue: string | number | boolean
    ): InnerBlockTemplate => {
        const assignedBlockTemplate = AssignmentFactory.generateBlock(
            assignmentId,
            propertyValue
        );

        return [
            "tableberg/cell",
            { row, col: column },
            [[...assignedBlockTemplate]],
        ];
    };

    /**
     * Generates the title row for the table.
     *
     * @param columnIds Array of column IDs.
     *
     * @return Title row block template.
     */
    const generateTitle = (columnIds: string[]): Array<InnerBlockTemplate> => {
        return columnIds.map((column, index) => {
            const capitalizedColumn = column
                .replace("_acf", "")
                .replace(/_/g, " ")
                .replace(/\b\w/g, (char) => char.toUpperCase());

            // return textCell(capitalizedColumn, 0, index);
            return generateTablebergCell(0, index, "text", capitalizedColumn);
        });
    };

    /**
     * Gets the assignment type for a given column ID.
     *
     * @param columnId The ID of the column.
     *
     * @return The assignment type ID for the column.
     */
    const getAssignment = (columnId: string): AssignmentTypeId => {
        return currentAssingments[columnId] || "text";
    };

    /**
     * Handles changes to the assignment type for a column.
     *
     * @param columnId The ID of the column to change.
     * @param value    The new assignment type ID to set for the column.
     */
    const handleAssignmentChange = (
        columnId: string,
        value: AssignmentTypeId
    ) => {
        const newAssignments = { ...currentAssingments, [columnId]: value };
        setCurrentAssingments(newAssignments);
    };

    /**
     * Generates a cell block for the table based on target column.
     *
     * @param columnId   The ID of the column to generate the cell for.
     * @param row        Row index.
     * @param col        Column index.
     * @param rawContent The raw content to be displayed in the cell.
     *
     * @return Block template for the cell.
     */
    const getCell = (
        columnId: string,
        row: number,
        col: number,
        rawContent: string | number
    ): InnerBlockTemplate => {
        const columnAssignedType = getAssignment(columnId);

        switch (columnAssignedType) {
            case "date":
                return generateTablebergCell(
                    row,
                    col,
                    "text",
                    new Date(rawContent).toLocaleDateString()
                );
            case "text":
                return generateTablebergCell(
                    row,
                    col,
                    "text",
                    String(rawContent)
                );
            default:
                return generateTablebergCell(
                    row,
                    col,
                    columnAssignedType,
                    rawContent
                );
        }
    };

    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
        apiFetch<Array<object>>({
            path: `wp/v2/${postType}`,
            method: "GET",
        }).then((resp) => {
            const initialInnerBlocks: InnerBlockTemplate[] = [];

            initialInnerBlocks.push(...generateTitle(columns));

            for (let i = 0; i < resp.length; i++) {
                for (let j = 0; j < columns.length; j++) {
                    const currentColumn = columns[j];
                    // @ts-ignore
                    let currentCellContent = resp[i][currentColumn] || "";

                    if (objectPropertyMapping[currentColumn]) {
                        // @ts-ignore
                        currentCellContent =
                            resp[i][currentColumn][
                                objectPropertyMapping[currentColumn]
                            ];
                    }

                    if (currentColumn.includes("_acf")) {
                        currentCellContent =
                            resp[i].acf[currentColumn.replace("_acf", "")];
                    }

                    initialInnerBlocks.push(
                        getCell(
                            currentColumn,
                            i + 1, // +1 to account for header row
                            j,
                            currentCellContent
                        )
                    );
                }
            }

            const freshTable = createBlock(
                "tableberg/table",
                {
                    rows: resp.length + 1,
                    cols: columns.length,
                    cells: initialInnerBlocks.length,
                    enableTableHeader: true,
                    headerBackgroundColor: "#f1f1f1",
                    evenRowBackgroundColor: "rgba(0, 0, 0, 0.04)",
                },
                createBlocksFromInnerBlocksTemplate(initialInnerBlocks)
            );

            storeActions.replaceInnerBlocks(clientId, [freshTable], true);
        });
    }, [postType, columns, currentAssingments]);

    return (
        <div {...blockProps} className="tableberg-posts-table-block">
            <div>
                <InnerBlocks />
            </div>
            <PostsTableInspectorControls
                columnIds={columns}
                assignments={currentAssingments}
                handleAssignment={handleAssignmentChange}
                assignmentTypeList={AssignmentFactory.getAvailableAssignmentTypes()}
            />
        </div>
    );
}

registerBlockType(metadata as any, {
    icon: PostsTableIcon,
    attributes: metadata.attributes as any,
    edit,
    save: () => null,
});
