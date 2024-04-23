import {
    // @ts-ignore
    isValueSpacingPreset,
} from "@wordpress/block-editor";


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
    let css = {};
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


export function getSpacingCssSingle(value: string) {
    if (isValueSpacingPreset(value)) {
        return getSpacingPresetCssVar(value);
    } else {
        return value;
    }
}
