/**
 * WordPress Dependencies
 */

import { useDispatch, useSelect } from "@wordpress/data";
import { __ } from "@wordpress/i18n";
import {
    useBlockEditContext,
    // @ts-ignore
    __experimentalColorGradientSettingsDropdown as ColorGradientSettingsDropdown,
    __experimentalUseMultipleOriginColorsAndGradients as useMultipleOriginColorsAndGradients,
    store as blockEditorStore,
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
    const { updateBlockAttributes } = useDispatch(
        blockEditorStore
    ) as BlockEditorStoreActions;

    const attributes = useSelect((select) => {
        return (
            select(blockEditorStore) as BlockEditorStoreSelectors
        ).getBlockAttributes(clientId);
    }, []);

    const setAttributes = (newAttributes: object) =>
        updateBlockAttributes(clientId, newAttributes);
    const colorGradientSettings = useMultipleOriginColorsAndGradients();

    const { defaultColors } = useSelect((select) => {
        return {
            defaultColors: (
                select(blockEditorStore) as BlockEditorStoreSelectors
            ).getSettings()?.__experimentalFeatures?.color?.palette?.default,
        };
    }, []);

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
