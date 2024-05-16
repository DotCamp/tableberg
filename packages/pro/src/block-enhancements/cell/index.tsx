import {
    BlockControls,
    InspectorControls,
    store as blockEditorStore,
} from "@wordpress/block-editor";
import {
    PanelBody,
    ToggleControl,
    ToolbarDropdownMenu,
} from "@wordpress/components";
import { ColorControl } from "@tableberg/components";

import { useDispatch, useSelect } from "@wordpress/data";

import { copy, columns, tableRowAfter } from "@wordpress/icons";

import { DropdownOption } from "@wordpress/components/build-types/dropdown-menu/types";
import { BlockInstance, cloneBlock } from "@wordpress/blocks";
import {
    TablebergBlockAttrs,
    TablebergCellBlockAttrs,
    TablebergCellInstance,
} from "@tableberg/shared/types";
import { ProBlockProps } from "..";
import RowColOnlyBorderControl from "../../shared/RowColOnlyBorderControl";

const duplicateRow = (
    tableBlock: BlockInstance<TablebergBlockAttrs>,
    storeActions: BlockEditorStoreActions,
    rowIndex: number,
    count: number = 1,
) => {
    const cellBlocks: TablebergCellInstance[] = [];
    const cells: TablebergCellInstance[] = tableBlock.innerBlocks as any;

    let startRow = rowIndex,
        endRow = rowIndex + count;

    for (let i = 0; i < cells.length; i++) {
        const { row, rowspan } = cells[i].attributes;

        if (row < startRow && row + rowspan > startRow) {
            startRow = row;
            i = -1;
        }

        if (row <= startRow && row + rowspan > endRow) {
            endRow = row + rowspan;
            i = -1;
        }
    }

    count = endRow - startRow;

    const clonedCells: TablebergCellInstance[] = [];
    let startIdx = 0;

    cells.forEach((cell) => {
        if (cell.attributes.row < startRow) {
            cellBlocks.push(cell);
            return;
        }
        if (cell.attributes.row >= endRow) {
            cell.attributes.row += count;
            cellBlocks.push(cell);
            startIdx = cellBlocks.length;
            return;
        }
        const newCell = cloneBlock(cell);
        newCell.attributes.row += count;
        clonedCells.push(newCell);
        cellBlocks.push(cell);
    });

    if (startIdx === 0) {
        startIdx = cellBlocks.length;
    }
    cellBlocks.splice(startIdx, 0, ...clonedCells);

    const rowHeights = tableBlock.attributes.rowHeights;
    const copyHeights = rowHeights.slice(startRow, endRow);
    rowHeights.splice(endRow, 0, ...copyHeights);

    storeActions.replaceInnerBlocks(tableBlock.clientId, cellBlocks, false);
    storeActions.updateBlockAttributes(tableBlock.clientId, {
        rows: tableBlock.attributes.rows + count,
        cells: cellBlocks.length,
        rowHeights,
    });
};

const duplicateCol = (
    tableBlock: BlockInstance<TablebergBlockAttrs>,
    storeActions: BlockEditorStoreActions,
    colIndex: number,
    count: number = 1,
) => {
    const cellBlocks: TablebergCellInstance[] = [];
    const cells: TablebergCellInstance[] = tableBlock.innerBlocks as any;

    let startCol = colIndex,
        endCol = colIndex + count;

    for (let i = 0; i < cells.length; i++) {
        const { col, colspan } = cells[i].attributes;

        if (col < startCol && col + colspan > startCol) {
            startCol = col;
            i = -1;
        }

        if (col <= startCol && col + colspan > endCol) {
            endCol = col + colspan;
            i = -1;
        }
    }

    count = endCol - startCol;

    let lastInsertedRow = -1;
    let pendingCells: TablebergCellInstance[] = [];

    cells.forEach((cell) => {
        if (
            pendingCells.length > 0 &&
            (lastInsertedRow !== cell.attributes.row ||
                cell.attributes.col >= endCol)
        ) {
            lastInsertedRow = cell.attributes.row;
            cellBlocks.push(...pendingCells);
            pendingCells = [];
        }
        if (cell.attributes.col < startCol) {
            cellBlocks.push(cell);
            return;
        }
        if (cell.attributes.col >= endCol) {
            cell.attributes.col += count;
            cellBlocks.push(cell);
            return;
        }
        const newCell = cloneBlock(cell);
        newCell.attributes.col += count;
        pendingCells.push(newCell);
        cellBlocks.push(cell);
    });

    if (pendingCells.length > 0) {
        cellBlocks.push(...pendingCells);
        pendingCells = [];
    }

    const colWidths = tableBlock.attributes.colWidths;
    const copyWidths = colWidths.slice(startCol, endCol);
    colWidths.splice(endCol, 0, ...copyWidths);

    storeActions.replaceInnerBlocks(tableBlock.clientId, cellBlocks, false);
    storeActions.updateBlockAttributes(tableBlock.clientId, {
        cols: tableBlock.attributes.cols + count,
        cells: cellBlocks.length,
        colWidths,
    });
};

export const CellBlockPro = ({
    props,
    BlockEdit,
}: ProBlockProps<TablebergCellBlockAttrs>) => {
    const storeActions: BlockEditorStoreActions = useDispatch(
        blockEditorStore,
    ) as any;

    const { storeSelect, tableAttrs, setTableAttrs } = useSelect((select) => {
        const storeSelect: BlockEditorStoreSelectors = select(
            blockEditorStore,
        ) as any;

        const tableBlockId = storeSelect.getBlockRootClientId(props.clientId)!;
        const tableBlock = storeSelect.getBlock(tableBlockId)!;

        const setTableAttrs = (attrs: Partial<TablebergBlockAttrs>) =>
            storeActions.updateBlockAttributes(tableBlockId, attrs);

        return {
            storeSelect,
            tableBlock,
            tableAttrs: tableBlock.attributes as TablebergBlockAttrs,
            setTableAttrs,
        };
    }, []);

    const attrs = props.attributes;

    const tableControls: DropdownOption[] = [
        {
            icon: tableRowAfter,
            title: "Duplicate this row",
            onClick: () => {
                const tableBlock: any = storeSelect.getBlock(
                    storeSelect.getBlockRootClientId(props.clientId)!,
                )!;
                duplicateRow(tableBlock, storeActions, props.attributes.row);
            },
        },
        {
            icon: columns,
            title: "Duplicate the column",
            onClick: () => {
                const tableBlock: any = storeSelect.getBlock(
                    storeSelect.getBlockRootClientId(props.clientId)!,
                )!;
                duplicateCol(tableBlock, storeActions, props.attributes.col);
            },
        },
    ];
    return (
        <>
            {props.isSelected && (
                <RowColOnlyBorderControl
                    value={tableAttrs.innerBorderType}
                    setAttr={setTableAttrs}
                    clientId={props.clientId}
                />
            )}
            <BlockEdit {...props} />
            {props.isSelected && (
                <>
                    <InspectorControls group="color">
                        <ColorControl
                            allowGradient
                            label="[PRO] Cell Background"
                            colorValue={attrs.background}
                            gradientValue={attrs.bgGradient}
                            onColorChange={(background) =>
                                props.setAttributes({ background })
                            }
                            onGradientChange={(bgGradient) =>
                                props.setAttributes({ bgGradient })
                            }
                            onDeselect={() =>
                                props.setAttributes({
                                    background: undefined,
                                    bgGradient: undefined,
                                })
                            }
                        />
                    </InspectorControls>
                    <InspectorControls>
                        <PanelBody title="[PRO] Table Sticky Row/Col">
                            <ToggleControl
                                checked={tableAttrs.stickyTopRow}
                                label="Sticky Top Row"
                                onChange={(stickyTopRow) => {
                                    setTableAttrs({
                                        stickyTopRow,
                                    });
                                }}
                            />
                            <ToggleControl
                                checked={tableAttrs.stickyFirstCol}
                                label="Sticky First Col"
                                onChange={(stickyFirstCol) => {
                                    setTableAttrs({
                                        stickyFirstCol,
                                    });
                                }}
                            />
                        </PanelBody>
                    </InspectorControls>
                </>
            )}
            <BlockControls group="other" __experimentalShareWithChildBlocks>
                <ToolbarDropdownMenu
                    icon={copy}
                    label={"[Pro] Edit table"}
                    controls={tableControls}
                />
            </BlockControls>
        </>
    );
};
