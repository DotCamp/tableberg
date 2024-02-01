import { omitBy, isUndefined, trim, isEmpty } from "lodash";
import { getBorderVariablesCss, getSpacingCss } from "./utils/styling-helpers";
import { PaddingTypes, TablebergBlockAttrs } from "./types";

export function getStyles(attributes: TablebergBlockAttrs) {
    const {
        cellPadding,
        enableInnerBorder,
        innerBorder,
        tableBorder,
        fontColor,
        fontSize,
        linkColor,
    } = attributes;
    const cellPaddingCSS: PaddingTypes = getSpacingCss(cellPadding);
    const tableBorderVar = getBorderVariablesCss(tableBorder, "table");
    const tableInnerBorder = enableInnerBorder
        ? getBorderVariablesCss(innerBorder, "inner")
        : {};

    let styles: Record<string, any> = {
        "--tableberg-cell-padding-top": cellPaddingCSS?.top,
        "--tableberg-cell-padding-right": cellPaddingCSS?.right,
        "--tableberg-cell-padding-bottom": cellPaddingCSS?.bottom,
        "--tableberg-cell-padding-left": cellPaddingCSS?.left,
        "--tableberg-global-text-color": fontColor,
        "--tableberg-global-link-color": linkColor,
        "--tableberg-global-font-size": fontSize,
        ...tableBorderVar,
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
