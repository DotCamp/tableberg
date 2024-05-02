//@ts-ignore
import { omitBy, isUndefined, trim, isEmpty } from "lodash";
import { getSpacingCss } from "../../utils/styling-helpers";
import { StarRatingProps } from ".";

export function getStyles(attributes: StarRatingProps) {
    const { padding, margin } = attributes;
    const paddingObj: any = getSpacingCss(padding);
    const marginObj: any = getSpacingCss(margin);

    let styles = {
        paddingTop: paddingObj?.top,
        paddingRight: paddingObj?.right,
        paddingBottom: paddingObj?.bottom,
        paddingLeft: paddingObj?.left,
        marginTop: marginObj?.top,
        marginRight: marginObj?.right,
        marginBottom: marginObj?.bottom,
        marginLeft: marginObj?.left,
    };
    return omitBy(
        styles,
        (value: any) =>
            value === false ||
            isEmpty(value) ||
            isUndefined(value) ||
            trim(value) === "" ||
            trim(value) === "undefined undefined undefined",
    );
}
