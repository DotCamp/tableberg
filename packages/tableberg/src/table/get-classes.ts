import { TablebergBlockAttrs } from "@tableberg/shared/types";
import { isUndefined, trim, isEmpty } from "lodash";

export function getStyleClass(attributes: TablebergBlockAttrs) {
    const { tableWidth, enableInnerBorder } = attributes;
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
        "has-table-width": !isValueEmpty(tableWidth),
        "has-inner-border": enableInnerBorder,
    };
}
