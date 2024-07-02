import { omitBy, isUndefined, trim, isEmpty } from "lodash";
import { getBorderVariablesCss, getSpacingCss } from "../utils/styling-helpers";
import {
    getBorderRadiusVar,
    getSpacingCssSingle,
    getSpacingStyle,
} from "@tableberg/shared/utils/styling-helpers";
import { TablebergBlockAttrs } from "@tableberg/shared/types";

export function getStyles({
    cellPadding,
    cellSpacing,
    enableInnerBorder,
    innerBorder,
    cellBorderRadius,
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
    blockSpacing,
}: TablebergBlockAttrs) {
    const cellSpacingCSS: any = getSpacingCss(cellSpacing);
    let tableInnerBorder: any = {};

    if (enableInnerBorder) {
        tableInnerBorder = getBorderVariablesCss(innerBorder, "inner");
    }
    

    if (!cellSpacingCSS.top || cellSpacingCSS.top == '0') {
        tableInnerBorder["--tableberg-inner-border-top"] = "none";
        tableInnerBorder["--tableberg-inner-border-top-first"] = tableInnerBorder["--tableberg-inner-border-bottom"];
    }
    if (!cellSpacingCSS.left || cellSpacingCSS.left == '0') {
        tableInnerBorder["--tableberg-inner-border-left-first"] = tableInnerBorder["--tableberg-inner-border-right"];
        tableInnerBorder["--tableberg-inner-border-left"] = "none";
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
        "--tableberg-block-spacing": getSpacingCssSingle(blockSpacing),
        "border-spacing": `${cellSpacingCSS?.left || 0} ${
            cellSpacingCSS?.top || 0
        }`,
        ...tableInnerBorder,
        ...getSpacingStyle(cellPadding, "--tableberg-cell-padding"),
        ...getBorderRadiusVar(cellBorderRadius, "--tableberg-cell"),
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
