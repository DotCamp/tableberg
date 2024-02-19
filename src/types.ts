import { BorderTypes, PaddingTypes } from "./utils/common-types";

export type ResponsiveMode = "" | "stack";

export interface BaseResponsive {
    enabled: boolean;
    last: ResponsiveMode;
    target: "window" | "container";
}

export interface ResponsivePrimary extends BaseResponsive{
    type?: "";
}
export interface ResponsiveStack extends BaseResponsive {
    type: "stack";
    cellStack: "column" | "row";
    stackCount: number;
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
    responsive: ResponsivePrimary | ResponsiveStack
}

export { PaddingTypes } from "./utils/common-types";
