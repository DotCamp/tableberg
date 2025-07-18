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
    cloneBlock,
    createBlock,
    createBlocksFromInnerBlocksTemplate,
} from "@wordpress/blocks";
import { Button, Flex, Placeholder, TextControl } from "@wordpress/components";
import { useDispatch } from "@wordpress/data";
import { useState } from "react";
import metadata from "../../block.json";
import PatternsLibrary from "./Patterns";
import LockedTableType from "../../components/LockedTableType";

interface Props {
    clientId: string;
}

export default function TableCreator({ clientId, proProps }: Props) {
    const storeActions: BlockEditorStoreActions = useDispatch(store) as any;

    const [rows, setRows] = useState<number | undefined>(4);
    const [cols, setCols] = useState<number | undefined>(4);

    const [modal, setModal] = useState<null | "patterns">(null);

    const onCreateNew = () => {
        if (!rows || !cols) return;
        if (rows < 1 || cols < 1) return;

        let initialInnerBlocks: InnerBlockTemplate[] = [];
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                initialInnerBlocks.push([
                    "tableberg/cell",
                    { row: i, col: j },
                    [["core/paragraph"]],
                ]);
            }
        }

        storeActions.replaceInnerBlocks(
            clientId,
            createBlocksFromInnerBlocksTemplate(initialInnerBlocks),
        );

        storeActions.updateBlockAttributes(clientId, {
            version: metadata.version,
            cells: initialInnerBlocks.length,
            rows,
            cols,
        });
    };

    const IS_PRO = TABLEBERG_CFG.IS_PRO;

    return (
        <div className="tableberg-table-creator">
            <Placeholder
                label={"Tableberg"}
                icon={<BlockIcon icon={TablebergIcon} />}
            >
                <div className="tableberg-table-creator-heading">
                    Create Blank Table
                </div>
                <Flex gap="10px" justify="center" align="end">
                    <TextControl
                        __nextHasNoMarginBottom
                        type="number"
                        label={"Column count"}
                        value={String(cols)}
                        onChange={(count) => {
                            setCols(count === "" ? undefined : Number(count));
                        }}
                        min="1"
                        className="blocks-table__placeholder-input"
                    />
                    <TextControl
                        __nextHasNoMarginBottom
                        type="number"
                        label={"Row count"}
                        value={String(rows)}
                        onChange={(count) => {
                            setRows(count === "" ? undefined : Number(count));
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
                        Create
                    </Button>
                </Flex>
                <p className="tableberg-divider">
                    <span>or</span>
                </p>
                <div className="tableberg-table-creator-flex">
                    <button
                        className="tableberg-table-creator-btn"
                        onClick={() => setModal("patterns")}
                    >
                        <div className="tableberg-table-creator-btn-icon">
                            {PreBuiltTableIcon}
                        </div>
                        <span>Pre-Built Table</span>
                    </button>
                    {!IS_PRO ? (
                        <LockedTableType
                            icon={WooTableIcon}
                            selected={"product-table"}
                            name={"WooCommerce Table"}
                            link={
                                "https://tableberg.com/woocommerce-product-table-plugin/"
                            }
                        />
                    ) : (
                        <button
                            className="tableberg-table-creator-btn"
                            onClick={() =>
                                proProps.onCreateWooTable(storeActions)
                            }
                        >
                            <div className="tableberg-table-creator-btn-icon">
                                {WooTableIcon}
                            </div>
                            <span>WooCommerce Table</span>
                        </button>
                    )}
                    <button className="tableberg-table-creator-btn tableberg-upcoming">
                        <div className="tableberg-table-creator-btn-icon">
                            {DataTableIcon}
                        </div>
                        <span>Data Table (CSV, XML)</span>
                    </button>
                    <button className="tableberg-table-creator-btn tableberg-upcoming">
                        <div className="tableberg-table-creator-btn-icon">
                            {AITableIcon}
                        </div>
                        <span>AI Table</span>
                    </button>
                    <button className="tableberg-table-creator-btn tableberg-upcoming">
                        <div className="tableberg-table-creator-btn-icon">
                            {PostsTableIcon}
                        </div>
                        <span>Posts Table</span>
                    </button>
                </div>
            </Placeholder>
            {modal === "patterns" && (
                <PatternsLibrary
                    onClose={() => setModal(null)}
                    onSelect={(b) =>
                        storeActions.replaceBlock(clientId, cloneBlock(b))
                    }
                />
            )}
        </div>
    );
}
