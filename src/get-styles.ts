import { omitBy, isUndefined, trim, isEmpty, isNumber } from "lodash";
import { getBorderVariablesCss, getSpacingCss } from "./utils/styling-helpers";
import { PaddingTypes, TablebergBlockAttrs } from "./types";

export function getStyles(attributes: TablebergBlockAttrs) {
    const {
        cellPadding,
        cellSpacing,
        enableInnerBorder,
        evenRowBackgroundColor,
        innerBorder,
        headerBackgroundColor,
        oddRowBackgroundColor,
        tableBorder,
        headerBackgroundGradient,
        evenRowBackgroundGradient,
        oddRowBackgroundGradient,
        tableWidth,
        footerBackgroundColor,
        footerBackgroundGradient,
        fontColor,
        fontSize,
        linkColor,
    } = attributes;
    const cellPaddingCSS: PaddingTypes = getSpacingCss(cellPadding);
    const cellSpacingCSS: PaddingTypes = getSpacingCss(cellSpacing);
    const tableInnerBorder = enableInnerBorder
        ? getBorderVariablesCss(innerBorder, "inner")
        : {};

    let spacingDependantStyles: Record<string, any> = {};
    if (
        (cellSpacingCSS?.top??'0') !== "0" ||
        (cellSpacingCSS.left??'0') !== "0"
    ) {
        spacingDependantStyles = {
            "--tableberg-border-collapse" : "separate",
            "--tableberg-table-border-top": "none",
            "--tableberg-table-border-right": "none",
            "--tableberg-table-border-bottom": "none",
            "--tableberg-table-border-left": "none",
            "--tableberg-cell-spacing-top": cellSpacingCSS?.top,
            "--tableberg-cell-spacing-left": cellSpacingCSS?.left,
        };
    } else {
        spacingDependantStyles = getBorderVariablesCss(tableBorder, "table");
    }


    let styles: Record<string, any> = {
        "--tableber-table-width": tableWidth,
        "--tableberg-footer-bg-color": !isEmpty(footerBackgroundColor)
            ? footerBackgroundColor
            : footerBackgroundGradient,
        "--tableberg-header-bg-color": !isEmpty(headerBackgroundColor)
            ? headerBackgroundColor
            : headerBackgroundGradient,
        "--tableberg-even-row-bg-color": !isEmpty(evenRowBackgroundColor)
            ? evenRowBackgroundColor
            : evenRowBackgroundGradient,
        "--tableberg-odd-row-bg-color": !isEmpty(oddRowBackgroundColor)
            ? oddRowBackgroundColor
            : oddRowBackgroundGradient,
        "--tableberg-cell-padding-top": cellPaddingCSS?.top,
        "--tableberg-cell-padding-right": cellPaddingCSS?.right,
        "--tableberg-cell-padding-bottom": cellPaddingCSS?.bottom,
        "--tableberg-cell-padding-left": cellPaddingCSS?.left,
        "--tableberg-global-text-color": fontColor,
        "--tableberg-global-link-color": linkColor,
        "--tableberg-global-font-size": fontSize,
        ...spacingDependantStyles,
        ...tableInnerBorder,
    };

    return omitBy(
        styles,
        (value: any) =>
            value === false ||
            isEmpty(value) ||
            isUndefined(value) ||
            trim(value) === "" ||
            trim(value) === "undefined undefined undefined"
    );
}
