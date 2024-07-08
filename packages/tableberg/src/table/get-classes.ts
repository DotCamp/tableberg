import { TablebergBlockAttrs } from "@tableberg/shared/types";

export function getStyleClass(attributes: TablebergBlockAttrs) {
    const { enableInnerBorder } = attributes;

    return {
        "has-inner-border": enableInnerBorder,
    };
}
