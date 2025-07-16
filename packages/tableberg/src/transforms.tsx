import {
    TablebergBlockAttrs,
    TablebergCellInstance,
} from "@tableberg/shared/types";
import metadata from "./block.json";
import { createBlock } from "@wordpress/blocks";

export default {
    from: [
        {
            type: "block",
            blocks: ["core/table"],
            transform: (data: any) => {
                const innerBlocks: TablebergCellInstance[] = [];
                const attrs: Partial<TablebergBlockAttrs> & {
                    cells: number;
                    rows: number;
                    cols: number;
                } = {
                    version: metadata.version,
                    cells: 0,
                    responsive: {
                        target: "window",
                        last: "",
                        breakpoints: {},
                    },
                    rows: 0,
                    cols: 0,
                };

                if (data.textColor) {
                    const textColor = window
                        .getComputedStyle(document.body)
                        .getPropertyValue(
                            "--wp--preset--color--" + data.textColor,
                        );
                    attrs.fontColor = textColor;
                }

                if (data.backgroundColor) {
                    const backgroundColor = window
                        .getComputedStyle(document.body)
                        .getPropertyValue(
                            "--wp--preset--color--" + data.backgroundColor,
                        );
                    attrs.headerBackgroundColor = backgroundColor;
                    attrs.oddRowBackgroundColor = backgroundColor;
                    attrs.evenRowBackgroundColor = backgroundColor;
                    attrs.footerBackgroundColor = backgroundColor;
                }

                if (data.borderColor) {
                    const borderColor = window
                        .getComputedStyle(document.body)
                        .getPropertyValue(
                            "--wp--preset--color--" + data.borderColor,
                        );
                    attrs.innerBorder = {
                        color: borderColor,
                    };
                    attrs.tableBorder = {
                        color: borderColor,
                    };
                }

                if (data.fontSize) {
                    attrs.fontSize = (
                        {
                            small: "0.9rem",
                            medium: "1.05rem",
                            large: "1.85rem",
                            "x-large": "2.5rem",
                            "xx-large": "3.27rem",
                        } as any
                    )[data.fontSize];
                }

                if (data.style?.border?.width) {
                    const innerBorder = attrs.innerBorder || {};
                    innerBorder.width = data.style.border.width;

                    const tableBorder = attrs.tableBorder || {};
                    tableBorder.width = data.style.border.width;
                }

                if (/is\-style\-stripes/.test(data.className)) {
                    attrs.evenRowBackgroundColor = "#f0f0f0";
                }

                const head = data.head[0]?.cells;
                if (head) {
                    attrs.cols = head.length;
                    attrs.enableTableHeader = "converted";
                    head.forEach((cell: any, colIdx: number) => {
                        attrs.cells++;
                        innerBlocks.push(
                            createBlock(
                                "tableberg/cell",
                                {
                                    row: 0,
                                    col: colIdx,
                                    tagName: "th",
                                },
                                [
                                    createBlock("core/paragraph", {
                                        content: cell.content,
                                    }),
                                ],
                            ) as any,
                        );
                    });
                    attrs.rows++;
                }

                data.body.forEach((row: any, _: number) => {
                    attrs.cols = row.cells.length;
                    row.cells.forEach((cell: any, colIdx: number) => {
                        // @ts-ignore
                        attrs.cells++;
                        innerBlocks.push(
                            createBlock(
                                "tableberg/cell",
                                {
                                    row: attrs.rows,
                                    col: colIdx,
                                    tagName: "td",
                                },
                                [
                                    createBlock("core/paragraph", {
                                        content: cell.content,
                                    }),
                                ],
                            ) as any,
                        );
                    });
                    attrs.rows++;
                });

                const foot = data.foot[0]?.cells;
                if (foot) {
                    attrs.cols = foot.length;
                    attrs.enableTableFooter = "converted";
                    foot.forEach((cell: any, colIdx: number) => {
                        attrs.cells++;
                        innerBlocks.push(
                            createBlock(
                                "tableberg/cell",
                                {
                                    row: attrs.rows,
                                    col: colIdx,
                                    tagName: "td",
                                },
                                [
                                    createBlock("core/paragraph", {
                                        content: cell.content,
                                    }),
                                ],
                            ) as any,
                        );
                    });
                    attrs.rows++;
                }

                if (attrs.cells === 0) {
                    return createBlock("tableberg/table");
                }
                return createBlock("tableberg/table", attrs, innerBlocks);
            },
        },
    ],
    to: [],
};
