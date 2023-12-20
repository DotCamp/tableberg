//@ts-ignore
import { omitBy, isUndefined, trim, isEmpty, isNumber } from "lodash";
import { ButtonBlockTypes } from "./type";

export function getStyles(attributes: ButtonBlockTypes) {
    const {
        backgroundColor,
        backgroundGradient,
        backgroundHoverColor,
        backgroundHoverGradient,
        textColor,
        textHoverColor,
    } = attributes;

    let styles = {
        "--tableberg-button-background-color": !isEmpty(backgroundColor)
            ? backgroundColor
            : backgroundGradient,
        "--tableberg-button-text-hover-color": textHoverColor,
        "--tableberg-button-text-color": textColor,
        "--tableberg-button-hover-background-color": !isEmpty(
            backgroundHoverColor
        )
            ? backgroundHoverColor
            : backgroundHoverGradient,
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
