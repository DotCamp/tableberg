import { BlockEditProps, BlockInstance, cloneBlock } from "@wordpress/blocks";
import { ResponsiveStack, TablebergBlockAttrs } from "../types";
import {
    useInnerBlocksProps,
    store as blockEditorStore,
} from "@wordpress/block-editor";
import { useEffect, useState } from "react";
import { ALLOWED_BLOCKS } from ".";
import { TablebergCellInstance } from "../cell";
import { useDispatch } from "@wordpress/data";

export default function StackRowTable(
    props: BlockEditProps<TablebergBlockAttrs> & {
        tableBlock: BlockInstance<TablebergBlockAttrs>;
    }
) {
    const { attributes, tableBlock, clientId, setAttributes } = props;

    const innerBlocksProps = useInnerBlocksProps({
        // @ts-ignore false can obviously be assigned to renderAppender as does
        // wordpress in their own blocks. Need to make a pr to @types/wordpress__block-editor.
        renderAppender: false,
        allowedBlocks: ALLOWED_BLOCKS,
    });
    const [rowTemplates, setRowTemplates] = useState([]);
    const [colUpt, setColUpt] = useState(0);

    useEffect(() => {
        setColUpt((old) => old + 1);
    }, [attributes.cols]);

    const storeActions = useDispatch(
        blockEditorStore
    ) as BlockEditorStoreActions;

    useEffect(() => {
        const newCells: TablebergCellInstance[] = [];
        const masterRowMap = new Map<
            number,
            { lastRow: number; count: number }
        >();

        let headerArr: TablebergCellInstance[] = [];
        let colCount = Math.max(
            (attributes.responsive as ResponsiveStack).stackCount,
            1
        );

        if (attributes.enableTableHeader) {
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
                    <tr id={`tableberg-${clientId}-${rowCount}`}></tr>
                );
                rowCount++;
            } else if (masterRow.count == colCount) {
                let thisRowColCount = 1;
                if (attributes.enableTableHeader) {
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
                    style = { borderTop: "5px dashed gray" };
                }

                tmplates.push(
                    <tr
                        id={`tableberg-${clientId}-${rowCount}`}
                        style={style}
                    ></tr>
                );
                rowCount++;
            } else {
                masterRow.count++;
                cell.attributes.responsiveTarget = `#tableberg-${clientId}-${masterRow.lastRow}`;
            }

            newCells.push(cell);
        }

        storeActions.replaceInnerBlocks(clientId, newCells);
        setRowTemplates(tmplates);
        setColUpt((old) => old + 1);
    }, [
        attributes.cells,
        (attributes.responsive as ResponsiveStack).stackCount,
        attributes.enableTableHeader,
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
            <table className="tableberg-rowstack-table">{rowTemplates}</table>
            <div style={{ display: "none" }} key={colUpt}>
                <div {...innerBlocksProps} />
            </div>
        </>
    );
}
