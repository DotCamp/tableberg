import { getSpacingCssSingle } from "../../utils/styling-helpers";
import { ToggleBlockTypes } from "./";

function validateValues(styles: Object) {
    return Object.fromEntries(
        Object.entries(styles).filter(([key, value]) => {
            return (
                value !== false &&
                value !== undefined &&
                value !== null &&
                (typeof value !== "string" || value.trim() !== "") &&
                value !== "undefined undefined undefined"
            );
        }),
    );
}

function getBorderRadiusCss(input: string) {
    const varMatch = input.match(/var\(--.*--(\d+)\)/);
    if (varMatch) {
        return `${varMatch[1]}px`;
    }

    return input;
}

export function getStyles(attributes: ToggleBlockTypes) {
    const { activeTabTextColor, activeTabBackgroundColor } = attributes;

    const styles = {
        "--tableberg-tab-active-text-color": activeTabTextColor,
        "--tableberg-tab-active-background-color": activeTabBackgroundColor,
    };

    return validateValues(styles);
}

export function getSpacingUnderTabs(attributes: ToggleBlockTypes) {
    const { gap } = attributes;
    const spacingUnderTabsCss = getSpacingCssSingle(gap);

    const styles = {
        "margin-bottom": spacingUnderTabsCss,
    };

    const filteredStyles = validateValues(styles);

    return filteredStyles;
}

export function getInactiveTabHeadingStyles(attributes: ToggleBlockTypes) {
    const {
        tabBorderRadius,
        inactiveTabTextColor,
        inactiveTabBackgroundColor,
    } = attributes;

    const tabBorderRadiusCss = getSpacingCssSingle(tabBorderRadius);

    const styles = {
        "background-color": inactiveTabBackgroundColor,
        "border-radius": getBorderRadiusCss(tabBorderRadiusCss || ""),
        color: inactiveTabTextColor,
    };

    const filteredStyles = validateValues(styles);

    return filteredStyles;
}

export function getActiveTabHeadingStyles(attributes: ToggleBlockTypes) {
    const { tabBorderRadius, activeTabTextColor, activeTabBackgroundColor } =
        attributes;

    const tabBorderRadiusCss = getSpacingCssSingle(tabBorderRadius);

    const styles = {
        "background-color": activeTabBackgroundColor,
        "border-radius": getBorderRadiusCss(tabBorderRadiusCss || ""),
        color: activeTabTextColor,
    };
    const filteredStyles = validateValues(styles);

    return filteredStyles;
}
