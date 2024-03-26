import { BlockEditProps, BlockInstance } from "@wordpress/blocks";
import { TablebergBlockAttrs } from "../types";
import { createArray } from "../utils";
import { useEffect, useRef, useState } from "react";
import {
    useInnerBlocksProps,
    store as blockEditorStore,
} from "@wordpress/block-editor";
import { getStyles } from "./get-styles";
import classNames from "classnames";
import { getStyleClass } from "./get-classes";
import { useDispatch } from "@wordpress/data";

export const ALLOWED_BLOCKS = ["tableberg/cell"];

export const PrimaryTable = (
    props: BlockEditProps<TablebergBlockAttrs> & {
        tableBlock: BlockInstance<TablebergBlockAttrs>;
    }
) => {
    const { attributes, tableBlock, setAttributes } = props;
    const blockProps = {
        style: {
            ...getStyles(attributes),
            maxWidth: attributes.tableWidth,
            width: attributes.tableWidth,
        },
        className: classNames(getStyleClass(attributes)),
    } as Record<string, any>;

    const innerBlocksProps = useInnerBlocksProps({
        // @ts-ignore false can obviously be assigned to renderAppender as does
        // wordpress in their own blocks. Need to make a pr to @types/wordpress__block-editor.
        renderAppender: false,
        allowedBlocks: ALLOWED_BLOCKS,
    });

    const storeActions = useDispatch(
        blockEditorStore
    ) as BlockEditorStoreActions;

    const [colUpt, setColUpt] = useState(0);
    const lastRowCount = useRef(attributes.rows);
    useEffect(() => {
        if (lastRowCount.current === attributes.rows) {
            setColUpt((old) => old + 1);
        } else {
            lastRowCount.current = attributes.rows;
        }
    }, [attributes.rows, attributes.cells]);

    useEffect(() => {
        if (attributes.responsive?.last === "stack") {
            const toRemoves: string[] = [];
            tableBlock.innerBlocks.forEach((cell) => {
                if (cell.attributes.isTmp) {
                    toRemoves.push(cell.clientId);
                }
            });
            setAttributes({
                responsive: {
                    ...(attributes.responsive || {}),
                    last: "",
                },
                cells: attributes.cells - toRemoves.length
            });
            storeActions.removeBlocks(toRemoves);
        }
    }, []);

    const rowTemplate = createArray(attributes.rows).map((i) => {
        let className = "";

        if (i === 0 && attributes.enableTableHeader) {
            className = "tableberg-header";
        } else if (i + 1 === attributes.rows && attributes.enableTableFooter) {
            className = "tableberg-footer";
        } else {
            const row = attributes.enableTableHeader ? i + 1 : i;
            className = row % 2 ? "tableberg-even-row" : "tableberg-odd-row";
        }

        return (
            <tr
                style={{
                    height: attributes.rowHeights[i],
                }}
                className={className}
            ></tr>
        );
    });

    return (
        <>
            <table {...blockProps}>
                <colgroup>
                    {attributes.colWidths.map((w) => (
                        <col width={w} style={{ minWidth: w }} />
                    ))}
                </colgroup>
                {rowTemplate}
            </table>
            <div style={{ display: "none" }} key={colUpt}>
                <div {...innerBlocksProps} />
            </div>
        </>
    );
};
