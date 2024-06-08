import TablebergIcon from "@tableberg/shared/icons/tableberg";
import {
    AITableIcon,
    DataTableIcon,
    PostsTableIcon,
    PreBuiltTableIcon,
    WooTableIcon,
} from "@tableberg/shared/icons/table-creation";
import { TablebergBlockAttrs } from "@tableberg/shared/types";
import { BlockIcon, store } from "@wordpress/block-editor";
import {
    InnerBlockTemplate,
    createBlock,
    createBlocksFromInnerBlocksTemplate,
} from "@wordpress/blocks";
import {
    Button,
    Flex,
    Placeholder,
    TextControl,
    __experimentalGrid as Grid,
} from "@wordpress/components";
import { useDispatch } from "@wordpress/data";
import { useState } from "react";
import metadata from "../../block.json";
import PatternsLibrary from "./Patterns";

interface Props {
    clientId: string;
}

export default function TableCreator({ clientId }: Props) {
    const storeActions: BlockEditorStoreActions = useDispatch(store) as any;

    const [newTable, setNewTable] = useState({
        rows: 2,
        cols: 2,
    });

    const [modal, setModal] = useState<null | "patterns">(null);

    const onCreateNew = () => {
        const { rows, cols } = newTable;
        if (rows < 1 || cols < 1) return;

        let initialInnerBlocks: InnerBlockTemplate[] = [];
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                initialInnerBlocks.push(["tableberg/cell", { row: i, col: j }]);
            }
        }

        storeActions.replaceBlock(
            clientId,
            createBlock<TablebergBlockAttrs>(
                "tableberg/table",
                {
                    version: metadata.version,
                    hasTableCreated: true,
                    colWidths: Array(cols).fill(""),
                    rowHeights: Array(rows).fill(""),
                    cells: initialInnerBlocks.length,
                    ...newTable,
                },
                createBlocksFromInnerBlocksTemplate(initialInnerBlocks),
            ),
        );
    };

    return (
        <div className="tableberg-table-creator">
            <Placeholder
                label={"Tableberg"}
                icon={<BlockIcon icon={TablebergIcon} />}
                instructions={
                    "Please select which type of table you'd like to add, or create your own."
                }
            >
                <div className="tableberg-table-creator-flex">
                    <button className="tableberg-table-creator-btn">
                        <div className="tableberg-table-creator-btn-icon">
                            {DataTableIcon}
                        </div>
                        <span>Data Table (CSV, XML)</span>
                    </button>
                    <button className="tableberg-table-creator-btn">
                        <div className="tableberg-table-creator-btn-icon">
                            {WooTableIcon}
                        </div>
                        <span>WooCommerce Table</span>
                    </button>
                    <button className="tableberg-table-creator-btn">
                        <div className="tableberg-table-creator-btn-icon">
                            {AITableIcon}
                        </div>
                        <span>AI Table</span>
                    </button>
                    <button className="tableberg-table-creator-btn">
                        <div className="tableberg-table-creator-btn-icon">
                            {PostsTableIcon}
                        </div>
                        <span>Posts Table</span>
                    </button>
                    <button
                        className="tableberg-table-creator-btn"
                        onClick={() => setModal("patterns")}
                    >
                        <div className="tableberg-table-creator-btn-icon">
                            {PreBuiltTableIcon}
                        </div>
                        <span>Pre-Built Table</span>
                    </button>
                </div>
                <p className="tableberg-divider">
                    <span>or</span>
                </p>
                <Flex gap="10px" justify="center" align="end">
                    <TextControl
                        __nextHasNoMarginBottom
                        type="number"
                        label={"Column count"}
                        value={newTable.cols}
                        onChange={(count) => {
                            setNewTable({
                                ...newTable,
                                cols: Number(count),
                            });
                        }}
                        min="1"
                        className="blocks-table__placeholder-input"
                    />
                    <TextControl
                        __nextHasNoMarginBottom
                        type="number"
                        label={"Row count"}
                        value={newTable.rows}
                        onChange={(count) => {
                            setNewTable({
                                ...newTable,
                                rows: Number(count),
                            });
                        }}
                        min="1"
                        className="blocks-table__placeholder-input"
                    />
                    <Button
                        className="blocks-table__placeholder-button"
                        variant="primary"
                        onClick={onCreateNew}
                        type="button"
                    >
                        Create New
                    </Button>
                </Flex>
            </Placeholder>
            {modal === "patterns" && (
                <PatternsLibrary
                    onClose={() => setModal(null)}
                    onSelect={(b) => storeActions.replaceBlock(clientId, b)}
                />
            )}
        </div>
    );
}
