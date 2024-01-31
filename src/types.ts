import { BorderTypes, PaddingTypes } from "./utils/common-types";

export interface TablebergBlockAttrs {
    rows: number;
    cols: number;
    cells: number;
    colWidths: string[];
    rowHeights: string[];
    hasTableCreated: boolean;
    tableWidth: string;
    enableTableHeader: boolean;
    enableTableFooter: boolean;
    tableAlignment: "center" | "full" | "left" | "right" | "wide";
    cellPadding: PaddingTypes;
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
}

export { PaddingTypes } from "./utils/common-types";
