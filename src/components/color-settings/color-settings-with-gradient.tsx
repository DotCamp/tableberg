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
import { ColorSettingsWithGradientPropTypes } from "../types";
import {
    BlockEditorStoreActions,
    BlockEditorStoreSelectors,
} from "../../wordpress__data";

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
    const { updateBlockAttributes } = useDispatch(
        blockEditorStore
    ) as BlockEditorStoreActions;

    const attributes = useSelect((select) => {
        return (
            select(blockEditorStore) as BlockEditorStoreSelectors
        ).getBlockAttributes(clientId);
    }, []);
    // @ts-ignore
    const setAttributes = (newAttributes) =>
        updateBlockAttributes(clientId, newAttributes);
    const colorGradientSettings = useMultipleOriginColorsAndGradients();
    console.log(colorGradientSettings);

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
