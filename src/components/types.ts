import { IconType } from "@wordpress/components";
import { ReactElement } from "react";

export interface BorderControlPropTypes {
    borderLabel?: string;
    attrBorderKey?: string;
    borderRadiusLabel?: string;
    attrBorderRadiusKey?: string;
    showBorder?: boolean;
    showBorderRadius?: boolean;
    showDefaultBorder?: boolean;
    showDefaultBorderRadius?: boolean;
}
export interface ToggleGroupControlPropTypes {
    label: string;
    options: Array<OptionObject>; // Use the defined OptionObject interface
    attributeKey: string;
    isBlock?: boolean;
    isAdaptiveWidth?: boolean;
    isDeselectable?: boolean;
}

export interface OptionObject {
    value: string;
    icon: ReactElement; // You can specify the type for the icon property as needed
    label: string;
}
export interface SpacingPropTypes {
    label: string;
    attrKey: string;
    showByDefault?: boolean;
}
export interface ColorSettingsWithGradientPropTypes {
    label: string;
    attrBackgroundKey: string;
    attrGradientKey: string;
}
export interface ColorSettingsPropTypes {
    label: string;
    attrKey: string;
}
