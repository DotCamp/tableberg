import { BlockEditProps, BlockInstance, cloneBlock } from "@wordpress/blocks";
import {
    TablebergBlockAttrs,
    TablebergCellInstance,
} from "@tableberg/shared/types";
import {
    useInnerBlocksProps,
    store as blockEditorStore,
} from "@wordpress/block-editor";
import { useEffect, useState } from "react";
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

const useInnerBlocksUpdate = () => {
    const [key, setKey] = useState(0);

    const incrementKey = () => setKey(k => k + 1);

    return [key, incrementKey] as [number, () => void];
}

export default function StackColTable(
    props: BlockEditProps<TablebergBlockAttrs> & {
        tableBlock: BlockInstance<TablebergBlockAttrs>;
        stackCount: number;
        headerAsCol: boolean;
    },
) {
    const { attributes, tableBlock, clientId, setAttributes, stackCount, headerAsCol } = props;

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

    const [rowTemplate, setRowTemplate] = useState<React.ReactElement[]>([]);

    const {
        replaceInnerBlocks,
        updateBlockAttributes,
    }: BlockEditorStoreActions = useDispatch(
        blockEditorStore,
    ) as any;

    const [updateKey, refreshInnerBlocks] = useInnerBlocksUpdate();

    useEffect(() => {
        const setRowPortalTarget = (
            cell: TablebergCellInstance, row: number, setTemp = false
        ) => {
            cell.attributes.responsiveTarget = `#tableberg-${clientId}-${row}`;
            cell.attributes.isTmp = setTemp;
            return cell;
        }

        const stacksCount = Math.max(stackCount || 1, 1);

        let cells = tableBlock.innerBlocks as TablebergCellInstance[];
        const newCells: TablebergCellInstance[] = [];
        const template: React.ReactElement[] = [];

        const cols = headerAsCol ? attributes.cols - 1 : attributes.cols;
        const rowsToGenerate = attributes.rows * Math.ceil(cols / stacksCount);

        (function generateRows() {
            for (let i = 0; i < rowsToGenerate; i++) {
                const Row = ({ rowClass = "row" }) => <tr
                    id={`tableberg-${clientId}-${i}`}
                    className={`tableberg-${rowClass}`}
                />;

                const isHeaderRow = i % attributes.rows === 0;
                const isFooterRow = i % attributes.rows === attributes.rows - 1;

                if (attributes.enableTableHeader && isHeaderRow) {
                    template.push(<Row key={i} rowClass="header" />);
                } else if (attributes.enableTableFooter && isFooterRow) {
                    template.push(<Row key={i} rowClass="footer" />);
                } else if (i % 2 === 0) {
                    template.push(<Row key={i} rowClass="even-row" />);
                } else if (i % 2 !== 0) {
                    template.push(<Row key={i} rowClass="odd-row" />);
                }
            }
        })();

        (function addColumnToEachStack() {
            if (!headerAsCol) {
                return
            }

            const leftColCells = cells.filter(cell => cell.attributes.col === 0);
            const cellsExcludingLeftCol = cells.filter(cell => cell.attributes.col !== 0);
            cells = cellsExcludingLeftCol;

            for (let row = 0; row < template.length; row++) {
                const col1Cell = cloneBlock(leftColCells[row % attributes.rows]) as TablebergCellInstance;
                if (col1Cell.attributes.isTmp) {
                    continue;
                }

                const setTemp = row > (attributes.rows - 1) ? true : false;
                newCells.push(setRowPortalTarget(col1Cell, row, setTemp));
            }
        })();

        (function moveCellsToCorrectRows() {
            for (const cell of cells) {
                if (cell.attributes.isTmp) {
                    continue;
                }

                const tableRows = attributes.rows;
                const coli = headerAsCol ? cell.attributes.col - 1 : cell.attributes.col;
                const rowi = cell.attributes.row;

                let targetRow = tableRows * (Math.ceil((coli + 1) / stacksCount) - 1) + rowi;

                newCells.push(setRowPortalTarget(cell, targetRow));
            }
        })();

        replaceInnerBlocks(clientId, newCells);
        updateBlockAttributes(clientId, {
            cells: newCells.length,
        });
        setRowTemplate(template);
        refreshInnerBlocks();
    }, [
        stackCount,
        headerAsCol,
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
                <table {...blockProps}>{rowTemplate}</table>
            </div>
            <table style={{ display: "none" }} key={updateKey}>
                <tbody>
                    <tr {...innerBlocksProps} />
                </tbody>
            </table>
        </>
    );
}
