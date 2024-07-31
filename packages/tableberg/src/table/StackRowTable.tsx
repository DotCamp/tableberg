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
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import {
    getBorderCSS,
    getBorderRadiusCSS,
} from "@tableberg/shared/utils/styling-helpers";

export default function StackRowTable(
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
            "tableberg-rowstack-table",
        ),
    } as Record<string, any>;

    const [rowTemplates, setRowTemplates] = useState([]);
    const [colUpt, setColUpt] = useState(0);

    useEffect(() => {
        setColUpt((old) => old + 1);
    }, [attributes.cols]);

    const storeActions: BlockEditorStoreActions = useDispatch(
        blockEditorStore,
    ) as any;

    const breakpoints = tableBlock.attributes.responsive.breakpoints;
    const breakpoint =
        preview == "mobile" && !breakpoints[preview]
            ? breakpoints.tablet
            : breakpoints[preview];

    useLayoutEffect(() => {
        const newCells: TablebergCellInstance[] = [];
        const masterRowMap = new Map<
            number,
            { lastRow: number; count: number }
        >();

        let headerArr: TablebergCellInstance[] = [];
        let colCount = Math.max(breakpoint?.stackCount || 1, 1);

        if (attributes.enableTableHeader && breakpoint?.headerAsCol) {
            colCount++;
            headerArr = tableBlock.innerBlocks.slice(0, attributes.cols) as any;
        }

        const tmplates: any = [];

        let rowCount = 0;
        for (let idx = 0; idx < tableBlock.innerBlocks.length; idx++) {
            const cell: TablebergCellInstance = tableBlock.innerBlocks[
                idx
            ] as any;

            if (cell.attributes.isTmp) {
                continue;
            }

            const subRow = cell.attributes.col;
            const masterRow = masterRowMap.get(subRow);

            if (!masterRow) {
                masterRowMap.set(subRow, {
                    lastRow: rowCount,
                    count: 1,
                });
                cell.attributes.responsiveTarget = `#tableberg-${clientId}-${rowCount}`;
                tmplates.push(
                    <tr id={`tableberg-${clientId}-${rowCount}`}></tr>,
                );
                rowCount++;
            } else if (masterRow.count == colCount) {
                let thisRowColCount = 1;
                if (attributes.enableTableHeader && breakpoint?.headerAsCol) {
                    const headerCell = cloneBlock(headerArr[subRow], {
                        responsiveTarget: `#tableberg-${clientId}-${rowCount}`,
                        isTmp: true,
                    });
                    newCells.push(headerCell);
                    thisRowColCount++;
                }
                masterRowMap.set(subRow, {
                    lastRow: rowCount,
                    count: thisRowColCount,
                });
                cell.attributes.responsiveTarget = `#tableberg-${clientId}-${rowCount}`;

                let style = {};
                if (rowCount % attributes.cols === 0) {
                    style = { borderTop: "3px solid gray" };
                }

                tmplates.push(
                    <tr
                        id={`tableberg-${clientId}-${rowCount}`}
                        style={style}
                    ></tr>,
                );
                rowCount++;
            } else {
                masterRow.count++;
                cell.attributes.responsiveTarget = `#tableberg-${clientId}-${masterRow.lastRow}`;
            }

            newCells.push(cell);
        }

        storeActions.replaceInnerBlocks(clientId, newCells);
        storeActions.updateBlockAttributes(clientId, {
            cells: newCells.length,
        });
        setRowTemplates(tmplates);
        setColUpt((old) => old + 1);
    }, [
        attributes.cells,
        attributes.enableTableHeader,
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
