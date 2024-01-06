/**
 * WordPress Dependencies
 */
import { isEmpty } from "lodash";
import { __ } from "@wordpress/i18n";
import {
    useBlockEditContext,
    __experimentalBorderRadiusControl as BorderRadiusControl,
    store as BlockEditorStore,
} from "@wordpress/block-editor";
import { useSelect, useDispatch } from "@wordpress/data";
import {
    BaseControl,
    __experimentalToolsPanelItem as ToolsPanelItem,
    __experimentalBorderBoxControl as BorderBoxControl,
} from "@wordpress/components";

import type { BorderControlPropTypes } from "../types";
import {
    BlockEditorStoreActions,
    BlockEditorStoreSelectors,
} from "../../wordpress__data";

export function splitBorderRadius(value: string | object) {
    const isValueMixed = typeof value === "string";
    const splittedBorderRadius = {
        topLeft: value,
        topRight: value,
        bottomLeft: value,
        bottomRight: value,
    };
    return isValueMixed ? splittedBorderRadius : value;
}

function BorderControl({
    borderLabel,
    attrBorderKey,
    borderRadiusLabel,
    attrBorderRadiusKey,
    showBorder = true,
    showBorderRadius = true,
    showDefaultBorder = false,
    showDefaultBorderRadius = false,
}: BorderControlPropTypes) {
    const { clientId } = useBlockEditContext();
    const attributes = useSelect(
        (select) =>
            (
                select(BlockEditorStore) as BlockEditorStoreSelectors
            ).getSelectedBlock()?.attributes,
        []
    )!;
    const { updateBlockAttributes } = useDispatch(
        BlockEditorStore
    ) as BlockEditorStoreActions;
    const setAttributes = (newAttributes: object) => {
        updateBlockAttributes(clientId, newAttributes);
    };

    const { defaultColors } = useSelect((select) => {
        return {
            defaultColors: (
                select(BlockEditorStore) as BlockEditorStoreSelectors
            ).getSettings()?.__experimentalFeatures?.color?.palette?.default,
        };
    }, []);
    return (
        <>
            {showBorder && (
                <ToolsPanelItem
                    panelId={clientId}
                    isShownByDefault={showDefaultBorder}
                    resetAllFilter={() =>
                        setAttributes({
                            [attrBorderKey]: {},
                        })
                    }
                    hasValue={() => !isEmpty(attributes[attrBorderKey])}
                    label={borderLabel}
                    onDeselect={() => {
                        setAttributes({ [attrBorderKey]: {} });
                    }}
                >
                    <BorderBoxControl
                        enableAlpha
                        size={"__unstable-large"}
                        colors={defaultColors}
                        label={borderLabel}
                        onChange={(newBorder) => {
                            setAttributes({ [attrBorderKey]: newBorder });
                        }}
                        value={attributes[attrBorderKey]}
                    />
                </ToolsPanelItem>
            )}

            {showBorderRadius && (
                <ToolsPanelItem
                    panelId={clientId}
                    isShownByDefault={showDefaultBorderRadius}
                    resetAllFilter={() =>
                        setAttributes({
                            [attrBorderRadiusKey]: {},
                        })
                    }
                    label={borderRadiusLabel}
                    hasValue={() => !isEmpty(attributes[attrBorderRadiusKey])}
                    onDeselect={() => {
                        setAttributes({ [attrBorderRadiusKey]: {} });
                    }}
                >
                    <BaseControl.VisualLabel as="legend">
                        {borderRadiusLabel}
                    </BaseControl.VisualLabel>
                    <div className="tableberg-custom-border-radius-control">
                        <BorderRadiusControl
                            values={attributes[attrBorderRadiusKey]}
                            onChange={(newBorderRadius: any) => {
                                const splitted =
                                    splitBorderRadius(newBorderRadius);

                                setAttributes({
                                    [attrBorderRadiusKey]: splitted,
                                });
                            }}
                        />
                    </div>
                </ToolsPanelItem>
            )}
        </>
    );
}

export default BorderControl;
