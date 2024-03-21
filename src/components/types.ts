export type SpacingControlSides = "top" | "right" | "bottom" | "left" | "vertical" | "horizontal"

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
