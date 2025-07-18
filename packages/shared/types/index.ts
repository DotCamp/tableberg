import { BlockInstance } from "@wordpress/blocks";
import { Border } from "@wordpress/components/build-types/border-control/types";
import { Borders } from "@wordpress/components/build-types/border-box-control/types";

export type ResponsiveMode = "" | "stack" | "scroll";

export interface Breakpoint {
    enabled: boolean;
    headerAsCol: boolean;
    maxWidth: number;
    mode: "" | "scroll" | "stack";
    direction: "row" | "col";
    stackCount: number;
}
export interface ResponsiveOptions {
    last: ResponsiveMode;
    target: "window" | "container";
    breakpoints: {
        desktop?: Breakpoint;
        tablet?: Breakpoint;
        mobile?: Breakpoint;
    };
}

export interface TablebergBlockAttrs {
    version: string;
    rows: number;
    cols: number;
    cells: number;
    fixedColWidth: boolean;
    colStyles: Record<
        number,
        {
            width?: string;
            background?: string;
            bgGradient?: string;
            border?: any;
            borderRadius?: any;
        }
    >;
    rowStyles: Record<
        number,
        {
            height?: string;
            background?: string;
            bgGradient?: string;
            border?: any;
            borderRadius?: any;
        }
    >;
    tableWidth: string;
    blockSpacing: string;
    enableTableHeader: "" | "converted" | "added";
    enableTableFooter: "" | "converted" | "added";
    tableAlignment: "center" | "full" | "left" | "right" | "wide";
    cellPadding: any;
    cellSpacing: any;
    headerBackgroundColor: string | null;
    headerBackgroundGradient: string | null;
    evenRowBackgroundColor: string | null;
    evenRowBackgroundGradient: string | null;
    oddRowBackgroundColor: string | null;
    oddRowBackgroundGradient: string | null;
    footerBackgroundColor: string | null;
    footerBackgroundGradient: string | null;
    tableBorder: any;
    tableBorderRadius: any;
    cellBorderRadius: any;
    innerBorder: any;
    hideCellOutsideBorders: boolean;
    enableInnerBorder: boolean;
    isExample: boolean;
    fontColor: string;
    fontSize: string;
    linkColor: string;
    responsive: ResponsiveOptions;

    stickyTopRow: boolean;
    stickyFirstCol: boolean;
    innerBorderType: "" | "col" | "row";

    disableThemeStyle: boolean;

    search: boolean;
    searchPosition: "left" | "right" | "center" | "wide";
    searchPlaceholder: string;

    sort?: {
        vertical?: {
            enabled: boolean;
            order: "asc" | "desc";
            col: number;
        };
        horizontal?: {
            enabled: boolean;
            order: "asc" | "desc";
            row: number;
        };
    };

    dynamic: boolean;
    caption: string;
    showCaption: boolean;
}

export interface TablebergCellBlockAttrs {
    vAlign: "bottom" | "center" | "top";
    tagName: "td" | "th";
    rowspan: number;
    colspan: number;
    row: number;
    col: number;
    responsiveTarget: string;
    background?: string;
    bgGradient?: string;
    blockSpacing: string;
    isHorizontal: boolean;
    justifyContent: "left" | "center" | "right" | "space-between";
    wrapItems: boolean;
    isEmpty: boolean;
    isTmp: boolean;
    border: Border | Borders;
    borderRadius: {
        topLeft: string;
        topRight: string;
        bottomRight: string;
        bottomLeft: string;
    };
    dynamicProps: {
        colName: string;
        colItemId?: string;
    };
}

export type TablebergCellInstance = BlockInstance<TablebergCellBlockAttrs>;
