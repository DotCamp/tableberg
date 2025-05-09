import {
    BlockEditProps,
    BlockInstance,
} from "@wordpress/blocks";
import { TablebergBlockAttrs } from "@tableberg/shared/types";
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
import {
    getBorderCSS,
    getBorderRadiusCSS,
} from "@tableberg/shared/utils/styling-helpers";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { __ } from '@wordpress/i18n';


export const ALLOWED_BLOCKS = ["tableberg/cell"];

export const PrimaryTable = (
    props: BlockEditProps<TablebergBlockAttrs> & {
        tableBlock: BlockInstance<TablebergBlockAttrs>;
        privateStore: TablebergPrivateStore;
    },
) => {
    const { attributes, tableBlock, setAttributes } = props;
    const tableRef = useRef<HTMLTableElement>();
    const blockProps = {
        ref: tableRef,
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

    const [colUpt, setColUpt] = useState(0);

    const {
        removeBlocks,
    } = useDispatch(blockEditorStore) as any as BlockEditorStoreActions;

    const lastRowCount = useRef(attributes.rows);
    useEffect(() => {
        if (lastRowCount.current === attributes.rows) {
            setColUpt((old) => old + 1);
        } else {
            lastRowCount.current = attributes.rows;
        }
    }, [attributes.rows, attributes.cells]);

    const toRemoves = tableBlock.innerBlocks
    .filter((cell) => cell.attributes.isTmp)
    .map((cell) => cell.clientId);

    setAttributes({
        cells: attributes.cells - toRemoves.length,
    });

    try {
        removeBlocks(toRemoves);
    } catch (e) {
        console.warn(
            "Tableberg: Tried to call removeBlocks before the previous call has returned. React might be running in development mode.",
            e
        );
    }

    const [search, setSearch] = useState("");
    const [hiddenRows, setHiddenRows] = useState<number[]>([]);

    useEffect(() => {
        const vRows: number[] = [];
        if (tableRef.current && search.length > 2) {
            const rows = tableRef.current.querySelector("tbody")?.children;
            Array.from(rows!).forEach((row, idx) => {
                if (!row.textContent?.includes(search)) {
                    vRows.push(idx);
                }
            });
        }
        setHiddenRows(vRows);
    }, [search]);

    const rowTemplate = createArray(attributes.rows).map((i) => {
        let className = "";
        let mustBeShown = false;

        if (i === 0 && attributes.enableTableHeader) {
            className = "tableberg-header";
            mustBeShown = true;
        } else if (i + 1 === attributes.rows && attributes.enableTableFooter) {
            className = "tableberg-footer";
            mustBeShown = true;
        } else {
            const row = attributes.enableTableHeader ? i + 1 : i;
            className = row % 2 ? "tableberg-even-row" : "tableberg-odd-row";
        }

        const rowStyle = attributes.rowStyles[i];

        return (
            <tr
                style={{
                    height: rowStyle?.height,
                    background: rowStyle?.bgGradient || rowStyle?.background,
                    display:
                        !mustBeShown && hiddenRows.includes(i)
                            ? "none"
                            : "table-row",
                }}
                className={className}
            ></tr>
        );
    });

    let fixedWidth: any = null;

    if (attributes.fixedColWidth) {
        fixedWidth = `${100 / attributes.cols}%`;
    }

    return (
        <>
            {attributes.search && (
                <div
                    className={`tableberg-search tableberg-search-${attributes.searchPosition}`}
                >
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value.trim())}
                        placeholder={ attributes.searchPlaceholder !== "Search..." ? attributes.searchPlaceholder : __('Search...', 'tableberg')}
                    />
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
                <table {...blockProps}>
                    <colgroup>
                        {fixedWidth
                            ? Array(attributes.cols)
                                  .fill("")
                                  .map((_, i) => {
                                      const colStyle = attributes.colStyles[i];
                                      return (
                                          <col
                                              style={{
                                                  width: fixedWidth,
                                                  minWidth: fixedWidth,
                                                  background:
                                                      colStyle?.bgGradient ||
                                                      colStyle?.background,
                                              }}
                                          />
                                      );
                                  })
                            : Array(attributes.cols)
                                  .fill("")
                                  .map((_, i) => {
                                      const colStyle = attributes.colStyles[i];
                                      return (
                                          <col
                                              style={{
                                                  width: colStyle?.width,
                                                  minWidth: colStyle?.width,
                                                  background:
                                                      colStyle?.bgGradient ||
                                                      colStyle?.background,
                                              }}
                                          />
                                      );
                                  })}
                    </colgroup>
                    <tbody>{rowTemplate}</tbody>
                </table>
            </div>
            <div style={{ display: "none" }} key={colUpt}>
                <div {...innerBlocksProps} />
            </div>
        </>
    );
};
