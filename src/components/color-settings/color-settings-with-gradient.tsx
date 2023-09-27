/**
 * WordPress Dependencies
 */

import { useDispatch, useSelect } from "@wordpress/data";
import { __ } from "@wordpress/i18n";
import {
    // @ts-ignore
    useBlockEditContext,
    // @ts-ignore
    __experimentalColorGradientSettingsDropdown as ColorGradientSettingsDropdown,
    // @ts-ignore
    __experimentalUseMultipleOriginColorsAndGradients as useMultipleOriginColorsAndGradients,
} from "@wordpress/block-editor";
import { ColorSettingsWithGradientPropTypes } from "../types";

/**
 *
 * @param {object} props - Color settings with gradients props
 * @param {string} props.label - Component Label
 * @param {string} props.attrBackgroundKey - Attribute key for background color
 * @param {string} props.attrGradientKey - Attribute key for gradient background color
 *
 */
function ColorSettingWithGradient({
    attrBackgroundKey,
    attrGradientKey,
    label,
}: ColorSettingsWithGradientPropTypes) {
    const { clientId } = useBlockEditContext();
    const { updateBlockAttributes } = useDispatch("core/block-editor");

    // @ts-ignore
    const attributes = useSelect((select) => {
        // @ts-ignore
        return select("core/block-editor").getBlockAttributes(clientId);
    });
    // @ts-ignore
    const setAttributes = (newAttributes) =>
        updateBlockAttributes(clientId, newAttributes);
    const colorGradientSettings = useMultipleOriginColorsAndGradients();
    // @ts-ignore
    const { defaultColors, defaultGradients } = useSelect((select) => {
        return {
            defaultColors:
                // @ts-ignore
                select("core/block-editor")?.getSettings()
                    ?.__experimentalFeatures?.color?.palette?.default,

            defaultGradients:
                // @ts-ignore
                select("core/block-editor")?.getSettings()
                    ?.__experimentalFeatures?.color?.gradients?.default,
        };
    });

    return (
        <ColorGradientSettingsDropdown
            {...colorGradientSettings}
            enableAlpha
            panelId={clientId}
            title={__("Color Settings", "gutenberghub-tabs")}
            popoverProps={{
                placement: "left start",
            }}
            settings={[
                {
                    clearable: true,
                    resetAllFilter: () =>
                        setAttributes({
                            [attrBackgroundKey]: null,
                            [attrGradientKey]: null,
                        }),
                    colorValue: attributes[attrBackgroundKey],
                    gradientValue: attributes[attrGradientKey],
                    colors: defaultColors,
                    gradients: defaultGradients,
                    label: label,
                    onColorChange: (newValue: string | null) =>
                        setAttributes({
                            [attrBackgroundKey]: newValue,
                        }),
                    onGradientChange: (newValue: string | null) =>
                        setAttributes({
                            [attrGradientKey]: newValue,
                        }),
                },
            ]}
        />
    );
}

export default ColorSettingWithGradient;
