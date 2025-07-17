import { omitBy, isUndefined, trim, isEmpty } from "lodash";
import { ButtonBlockTypes } from "./type";

import { getSpacingCss } from "../utils/styling-helpers";

export function getStyles(attributes: ButtonBlockTypes) {
    const {
        backgroundColor,
        backgroundGradient,
        backgroundHoverColor,
        backgroundHoverGradient,
        textColor,
        textHoverColor,
    } = attributes;

    let computedBackgroundColor = backgroundColor
        ? backgroundColor
        : backgroundGradient;
    let computedBackgroundHoverColor = backgroundHoverColor
        ? backgroundHoverColor
        : backgroundHoverGradient;

    if (!computedBackgroundHoverColor) {
        computedBackgroundHoverColor = computedBackgroundColor;
    }

    let styles = {
        "--tableberg-button-text-color": textColor,
        "--tableberg-button-text-hover-color": isEmpty(textHoverColor)
            ? textColor
            : textHoverColor,
        "--tableberg-button-background-color": computedBackgroundColor,
        "--tableberg-button-hover-background-color":
            computedBackgroundHoverColor,
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

export function getInnerStyles(
    attributes: ButtonBlockTypes,
): Record<string, any> {
    const paddingCSS = getSpacingCss(attributes.padding);
    const styles = {
        "padding-top": paddingCSS?.top,
        "padding-left": paddingCSS?.left,
        "padding-bottom": paddingCSS?.bottom,
        "padding-right": paddingCSS?.right,
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
