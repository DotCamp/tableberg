import { BlockEditProps, BlockInstance, cloneBlock } from "@wordpress/blocks";
import {
    TablebergBlockAttrs,
    TablebergCellInstance,
} from "@tableberg/shared/types";
import {
    useInnerBlocksProps,
    store as blockEditorStore,
} from "@wordpress/block-editor";
import { useEffect, useLayoutEffect, useState } from "react";
import { ALLOWED_BLOCKS } from ".";
import { useDispatch } from "@wordpress/data";
import { getStyles } from "./get-styles";
import classNames from "classnames";
import { getStyleClass } from "./get-classes";
import {
    getBorderCSS,
    getBorderRadiusCSS,
} from "@tableberg/shared/utils/styling-helpers";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";

export default function StackColTable(
    props: BlockEditProps<TablebergBlockAttrs> & {
        tableBlock: BlockInstance<TablebergBlockAttrs>;
        preview: keyof TablebergBlockAttrs["responsive"]["breakpoints"];
    },
) {
    const { attributes, tableBlock, clientId, setAttributes, preview } = props;

    const innerBlocksProps = useInnerBlocksProps({
        // @ts-ignore false can obviously be assigned to renderAppender as does
        // wordpress in their own blocks. Need to make a pr to @types/wordpress__block-editor.
        renderAppender: false,
        allowedBlocks: ALLOWED_BLOCKS,
    });

    const blockProps = {
        style: {
            ...getStyles(attributes),
            maxWidth: attributes.tableWidth,
            width: attributes.tableWidth,
        },
        className: classNames(
            getStyleClass(attributes),
            "tableberg-colstack-table",
        ),
    } as Record<string, any>;

    const [rowTemplates, setRowTemplates] = useState<React.ReactElement[]>([]);
    const [colUpt, setColUpt] = useState(0);

    useEffect(() => {
        setColUpt((old) => old + 1);
    }, [attributes.cols, attributes.cells]);

    const storeActions: BlockEditorStoreActions = useDispatch(
        blockEditorStore,
    ) as any;

    const breakpoints = tableBlock.attributes.responsive.breakpoints;
    const breakpoint =
        preview == "mobile" && !breakpoints[preview]
            ? breakpoints.tablet
            : breakpoints[preview];

    useLayoutEffect(() => {
        if (!breakpoint) {
            return;
        }

        const moveCellToRow = (cell: TablebergCellInstance, row: number, setTemp = false) => {
            cell.attributes.responsiveTarget = `#tableberg-${clientId}-${row}`;
            if (row > attributes.rows - 1) {
                cell.attributes.isTmp = setTemp;
            }
            return cell;
        }

        const generateEmptyRows = (numberOfRows: number) => {
            const templates: React.ReactElement[] = [];
            for (let i = 0; i < numberOfRows; i++) {
                const Row = ({ rowClass = "row" }) => <tr
                    id={`tableberg-${clientId}-${i}`}
                    className={`tableberg-${rowClass}`}
                />;

                const isHeaderRow = i % attributes.rows === 0;
                const isFooterRow = i % attributes.rows === attributes.rows - 1;

                if (attributes.enableTableHeader && isHeaderRow) {
                    templates.push(<Row rowClass="header" />);
                } else if (attributes.enableTableFooter && isFooterRow) {
                    templates.push(<Row rowClass="footer" />);
                } else if (i % 2 === 0) {
                    templates.push(<Row rowClass="even-row" />);
                } else if (i % 2 !== 0) {
                    templates.push(<Row rowClass="odd-row" />);
                }
            }
            return templates;
        }

        const cellsWithHeadersAsLeftCol = (colCells: TablebergCellInstance[], numRows: number) => {
            const newCells: TablebergCellInstance[] = [];
            for (let row = 0; row < numRows; row++) {
                const col1Cell = cloneBlock(colCells[row % attributes.rows]) as TablebergCellInstance;
                if (col1Cell.attributes.isTmp) {
                    continue;
                }

                const setTemp = row > (attributes.rows - 1) ? true : false;
                newCells.push(moveCellToRow(col1Cell, row, setTemp));
            }
            return newCells;
        }

        const generateCellsWithCorrectRows = (cells: TablebergCellInstance[]) => {
            const newCells: TablebergCellInstance[] = [];
            for (const cell of cells) {
                if (cell.attributes.isTmp) {
                    continue;
                }

                const tableRows = attributes.rows;
                const coli = breakpoint?.headerAsCol ? cell.attributes.col - 1 : cell.attributes.col;
                const rowi = cell.attributes.row;

                let targetRow = tableRows * (Math.ceil((coli + 1) / stacksCount) - 1) + rowi;

                newCells.push(moveCellToRow(cell, targetRow));
            }
            return newCells;
        }

        const stacksCount = Math.max(breakpoint.stackCount || 1, 1);

        let cells = tableBlock.innerBlocks as TablebergCellInstance[];

        const cols = breakpoint?.headerAsCol ? attributes.cols - 1 : attributes.cols;
        const rowsToGenerate = attributes.rows * Math.ceil(cols / stacksCount);
        const templates = generateEmptyRows(rowsToGenerate);

        let newCells;

        if (breakpoint?.headerAsCol) {
            const leftColCells = cells.filter(cell => cell.attributes.col === 0);
            const cellsExcludingLeftCol = cells.filter(cell => cell.attributes.col !== 0);

            newCells = [
                ...cellsWithHeadersAsLeftCol(leftColCells, templates.length),
                ...generateCellsWithCorrectRows(cellsExcludingLeftCol)
            ];
        } else {
            newCells = generateCellsWithCorrectRows(cells);
        }

        storeActions.replaceInnerBlocks(clientId, newCells);
        storeActions.updateBlockAttributes(clientId, {
            cells: newCells.length,
        });
        setRowTemplates(templates);
        setColUpt((old) => old + 1);
    }, [
        attributes.cells,
        attributes.enableTableHeader,
        attributes.enableTableFooter,
        breakpoint?.stackCount,
        breakpoint?.headerAsCol,
    ]);

    useEffect(() => {
        setAttributes({
            responsive: {
                ...(attributes.responsive || {}),
                last: "stack",
            },
        });
    }, []);

    return (
        <>
            {attributes.search && (
                <div
                    className={`tableberg-search tableberg-search-${attributes.searchPosition}`}
                >
                    <input type="text" placeholder="Search..." />
                    <FontAwesomeIcon icon={faSearch} />
                </div>
            )}
            <div
                className="tableberg-table-wrapper"
                style={{
                    ...getBorderCSS(attributes.tableBorder),
                    ...getBorderRadiusCSS(attributes.tableBorderRadius),
                }}
            >
                <table {...blockProps}>{rowTemplates}</table>
            </div>
            <div style={{ display: "none" }} key={colUpt}>
                <div {...innerBlocksProps} />
            </div>
        </>
    );
}

