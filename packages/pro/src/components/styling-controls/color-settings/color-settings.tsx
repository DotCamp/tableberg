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
import { ColorSettingsPropTypes } from "../types";

/**
 *
 * @param {object} props - Color settings props
 * @param {string} props.label - Component Label
 * @param {string} props.attrKey - Attribute key for color
 *
 */
function ColorSetting({ attrKey, label }: ColorSettingsPropTypes) {
    const { clientId } = useBlockEditContext();
    const { updateBlockAttributes } = useDispatch("core/block-editor");

    // @ts-ignore
    const attributes = useSelect((select) => {
        // @ts-ignore
        return select("core/block-editor").getBlockAttributes(clientId);
    });

    const setAttributes = (newAttributes: object) =>
        updateBlockAttributes(clientId, newAttributes);
    const colorGradientSettings = useMultipleOriginColorsAndGradients();
    // @ts-ignore
    const { defaultColors } = useSelect((select) => {
        return {
            defaultColors:
                // @ts-ignore
                select("core/block-editor")?.getSettings()
                    ?.__experimentalFeatures?.color?.palette?.default,
        };
    });

    return (
        <ColorGradientSettingsDropdown
            {...colorGradientSettings}
            enableAlpha
            panelId={clientId}
            title={__("Color Settings", "tableberg")}
            popoverProps={{
                placement: "left start",
            }}
            settings={[
                {
                    clearable: true,
                    resetAllFilter: () =>
                        setAttributes({
                            [attrKey]: null,
                        }),
                    colorValue: attributes[attrKey],
                    colors: defaultColors,
                    label: label,
                    onColorChange: (newValue: string | null) =>
                        setAttributes({ [attrKey]: newValue }),
                },
            ]}
        />
    );
}

export default ColorSetting;
