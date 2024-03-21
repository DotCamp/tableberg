export type SpacingControlSides = "top" | "right" | "bottom" | "left" | "vertical" | "horizontal"

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
export interface SpacingPropTypes {
    label: string;
    attrKey: string;
    showByDefault?: boolean;
    sides?: SpacingControlSides[];
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
