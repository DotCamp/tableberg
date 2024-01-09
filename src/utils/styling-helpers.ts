import { isEmpty, has } from "lodash";
import { __experimentalHasSplitBorders as hasSplitBorders } from "@wordpress/components";
import { BorderTypes } from "./common-types";

export const getBorderCSS = (object: object) => {
    let borders: BorderTypes = {};

    if (!hasSplitBorders(object)) {
        borders["top"] = object;
        borders["right"] = object;
        borders["bottom"] = object;
        borders["left"] = object;
        return borders;
    }
    return object;
};

export function getSingleSideBorderValue(
    border: BorderTypes,
    side: keyof BorderTypes
) {
    const { width = "", style = "", color = "" } = border[side] || {};
    if (isEmpty(width)) {
        return "";
    }
    const borderWidth = width || "0";
    const borderStyle = isEmpty(style) ? "solid" : style;

    return `${borderWidth} ${borderStyle} ${color}`;
}

export function getBorderVariablesCss(border: object, slug: string) {
    const borderInFourDimension = getBorderCSS(border);
    const borderSides: Array<keyof BorderTypes> = [
        "top",
        "right",
        "bottom",
        "left",
    ];
    let borders: Record<string, any> = {};
    for (let i = 0; i < borderSides.length; i++) {
        const side = borderSides[i];
        const sideProperty = `--tableberg-${slug}-border-${side}`;
        const sideValue = getSingleSideBorderValue(borderInFourDimension, side);
        borders[sideProperty] = sideValue;
    }

    return borders;
}
/**
 *  Check values are mixed.
 * @param {any} values - value string or object
 * @returns true | false
 */
export function hasMixedValues(values = {}) {
    return typeof values === "string";
}
export function splitBorderRadius(value: string | object) {
    const isValueMixed = hasMixedValues(value);
    const splittedBorderRadius = {
        topLeft: value,
        topRight: value,
        bottomLeft: value,
        bottomRight: value,
    };
    return isValueMixed ? splittedBorderRadius : value;
}

/**
 * Checks is given value is a spacing preset.
 *
 * @param {string} value Value to check
 *
 * @return {boolean} Return true if value is string in format var:preset|spacing|.
 */
export function isValueSpacingPreset(value: string) {
    if (!value?.includes) {
        return false;
    }
    return value === "0" || value.includes("var:preset|spacing|");
}

/**
 * Converts a spacing preset into a custom value.
 *
 * @param {string} value Value to convert.
 *
 * @return {string | undefined} CSS var string for given spacing preset value.
 */
export function getSpacingPresetCssVar(value: string) {
    if (!value) {
        return;
    }

    const slug = value.match(/var:preset\|spacing\|(.+)/);

    if (!slug) {
        return value;
    }

    return `var(--wp--preset--spacing--${slug[1]})`;
}

export function getSpacingCss(object: object) {
    let css: { [key: string]: any } = {};
    for (const [key, value] of Object.entries(object)) {
        if (isValueSpacingPreset(value)) {
            css[key] = getSpacingPresetCssVar(value);
        } else {
            css[key] = value;
        }
    }
    return css;
}
