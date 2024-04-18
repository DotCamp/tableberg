import { omitBy, isUndefined, trim, isEmpty } from "lodash";
import { getSpacingCss } from "../../utils/styling-helpers";
import { StyledListProps } from ".";
import { StyledListItemProps } from "./styled-list-item";

export function getStyles(attributes: StyledListProps) {
    const { listSpacing, listIndent, backgroundColor } = attributes;
    const listSpacingObj: any = getSpacingCss(listSpacing || {});
    const listIndentObj: any = getSpacingCss(listIndent || {});

    if (listIndentObj.left == "0") {
        listIndentObj.left = "10px";
    }

    let styles: Record<string, any> = {
        backgroundColor: backgroundColor,
        color: attributes.textColor,
        fontSize: attributes.fontSize,
        paddingTop: listSpacingObj?.top,
        paddingRight: listSpacingObj?.right,
        paddingBottom: listSpacingObj?.bottom,
        "--tableberg-styled-list-icon-size": `${attributes.iconSize || 15}px`,
        "--tableberg-styled-list-icon-color": attributes.iconColor,
        "--tableberg-styled-list-icon-spacing": `${
            attributes.iconSpacing || 5
        }px`,
        "--tableberg-styled-list-inner-spacing": listIndentObj?.left,
    };

    const paddingLeft = listSpacingObj?.left;

    if (attributes.isOrdered || !attributes.icon) {
        styles["list-style"] = attributes.listStyle || "auto";
        if (paddingLeft == "0") {
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
    const itemSpacingObj: any = getSpacingCss(listAttrs.itemSpacing || {});
    let styles: Record<string, any> = {
        color: attributes.textColor,
        fontSize: attributes.fontSize,
        marginBottom: itemSpacingObj?.bottom,
        "--tableberg-styled-list-icon-color": attributes.iconColor,
    };



    if (attributes.iconSize! > 0) {
        styles[
            "--tableberg-styled-list-icon-size"
        ] = `${attributes.iconSize}px`;
    }
    if (attributes.iconSpacing! > 0) {
        styles[
            "--tableberg-styled-list-icon-spacing"
        ] = `${attributes.iconSpacing}px`;
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
