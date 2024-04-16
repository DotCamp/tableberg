import { omitBy, isUndefined, trim, isEmpty } from "lodash";
import { getSpacingCss } from "../../utils/styling-helpers";
import { StyledListProps } from ".";
import { StyledListItemProps } from "./styled-list-item";

export function getStyles(attributes: StyledListProps) {
    const { padding, margin, backgroundColor } = attributes;
    const paddingObj: any = getSpacingCss(padding || {});
    const marginObj: any = getSpacingCss(margin || {});

    let styles: Record<string, any> = {
        backgroundColor: backgroundColor,
        color: attributes.textColor,
        fontSize: attributes.fontSize,
        paddingTop: paddingObj?.top,
        paddingRight: paddingObj?.right,
        paddingBottom: paddingObj?.bottom,
        marginTop: marginObj?.top,
        marginRight: marginObj?.right,
        marginBottom: marginObj?.bottom,
        marginLeft: marginObj?.left,
        "--tableberg-styled-list-spacing": `${attributes.itemSpacing || 0}px`,
        "--tableberg-styled-list-icon-size": `${attributes.iconSize || 15}px`,
        "--tableberg-styled-list-icon-color": attributes.iconColor,
        "--tableberg-styled-list-icon-spacing": `${
            attributes.iconSpacing || 0
        }px`,
        "--tableberg-styled-list-inner-spacing": `${
            attributes.listSpacing || 5
        }px`,
    };

    if (attributes.isOrdered || !attributes.icon) {
        styles["list-style"] = attributes.listStyle || "auto";
        let paddingLeft = paddingObj?.left;
        if (paddingLeft == "0") {
            paddingLeft += "px";
        }
        styles["--tableberg-styled-list-padding-left"] = paddingLeft;
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

export function getItemStyles(attributes: StyledListItemProps) {
    
    let styles: Record<string, any> = {
        color: attributes.textColor,
        fontSize: attributes.fontSize,
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
