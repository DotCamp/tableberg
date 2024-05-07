import {
    // @ts-ignore
    isValueSpacingPreset,
} from "@wordpress/block-editor";
import { kebabCase } from "lodash";
import { HTMLAttributes } from "react";

export type StyleAttr = NonNullable<HTMLAttributes<HTMLDivElement>["style"]>;
export interface Spacing {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
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

export function getSpacingCss(object: object): Spacing {
    const css: Spacing = {};
    //@ts-ignore
    for (const [key, value] of Object.entries(object)) {
        if (isValueSpacingPreset(value)) {
            //@ts-ignore
            css[key] = getSpacingPresetCssVar(value);
        } else {
            //@ts-ignore
            css[key] = value;
        }
    }
    return css;
}

export function getSpacingStyle(object: any, prefix: string): StyleAttr {
    if (!object) {
        return {};
    }

    const css: StyleAttr = {};
    for (const side in object) {
        const val = object[side];
        // @ts-ignore
        css[`${prefix}-${side}`] = isValueSpacingPreset(val)
            ? getSpacingPresetCssVar(val)
            : val;
    }

    return css;
}

export function getSpacingCssSingle(value: string) {
    if (isValueSpacingPreset(value)) {
        return getSpacingPresetCssVar(value);
    } else {
        return value;
    }
}

export const getBorderCSS = (object: any): StyleAttr => {
    if (!object) {
        return {};
    }
    if (typeof object === "string") {
        return {
            border: object,
        };
    }
    if (object.color || object.width) {
        return {
            borderWidth: object.width,
            borderColor: object.color,
        };
    }

    const css: StyleAttr = {};

    ["top", "right", "bottom", "left"].forEach((side) => {
        const sideVal = object[side];
        if (sideVal) {
            // @ts-ignore
            css[`border-${side}-width`] = sideVal.width;
            // @ts-ignore
            css[`border-${side}-color`] = sideVal.color;
        }
    });

    return css;
};

export const getBorderRadiusCSS = (object: any): StyleAttr => {
    if (!object) {
        return {};
    }
    if (typeof object === "string") {
        return {
            borderRadius: object,
        };
    }
    const css: StyleAttr = {};
    for (const corner in object) {
        const uCorner = corner.charAt(0).toUpperCase() + corner.slice(1);
        // @ts-ignore
        css[`border${uCorner}Radius`] = object[corner];
    }
    return css;
};

export const getBorderRadiusVar = (
    object: any,
    prefix: string,
): StyleAttr => {
    if (!object) {
        return {};
    }
    if (typeof object === "string") {
        return {
            [prefix + "-top-left"]: object,
            [prefix + "-top-right"]: object,
            [prefix + "-bottom-left"]: object,
            [prefix + "-bottom-right"]: object,
        } as any;
    }
    const css: StyleAttr = {};
    for (const corner in object) {
        const kCorner = kebabCase(corner);
        // @ts-ignore
        css[prefix + `-${kCorner}`] = object[corner];
    }
    return css;
};
