import { omitBy, isUndefined, trim, isEmpty } from "lodash";
import {
    getSpacingCss,
    getSpacingCssSingle,
} from "../../utils/styling-helpers";
import { StyledListProps } from ".";
import { StyledListItemProps } from "./styled-list-item";

export function getStyles(attributes: StyledListProps) {
    const { listSpacing, listIndent, backgroundColor } = attributes;
    const listSpacingObj: any = getSpacingCss(listSpacing || {});

    let styles: Record<string, any> = {
        backgroundColor: backgroundColor,
        color: attributes.textColor,
        fontSize: attributes.fontSize,
        textAlign: attributes.alignment,
        paddingTop: listSpacingObj?.top,
        paddingRight: listSpacingObj?.right,
        paddingBottom: listSpacingObj?.bottom,
        "--tableberg-styled-list-icon-size": attributes.iconSize,
        "--tableberg-styled-list-icon-color": attributes.iconColor,
        "--tableberg-styled-list-icon-spacing": getSpacingCssSingle(
            attributes.iconSpacing,
        ),
        "--tableberg-styled-list-inner-spacing":
            getSpacingCssSingle(listIndent),
    };

    styles["paddingLeft"] = listSpacingObj?.left;

    return omitBy(
        styles,
        (value) =>
            value === false ||
            isEmpty(value) ||
            isUndefined(value) ||
            trim(value) === "" ||
            trim(value) === "undefined undefined undefined",
    );
}

export function getItemStyles(
    attributes: StyledListItemProps,
    listAttrs: StyledListProps,
) {
    let styles: Record<string, any> = {
        color: attributes.textColor,
        fontSize: attributes.fontSize,
        marginBottom: getSpacingCssSingle(listAttrs.itemSpacing),
        "--tableberg-styled-list-icon-color": attributes.iconColor,
        "--tableberg-styled-list-icon-size": attributes.iconSize,
    };

    if (attributes.iconSpacing) {
        styles["--tableberg-styled-list-icon-spacing"] = getSpacingCssSingle(
            attributes.iconSpacing,
        );
    }

    return omitBy(
        styles,
        (value) =>
            value === false ||
            isEmpty(value) ||
            isUndefined(value) ||
            trim(value) === "" ||
            trim(value) === "undefined undefined undefined",
    );
}
