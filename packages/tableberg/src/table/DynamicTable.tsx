import { BlockEditProps, BlockInstance, createBlocksFromInnerBlocksTemplate, InnerBlockTemplate } from "@wordpress/blocks";
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
import { useSelect, useDispatch } from "@wordpress/data";
import {
    getBorderCSS,
    getBorderRadiusCSS,
} from "@tableberg/shared/utils/styling-helpers";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';

const DynamicTable = (
    props: BlockEditProps<TablebergBlockAttrs> & {
        tableBlock: BlockInstance<TablebergBlockAttrs>;
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
        allowedBlocks: ["tableberg/cell"],
    });

    const [colUpt, setColUpt] = useState(0);
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
        useDispatch(blockEditorStore).removeBlocks(toRemoves);
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

    const privateStore = window.tablebergPrivateStores[tableBlock.clientId];

    const dynamicFields = useSelect(
        (select) => {
            return select(privateStore).getDynamicFields()
        },
        []
    );

    const [products, setProducts] = useState<Record<string, any>[]>([]);

    useEffect(() => {
        async function fetchProducts() {
            const per_page = 10, page = 1;

            const queryParams = new URLSearchParams({
                per_page: per_page.toString(),
                page: page.toString(),
                _fields: dynamicFields.length ? dynamicFields.join(',') : "name, price",
            }).toString();

            const products: Record<string, any>[] = await apiFetch({
                path: `/wc/v3/products?${queryParams}`,
                method: 'GET',
            });

            setProducts(products);
        }

        fetchProducts();
    }, [dynamicFields]);

    const dynamicRowTemplate = createArray(products.length).map((i) => {
        let className = "";
        let mustBeShown = false;

        const row = attributes.enableTableHeader ? i + 1 : i;
        className = row % 2 ? "tableberg-odd-row" : "tableberg-even-row";

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

    const { replaceInnerBlocks, updateBlockAttributes } = useDispatch(blockEditorStore);

    useEffect(() => {
        const innerBlocksTemplate: InnerBlockTemplate[] = [];
        const headerBlocks = tableBlock.innerBlocks.filter(block => block.attributes.row === 0)

        products.forEach((product, i) => {
            dynamicFields.forEach((field, col) => {
                innerBlocksTemplate.push(
                    [
                        "tableberg/cell",
                        { row: i + 1, col },
                        [
                            ["core/paragraph", { content: product[field] }],
                        ]
                    ]
                );
            })
        })

        replaceInnerBlocks(
            tableBlock.clientId,
            [
                ...headerBlocks,
                ...createBlocksFromInnerBlocksTemplate(innerBlocksTemplate),
            ]
        );

        updateBlockAttributes(tableBlock.clientId, {
            cells: innerBlocksTemplate.length + headerBlocks.length,
            rows: products.length + 1,
            cols: dynamicFields.length,
        });
    }, [products, dynamicFields]);

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
                        placeholder={attributes.searchPlaceholder !== "Search..." ? attributes.searchPlaceholder : __('Search...', 'tableberg')}
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
                        {Array(attributes.cols)
                            .fill("")
                            .map((_, i) => {
                                const colStyle = attributes.colStyles[i];
                                return (
                                    <col
                                        style={{
                                            width: fixedWidth ? fixedWidth : colStyle?.width,
                                            minWidth: fixedWidth ? fixedWidth : colStyle?.width,
                                            background:
                                                colStyle?.bgGradient ||
                                                colStyle?.background,
                                        }}
                                    />
                                );
                            })}
                    </colgroup>
                    <tbody>
                        <tr
                            style={{
                                height: attributes.rowStyles[0]?.height,
                                background: attributes.rowStyles[0]?.bgGradient || attributes.rowStyles[0]?.background,
                                display: "table-row",
                            }}
                            className="tableberg-header"
                        ></tr>
                        {dynamicRowTemplate}
                    </tbody>
                </table>
            </div>
            <div style={{ display: "none" }} key={colUpt}>
                <div {...innerBlocksProps} />
            </div>
        </>
    );
};

export default DynamicTable;
