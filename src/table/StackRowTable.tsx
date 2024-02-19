import { BlockEditProps, BlockInstance } from "@wordpress/blocks";
import { ResponsiveStack, TablebergBlockAttrs } from "../types";
import { useInnerBlocksProps } from "@wordpress/block-editor";
import { useEffect, useState } from "react";
import classNames from "classnames";
import { ALLOWED_BLOCKS } from ".";

export default function StackRowTable(
    props: BlockEditProps<TablebergBlockAttrs> & {
        tableBlock: BlockInstance<TablebergBlockAttrs>;
    }
) {
    const { attributes, tableBlock } = props;

    const innerBlocksProps = useInnerBlocksProps({
        // @ts-ignore false can obviously be assigned to renderAppender as does
        // wordpress in their own blocks. Need to make a pr to @types/wordpress__block-editor.
        renderAppender: false,
        allowedBlocks: ALLOWED_BLOCKS,
    });
    const [rowTemplates, setRowTemplates] = useState([]);

    useEffect(() => {
        const colCountOfRow = new Map<
            number,
            { lastRow: number; count: number }
        >();
        const colCount =
            (attributes.responsive as ResponsiveStack).stackCount || 4;
        const tmplates: any = [];
        let rowCount = 0;
        tableBlock.innerBlocks.forEach((cell) => {
            const newRow = cell.attributes.col;
            const thisCellInfo = colCountOfRow.get(newRow);

            if (!thisCellInfo || thisCellInfo.count == colCount) {
                colCountOfRow.set(newRow, {
                    lastRow: rowCount,
                    count: 1,
                });
                cell.attributes.responsiveTarget = `#tableberg-xtable-${rowCount}`;
                tmplates.push(<tr id={`tableberg-xtable-${rowCount}`}></tr>);
                rowCount++;
            } else {
                thisCellInfo.count++;
                cell.attributes.responsiveTarget = `#tableberg-xtable-${thisCellInfo.lastRow}`;
            }
        });
        setRowTemplates(tmplates);
    }, [attributes.cells]);

    return (
        <>
            <table
                className={classNames({
                    "tableberg-rowstack-table": true,
                    "tableberg-has-header": attributes.enableTableHeader,
                })}
            >
                {rowTemplates}
            </table>
            <div style={{ display: "none" }}>
                <div {...innerBlocksProps} />
            </div>
        </>
    );
}
