import { BlockEditProps, BlockInstance } from "@wordpress/blocks";
import { TablebergBlockAttrs } from "../types";
import { createArray } from "../utils";
import { useEffect, useState } from "react";
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

    useEffect(() => {
        setColUpt((old) => old + 1);
    }, [attributes.cols]);

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
            });
            storeActions.removeBlocks(toRemoves);
        }
    }, []);

    const rowTemplate = createArray(attributes.rows).map((i) => {
        let background;
        let className = "";
        if (i % 2 === 0) {
            background =
                attributes.oddRowBackgroundColor ??
                attributes.oddRowBackgroundGradient ??
                undefined;
        } else {
            background =
                attributes.evenRowBackgroundColor ??
                attributes.evenRowBackgroundGradient ??
                undefined;
        }

        if (i === 0 && attributes.enableTableHeader) {
            background =
                attributes.headerBackgroundColor ??
                attributes.headerBackgroundGradient ??
                undefined;
            className += "tableberg-header";
        }

        if (i + 1 === attributes.rows && attributes.enableTableFooter) {
            background =
                attributes.footerBackgroundColor ??
                attributes.footerBackgroundGradient ??
                undefined;
            className += "tableberg-footer";
        }

        return (
            <tr
                style={{
                    height: attributes.rowHeights[i],
                    background,
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
