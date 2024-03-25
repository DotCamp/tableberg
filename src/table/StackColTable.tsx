import { BlockEditProps, BlockInstance, cloneBlock } from "@wordpress/blocks";
import { TablebergBlockAttrs } from "../types";
import {
    useInnerBlocksProps,
    store as blockEditorStore,
} from "@wordpress/block-editor";
import { useEffect, useState } from "react";
import { ALLOWED_BLOCKS } from ".";
import { TablebergCellInstance } from "../cell";
import { useDispatch } from "@wordpress/data";
import { getStyles } from "./get-styles";
import classNames from "classnames";
import { getStyleClass } from "./get-classes";

export default function StackColTable(
    props: BlockEditProps<TablebergBlockAttrs> & {
        tableBlock: BlockInstance<TablebergBlockAttrs>;
        preview: keyof TablebergBlockAttrs["responsive"]["breakpoints"];
    }
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
        className: classNames(getStyleClass(attributes), "tableberg-rowstack-table"),
    } as Record<string, any>;

    const [rowTemplates, setRowTemplates] = useState([]);
    const [colUpt, setColUpt] = useState(0);

    useEffect(() => {
        setColUpt((old) => old + 1);
    }, [attributes.cols, attributes.cells]);

    const storeActions = useDispatch(
        blockEditorStore
    ) as BlockEditorStoreActions;

    const breakpoints = tableBlock.attributes.responsive.breakpoints;
    const breakpoint =
        preview == "mobile" && !breakpoints[preview]
            ? breakpoints.tablet
            : breakpoints[preview];

    useEffect(() => {
        const newCells: TablebergCellInstance[] = [];

        const headerArr: TablebergCellInstance[] = [];
        let stackRowCount = Math.max(breakpoint?.stackCount || 1, 1);

        const templates: any = [];
        let rowIdxStart = 0;
        let rowCount = -1,
            lastRow = -1,
            stackTrack = 0;

        if (attributes.enableTableHeader) {
            stackRowCount++;
            rowCount++;
            templates.push(<tr id={`tableberg-${clientId}-${rowCount}`} />);
            stackTrack++;

            for (; rowIdxStart < tableBlock.innerBlocks.length; rowIdxStart++) {
                const cell = tableBlock.innerBlocks[
                    rowIdxStart
                ] as TablebergCellInstance;
                if (cell.attributes.isTmp) {
                    continue;
                }
                if (cell.attributes.row > 0) {
                    break;
                }
                cell.attributes.responsiveTarget = `#tableberg-${clientId}-${rowCount}`;
                headerArr.push(cell);
                newCells.push(cell);
            }
        }

        for (
            let idx = rowIdxStart;
            idx < tableBlock.innerBlocks.length;
            idx++
        ) {
            const cell: TablebergCellInstance = tableBlock.innerBlocks[
                idx
            ] as any;

            if (cell.attributes.isTmp) {
                continue;
            }

            if (lastRow != cell.attributes.row) {
                lastRow = cell.attributes.row;

                if (
                    tableBlock.attributes.enableTableHeader &&
                    stackTrack == stackRowCount
                ) {
                    rowCount++;
                    templates.push(
                        <tr id={`tableberg-${clientId}-${rowCount}`} />
                    );
                    stackTrack = 1;

                    for (const cell of headerArr) {
                        const headerCell = cloneBlock(cell, {
                            responsiveTarget: `#tableberg-${clientId}-${rowCount}`,
                            isTmp: true,
                        });
                        newCells.push(headerCell);
                    }
                }

                rowCount++;
                templates.push(<tr id={`tableberg-${clientId}-${rowCount}`} />);
                stackTrack++;
            }

            cell.attributes.responsiveTarget = `#tableberg-${clientId}-${rowCount}`;
            newCells.push(cell);
        }

        storeActions.replaceInnerBlocks(clientId, newCells);
        storeActions.updateBlockAttributes(clientId, {
            cells: newCells.length
        });
        setRowTemplates(templates);
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
            <table {...blockProps}>{rowTemplates}</table>
            <div style={{ display: "none" }} key={colUpt}>
                <div {...innerBlocksProps} />
            </div>
        </>
    );
}
