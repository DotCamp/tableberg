import { omitBy, isUndefined, trim, isEmpty } from "lodash";
import { getBorderVariablesCss, getSpacingCss } from "../utils/styling-helpers";
import {
    getBorderCSS,
    getBorderRadiusVar,
    getSpacingCssSingle,
    getSpacingStyle,
} from "@tableberg/shared/utils/styling-helpers";
import { TablebergBlockAttrs } from "@tableberg/shared/types";

export function getStyles(attributes: TablebergBlockAttrs) {
    const {
        cellPadding,
        cellSpacing,
        enableInnerBorder,
        innerBorder,
        tableBorder,
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
    } = attributes;
    const cellSpacingCSS: any = getSpacingCss(cellSpacing);
    const tableInnerBorder = enableInnerBorder
        ? getBorderVariablesCss(innerBorder, "inner")
        : {};

    let spacingDependantStyles: Record<string, any> = {};

    let borderCollapse = true;

    if (cellBorderRadius) {
        for (const side in cellBorderRadius) {
            if (cellBorderRadius[side] !== "0px") {
                borderCollapse = false;
                break;
            }
        }
    }

    if (
        (cellSpacingCSS?.top ?? "0") !== "0" ||
        (cellSpacingCSS.left ?? "0") !== "0"
    ) {
        spacingDependantStyles = {
            "border-spacing": `${cellSpacingCSS?.left || 0} ${
                cellSpacingCSS?.top || 0
            }`,
        };
        borderCollapse = false;
    }

    let styles: Record<string, any> = {
        color: fontColor,
        "font-size": fontSize,
        "border-collapse": borderCollapse ? "collapse" : "separate",
        ...getBorderCSS(tableBorder),
        "--tableberg-global-link-color": linkColor,
        "--tableberg-header-bg":
            headerBackgroundGradient || headerBackgroundColor,
        "--tableberg-footer-bg":
            footerBackgroundGradient || footerBackgroundColor,
        "--tableberg-odd-bg": oddRowBackgroundGradient || oddRowBackgroundColor,
        "--tableberg-even-bg":
            evenRowBackgroundGradient || evenRowBackgroundColor,
        "--tableberg-block-spacing": getSpacingCssSingle(attributes.blockSpacing),
        ...spacingDependantStyles,
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
