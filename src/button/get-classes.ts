//@ts-ignore
import { isUndefined, trim, isEmpty } from "lodash";
import { ButtonBlockTypes } from "./type";

export function getStyleClass(attributes: ButtonBlockTypes) {
    const {
        backgroundHoverColor,
        textHoverColor,
        backgroundHoverGradient,
        backgroundColor,
        textColor,
        backgroundGradient,
    } = attributes;
    const isValueEmpty = (value: any) => {
        return (
            isUndefined(value) ||
            value === false ||
            trim(value) === "" ||
            trim(value) === "undefined undefined undefined" ||
            isEmpty(value)
        );
    };

    return {
        "has-background-color":
            !isValueEmpty(backgroundColor) || !isValueEmpty(backgroundGradient),
        "has-hover-background-color":
            !isValueEmpty(backgroundHoverColor) ||
            !isValueEmpty(backgroundHoverGradient),
        "has-hover-text-color": !isValueEmpty(textHoverColor),
        "has-text-color": !isValueEmpty(textColor),
    };
}
