import { omitBy, isUndefined, trim, isEmpty } from "lodash";
import { getBorderVariablesCss, getSpacingCss } from "../utils/styling-helpers";
import {
    getBorderCSS,
    getSpacingStyle,
} from "@tableberg/shared/utils/styling-helpers";
import { TablebergBlockAttrs } from "../types";

export function getStyles(attributes: TablebergBlockAttrs) {
    const {
        cellPadding,
        cellSpacing,
        enableInnerBorder,
        innerBorder,
        tableBorder,
        headerBackgroundColor,
        headerBackgroundGradient,
        evenRowBackgroundColor,
        evenRowBackgroundGradient,
        oddRowBackgroundColor,
        oddRowBackgroundGradient,
        footerBackgroundColor,
        footerBackgroundGradient,
        fontColor,
        fontSize,
        linkColor,
    } = attributes;
    const cellSpacingCSS: any = getSpacingCss(cellSpacing);
    const tableInnerBorder = enableInnerBorder
        ? getBorderVariablesCss(innerBorder, "inner")
        : {};

    let spacingDependantStyles: Record<string, any> = {};
    if (
        (cellSpacingCSS?.top ?? "0") !== "0" ||
        (cellSpacingCSS.left ?? "0") !== "0"
    ) {
        spacingDependantStyles = {
            "border-collapse": "separate",
            border: "none",
            "border-spacing": `${cellSpacingCSS?.top || 0} ${
                cellSpacingCSS?.left || 0
            }`,
        };
    } else {
        spacingDependantStyles = getBorderCSS(tableBorder);
        spacingDependantStyles["border-collapse"] = "collapse";
    }

    let styles: Record<string, any> = {
        color: fontColor,
        "font-size": fontSize,
        "--tableberg-global-link-color": linkColor,
        "--tableberg-header-bg":
            headerBackgroundGradient || headerBackgroundColor,
        "--tableberg-footer-bg":
            footerBackgroundGradient || footerBackgroundColor,
        "--tableberg-odd-bg": oddRowBackgroundGradient || oddRowBackgroundColor,
        "--tableberg-even-bg":
            evenRowBackgroundGradient || evenRowBackgroundColor,
        ...spacingDependantStyles,
        ...tableInnerBorder,
        ...getSpacingStyle(cellPadding, "--tableberg-cell-padding"),
    };

    return omitBy(
        styles,
        (value: any) =>
            value === false ||
            isEmpty(value) ||
            isUndefined(value) ||
            trim(value) === "" ||
            trim(value) === "undefined undefined undefined",
    );
}
