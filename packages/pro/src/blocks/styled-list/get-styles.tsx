import { omitBy, isUndefined, trim, isEmpty } from "lodash";
import { getSpacingCss } from "../../utils/styling-helpers";

export function getStyles(attributes: any) {
    const { padding, margin, backgroundColor } = attributes;
    const paddingObj: any = getSpacingCss(padding || {});
    const marginObj: any = getSpacingCss(margin || {});

    let styles = {
        backgroundColor: backgroundColor,
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
        (value) =>
            value === false ||
            isEmpty(value) ||
            isUndefined(value) ||
            trim(value) === "" ||
            trim(value) === "undefined undefined undefined",
    );
}
