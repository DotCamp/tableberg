import { BorderTypes, PaddingTypes } from "./utils/common-types";

interface BaseResponsive {
    target: "window" | "container";
    enabled: boolean;
    type?: "" | "stack";
}
interface ResponsiveStack extends BaseResponsive {
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
    responsive: BaseResponsive | ResponsiveStack
}

export { PaddingTypes } from "./utils/common-types";
