import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClose } from "@fortawesome/free-solid-svg-icons";
import { FormEvent, useState } from "react";
import {
    Button,
    MenuGroup,
    MenuItem,
    Placeholder,
    SearchControl,
    TextControl,
} from "@wordpress/components";

import { blockTable } from "@wordpress/icons";
import TablebergIcon from "@tableberg/shared/icons/tableberg";
import { BlockIcon } from "@wordpress/block-editor";
import {
    InnerBlockTemplate,
    createBlocksFromInnerBlocksTemplate,
} from "@wordpress/blocks";
import {
    TablebergBlockAttrs,
    TablebergCellInstance,
} from "@tableberg/shared/types";

interface PatternLibraryProps {
    onSelect: (
        attrs: Partial<TablebergBlockAttrs>,
        innerBlocks: TablebergCellInstance[],
    ) => void;
    onClose: () => void;
}

const PATTERNT_TYPES = [
    {
        title: "Primary",
        count: 0,
    },
    {
        title: "Stack Row",
        count: 0,
    },
    {
        title: "Stack Col",
        count: 0,
    },
];

function IconsLibrary({ onSelect, onClose }: PatternLibraryProps) {
    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("");
    const [newTable, setNewTable] = useState({
        rows: 2,
        cols: 2,
    });

    const onCreateTable = (evt: FormEvent) => {
        evt.preventDefault();
        const { rows, cols } = newTable;
        if (rows < 1 || cols < 1) return;

        let initialInnerBlocks: InnerBlockTemplate[] = [];
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                initialInnerBlocks.push(["tableberg/cell", { row: i, col: j }]);
            }
        }

        onSelect(
            {
                colWidths: Array(cols).fill(""),
                rowHeights: Array(rows).fill(""),
                cells: initialInnerBlocks.length,
                ...newTable,
            },
            createBlocksFromInnerBlocksTemplate(initialInnerBlocks) as any,
        );
    };

    return (
        <div className="tableberg-pattern-library-modal">
            <div className="tableberg-pattern-library-sidebar">
                <div className="tableberg-pattern-library-sidebar-header">
                    {TablebergIcon} <h2>Tableberg</h2>
                </div>
                <MenuGroup className="tableberg-pattern-library-types">
                    <MenuItem
                        key={""}
                        className="tableberg_icons_library_sidebar_item"
                        // @ts-ignore
                        isPressed={categoryFilter === ""}
                        onClick={() => {
                            setCategoryFilter("");
                        }}
                    >
                        <span>All</span>
                    </MenuItem>
                    {PATTERNT_TYPES.map((cat) => {
                        return (
                            <MenuItem
                                key={cat.title}
                                className="tableberg_icons_library_sidebar_item"
                                // @ts-ignore
                                isPressed={categoryFilter === cat.title}
                                onClick={() => {
                                    setCategoryFilter(cat.title);
                                }}
                            >
                                <span>{cat?.title}</span>
                                <span>{cat?.count}</span>
                            </MenuItem>
                        );
                    })}
                </MenuGroup>
            </div>
            <div className="tableberg-pattern-library-content">
                <div className="tableberg-pattern-library-content-header">
                    <span>Search</span>
                    <SearchControl
                        value={search}
                        onChange={setSearch}
                        size="compact"
                        placeholder=""
                    />
                    <button onClick={onClose}>
                        <FontAwesomeIcon icon={faClose} />
                    </button>
                </div>
                <div className="tableberg-pattern-library-body">
                    <div
                        style={{
                            gridColumn: "1 / span 3",
                            gridRow: "1 / span 2",
                        }}
                    >
                        <Placeholder
                            label={"Create Tableberg Table"}
                            icon={<BlockIcon icon={blockTable} showColors />}
                            instructions={
                                "Create a complex table with all types of element"
                            }
                        >
                            <form
                                className="blocks-table__placeholder-form"
                                onSubmit={onCreateTable}
                            >
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
                                    type="submit"
                                >
                                    {"Create Table"}
                                </Button>
                            </form>
                        </Placeholder>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default IconsLibrary;
