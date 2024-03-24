/**
 * WordPress Dependencies
 */

import { useDispatch, useSelect } from "@wordpress/data";
import { __ } from "@wordpress/i18n";
import {
    useBlockEditContext,
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
export default function ColorSettingWithGradientSingle({
    attrKey,
    label,
}: ColorSettingsPropTypes) {
    const { clientId } = useBlockEditContext();
    const { updateBlockAttributes } = useDispatch(
        blockEditorStore
    ) as BlockEditorStoreActions;

    const attributes = useSelect((select) => {
        return (
            select(blockEditorStore) as BlockEditorStoreSelectors
        ).getBlockAttributes(clientId);
    }, [])!;
    const setAttributes = (newAttributes: Record<string, any>) =>
        updateBlockAttributes(clientId, newAttributes);
    const colorGradientSettings = useMultipleOriginColorsAndGradients();

    const { defaultColors, defaultGradients } = useSelect((select) => {
        return {
            defaultColors: (
                select(blockEditorStore) as BlockEditorStoreSelectors
            ).getSettings()?.__experimentalFeatures?.color?.palette?.default,

            defaultGradients: (
                select(blockEditorStore) as BlockEditorStoreSelectors
            ).getSettings()?.__experimentalFeatures?.color?.gradients?.default,
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
                    gradientValue: attributes[attrKey],
                    colors: defaultColors,
                    gradients: defaultGradients,
                    label: label,
                    onColorChange: (newValue: string | null) =>
                        newValue && setAttributes({
                            [attrKey]: newValue,
                        }),
                    onGradientChange: (newValue: string | null) =>
                        newValue && setAttributes({
                            [attrKey]: newValue,
                        }),
                },
            ]}
        />
    );
}

