import {
    BlockControls,
    InspectorControls,
    store as blockEditorStore,
} from "@wordpress/block-editor";
import { ToolbarDropdownMenu } from "@wordpress/components";
import { BorderWithRadiusControl, ColorControl } from "@tableberg/components";

import { useDispatch, useSelect } from "@wordpress/data";

import { arrowUp, arrowDown, arrowLeft, arrowRight } from "@wordpress/icons";

import { DropdownOption } from "@wordpress/components/build-types/dropdown-menu/types";
import { BlockInstance, cloneBlock } from "@wordpress/blocks";
import {
    TablebergBlockAttrs,
    TablebergCellBlockAttrs,
    TablebergCellInstance,
} from "@tableberg/shared/types";

import {
    DuplicateRowIcon,
    DuplicateColumnIcon,
} from "@tableberg/shared/icons/enhancements";
import TablebergProIcon from "@tableberg/shared/icons/tableberg-pro";

import { ProBlockProps } from "..";
import RowColOnlyBorderControl from "../../shared/RowColOnlyBorderControl";
import StickyRowColControl from "../../shared/StickyRowColControl";
import { DragNDropSorting, moveCol, moveRow } from "./drag-sort";

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
    let isInserted = false;

    cells.forEach((cell) => {
        if (cell.attributes.row < startRow) {
            cellBlocks.push(cell);
            return;
        }
        if (cell.attributes.row >= endRow) {
            if (!isInserted) {
                cellBlocks.push(...clonedCells);
                isInserted = true;
            }
            cell.attributes.row += count;
            cellBlocks.push(cell);
            return;
        }
        cellBlocks.push(cell);
        const newCell = cloneBlock(cell);
        newCell.attributes.row += count;
        clonedCells.push(newCell);
    });

    if (!isInserted) {
        cellBlocks.push(...clonedCells);
    }

    const rowStyles = { ...tableBlock.attributes.rowStyles };

    for (let i = 0; i < count; i++) {
        rowStyles[endRow + i] = {
            ...rowStyles[startRow + i],
        };
    }

    storeActions.replaceInnerBlocks(tableBlock.clientId, cellBlocks, false);
    storeActions.updateBlockAttributes(tableBlock.clientId, {
        rows: tableBlock.attributes.rows + count,
        cells: cellBlocks.length,
        rowStyles,
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

    const colStyles = { ...tableBlock.attributes.colStyles };

    for (let i = 0; i < count; i++) {
        colStyles[endCol + i] = {
            ...colStyles[startCol + i],
        };
    }

    storeActions.replaceInnerBlocks(tableBlock.clientId, cellBlocks, false);
    storeActions.updateBlockAttributes(tableBlock.clientId, {
        cols: tableBlock.attributes.cols + count,
        cells: cellBlocks.length,
        colStyles,
    });
};

export const CellBlockPro = ({
    props,
    BlockEdit,
}: ProBlockProps<TablebergCellBlockAttrs>) => {
    const storeActions: BlockEditorStoreActions = useDispatch(
        blockEditorStore,
    ) as any;

    const {
        storeSelect,
        tableAttrs,
        setTableAttrs,
        tableBlock,
        rowStyle,
        colStyle,
    } = useSelect((select) => {
        const storeSelect: BlockEditorStoreSelectors = select(
            blockEditorStore,
        ) as any;

        const tableBlockId = storeSelect.getBlockRootClientId(props.clientId)!;
        const tableBlock = storeSelect.getBlock(tableBlockId)!;

        const setTableAttrs = (attrs: Partial<TablebergBlockAttrs>) =>
            storeActions.updateBlockAttributes(tableBlockId, attrs);
        const tableAttrs = tableBlock.attributes as TablebergBlockAttrs;

        return {
            storeSelect,
            tableBlock,
            tableAttrs,
            setTableAttrs,
            rowStyle: tableAttrs.rowStyles[props.attributes.row],
            colStyle: tableAttrs.colStyles[props.attributes.col],
        };
    }, []);

    const attrs = props.attributes;

    const makeMove = (ctx: any) => {
        const tableBlockFresh = storeSelect.getBlock(
            tableBlock.clientId,
        )! as any;
        const subject = ctx.startInstance;
        const target = ctx.overInstance;

        if (ctx.type === "row") {
            moveRow(storeActions, tableBlockFresh, subject.row, target.row);
        } else {
            moveCol(storeActions, tableBlockFresh, subject.col, target.col);
        }
    };
    const setRowStyle = (styles: TablebergBlockAttrs["rowStyles"][number]) => {
        const rowStyles = { ...tableAttrs.rowStyles };
        rowStyles[attrs.row] = {
            ...rowStyles[attrs.row],
            ...styles,
        };
        setTableAttrs({ rowStyles });
    };
    const setColStyle = (styles: TablebergBlockAttrs["colStyles"][number]) => {
        const colStyles = { ...tableAttrs.colStyles };
        colStyles[attrs.col] = {
            ...colStyles[attrs.col],
            ...styles,
        };
        setTableAttrs({ colStyles });
    };

    const proProps = { DragNDropSorting, makeMove };

    const tableControls: DropdownOption[] = [
        {
            icon: DuplicateRowIcon,
            title: "Duplicate this row",
            onClick: () => {
                const tableBlock: any = storeSelect.getBlock(
                    storeSelect.getBlockRootClientId(props.clientId)!,
                )!;
                duplicateRow(tableBlock, storeActions, props.attributes.row);
            },
        },
        {
            icon: DuplicateColumnIcon,
            title: "Duplicate this column",
            onClick: () => {
                const tableBlock: any = storeSelect.getBlock(
                    storeSelect.getBlockRootClientId(props.clientId)!,
                )!;
                duplicateCol(tableBlock, storeActions, props.attributes.col);
            },
        },
        {
            icon: arrowRight,
            title: "Move column to right",
            onClick: () => {
                const tableBlock: any = storeSelect.getBlock(
                    storeSelect.getBlockRootClientId(props.clientId)!,
                )!;
                moveCol(
                    storeActions,
                    tableBlock,
                    props.attributes.col,
                    props.attributes.col + 1,
                );
            },
            isDisabled: props.attributes.col == tableAttrs.cols - 1,
        },
        {
            icon: arrowLeft,
            title: "Move column to left",
            onClick: () => {
                const tableBlock: any = storeSelect.getBlock(
                    storeSelect.getBlockRootClientId(props.clientId)!,
                )!;
                moveCol(
                    storeActions,
                    tableBlock,
                    props.attributes.col,
                    props.attributes.col - 1,
                );
            },
            isDisabled: props.attributes.col == 0,
        },
        {
            icon: arrowUp,
            title: "Move row up",
            onClick: () => {
                const tableBlock: any = storeSelect.getBlock(
                    storeSelect.getBlockRootClientId(props.clientId)!,
                )!;
                moveRow(
                    storeActions,
                    tableBlock,
                    props.attributes.row,
                    props.attributes.row - 1,
                );
            },
            isDisabled: props.attributes.row == 0,
        },
        {
            icon: arrowDown,
            title: "Move row down",
            onClick: () => {
                const tableBlock: any = storeSelect.getBlock(
                    storeSelect.getBlockRootClientId(props.clientId)!,
                )!;
                moveRow(
                    storeActions,
                    tableBlock,
                    props.attributes.row,
                    props.attributes.row + 1,
                );
            },
            isDisabled: props.attributes.row == tableAttrs.rows - 1,
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
            <BlockEdit {...props} proProps={proProps} />
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
                        <ColorControl
                            label="[PRO] Row Background Color"
                            colorValue={rowStyle?.background}
                            gradientValue={rowStyle?.bgGradient}
                            onColorChange={(background: any) =>
                                setRowStyle({ background })
                            }
                            allowGradient
                            onGradientChange={(bgGradient: any) =>
                                setRowStyle({
                                    bgGradient,
                                })
                            }
                            onDeselect={() =>
                                setRowStyle({
                                    background: undefined,
                                    bgGradient: undefined,
                                })
                            }
                        />
                        <ColorControl
                            label="[PRO] Col Background Color"
                            colorValue={colStyle?.background}
                            gradientValue={colStyle?.bgGradient}
                            onColorChange={(background: any) =>
                                setColStyle({ background })
                            }
                            allowGradient
                            onGradientChange={(bgGradient: any) =>
                                setColStyle({
                                    bgGradient,
                                })
                            }
                            onDeselect={() =>
                                setColStyle({
                                    background: undefined,
                                    bgGradient: undefined,
                                })
                            }
                        />
                    </InspectorControls>
                    <InspectorControls>
                        <StickyRowColControl
                            attrs={tableAttrs}
                            setAttrs={setTableAttrs}
                        />
                    </InspectorControls>
                    <InspectorControls group="border">
                        <BorderWithRadiusControl
                            isShownByDefault={false}
                            label="[PRO] Row Border"
                            value={rowStyle?.border}
                            onChange={(border) => {
                                setRowStyle({ border });
                            }}
                            radiusValue={rowStyle?.borderRadius}
                            onRadiusChange={(borderRadius) => {
                                setRowStyle({ borderRadius });
                            }}
                            onDeselect={() => null}
                        />
                        <BorderWithRadiusControl
                            isShownByDefault={false}
                            label="[PRO] Col Border"
                            value={colStyle?.border}
                            onChange={(border) => {
                                setColStyle({ border });
                            }}
                            radiusValue={colStyle?.borderRadius}
                            onRadiusChange={(borderRadius) => {
                                setColStyle({ borderRadius });
                            }}
                            onDeselect={() => null}
                        />
                    </InspectorControls>
                </>
            )}
            <BlockControls group="other" __experimentalShareWithChildBlocks>
                <ToolbarDropdownMenu
                    icon={TablebergProIcon}
                    label={"[Pro] Edit table"}
                    controls={tableControls}
                />
            </BlockControls>
        </>
    );
};
