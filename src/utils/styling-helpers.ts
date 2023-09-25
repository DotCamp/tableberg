// @ts-ignore
import { isEmpty, has } from "lodash";
import { __experimentalHasSplitBorders as hasSplitBorders } from "@wordpress/components";

interface SingleBorderTypes {
    width?: string;
    style?: string;
    color?: string;
}
interface BorderTypes {
    top?: SingleBorderTypes;
    right?: SingleBorderTypes;
    bottom?: SingleBorderTypes;
    left?: SingleBorderTypes;
}

export const getBorderCSS = (object: object) => {
    let borders: BorderTypes = {};

    if (!hasSplitBorders(object)) {
        borders["top"] = object;
        borders["right"] = object;
        borders["bottom"] = object;
        borders["left"] = object;
        return borders;
    }
    return object;
};

export function getSingleSideBorderValue(
    border: BorderTypes,
    side: keyof BorderTypes
) {
    const { width = "", style = "", color = "" } = border[side] || {};
    if (isEmpty(width)) {
        return "";
    }
    const borderWidth = width || "0";
    const borderStyle = isEmpty(style) ? "solid" : style;

    return `${borderWidth} ${borderStyle} ${color}`;
}
