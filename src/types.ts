import { BorderTypes, PaddingTypes } from "./utils/common-types";

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
    colWidths: string[];
    rowHeights: string[];
    hasTableCreated: boolean;
    tableWidth: string;
    enableTableHeader: "" | "converted" | "added";
    enableTableFooter: "" | "converted" | "added";
    tableAlignment: "center" | "full" | "left" | "right" | "wide";
    cellPadding: PaddingTypes;
    cellSpacing: PaddingTypes;
    headerBackgroundColor: string | null;
    headerBackgroundGradient: string | null;
    evenRowBackgroundColor: string | null;
    evenRowBackgroundGradient: string | null;
    oddRowBackgroundColor: string | null;
    oddRowBackgroundGradient: string | null;
    footerBackgroundColor: string | null;
    footerBackgroundGradient: string | null;
    tableBorder: BorderTypes;
    innerBorder: BorderTypes;
    enableInnerBorder: boolean;
    isExample: boolean;
    fontColor: string;
    fontSize: string;
    linkColor: string;
    responsive: ResponsiveOptions;
    __tmp_preview: "desktop" | "mobile" | "tablet";
}

export { PaddingTypes } from "./utils/common-types";
