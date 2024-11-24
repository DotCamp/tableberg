import { omitBy, isUndefined, isEmpty, trim } from "lodash";
import { getSpacingCssSingle } from "../../utils/styling-helpers";

export function getStyles(attributes: any) {
    const {
        gap,
        tabBorderRadius,
        activeTabIndicatorColor,
        activeTabTextColor,
        activeTabBackgroundColor,
        inactiveTabTextColor,
        inactiveTabBackgroundColor,
    } = attributes;

    const gapCss = getSpacingCssSingle(gap);
    const tabBorderRadiusCss = getSpacingCssSingle(tabBorderRadius);

    // Map attributes to CSS variables
    const styles = {
        "--tableberg-tab-gap": gapCss,
        "--tableberg-tab-border-radius": tabBorderRadiusCss,
        "--tableberg-tab-active-indicator-color": activeTabIndicatorColor,
        "--tableberg-tab-active-text-color": activeTabTextColor,
        "--tableberg-tab-active-background-color": activeTabBackgroundColor,
        "--tableberg-tab-inactive-text-color": inactiveTabTextColor,
        "--tableberg-tab-inactive-background-color": inactiveTabBackgroundColor,
    };

    // Filter out invalid values
    return omitBy(
        styles,
        (value: any) =>
            value === false || // Remove explicitly false values
            isEmpty(value) || // Remove empty values
            isUndefined(value) || // Remove undefined values
            trim(value) === "" || // Remove empty strings
            trim(value) === "undefined undefined undefined", // Remove specific invalid strings
    );
}
