import { omitBy, isUndefined, trim, isEmpty } from "lodash";
import { getSpacingCss, getSpacingCssSingle } from "../../utils/styling-helpers";
import { StyledListProps } from ".";
import { StyledListItemProps } from "./styled-list-item";

export function getStyles(attributes: StyledListProps) {
    const { listSpacing, listIndent, backgroundColor } = attributes;
    const listSpacingObj: any = getSpacingCss(listSpacing || {});


    let styles: Record<string, any> = {
        backgroundColor: backgroundColor,
        color: attributes.textColor,
        fontSize: attributes.fontSize,
        paddingTop: listSpacingObj?.top,
        paddingRight: listSpacingObj?.right,
        paddingBottom: listSpacingObj?.bottom,
        "--tableberg-styled-list-icon-size": `${attributes.iconSize || 15}px`,
        "--tableberg-styled-list-icon-color": attributes.iconColor,
        "--tableberg-styled-list-icon-spacing": getSpacingCssSingle(attributes.iconSpacing),
        "--tableberg-styled-list-inner-spacing": getSpacingCssSingle(listIndent),
    };

    const paddingLeft = listSpacingObj?.left;

    if (attributes.isOrdered || !attributes.icon) {
        
        styles["list-style"] = attributes.listStyle || "auto";
        if (!paddingLeft || paddingLeft == "0") {
            styles["paddingLeft"] = "1em";
        } else {
            styles["paddingLeft"] = `calc(1em + ${paddingLeft})`;
        }
    } else {
        styles["paddingLeft"] = paddingLeft;
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

export function getItemStyles(attributes: StyledListItemProps, listAttrs: StyledListProps) {
    let styles: Record<string, any> = {
        color: attributes.textColor,
        fontSize: attributes.fontSize,
        marginBottom: getSpacingCssSingle(listAttrs.itemSpacing),
        "--tableberg-styled-list-icon-color": attributes.iconColor,
    };



    if (attributes.iconSize! > 0) {
        styles[
            "--tableberg-styled-list-icon-size"
        ] = `${attributes.iconSize}px`;
    }
    if (attributes.iconSpacing) {
        styles[
            "--tableberg-styled-list-icon-spacing"
        ] = getSpacingCssSingle(attributes.iconSpacing);
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
